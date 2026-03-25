import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X, Star, MessageSquare, ChevronDown, ChevronRight, Sparkles, Loader2, Check, XCircle } from "lucide-react";
import { CHARGE_CATEGORIES, getChargeItems, addChargeItem, deleteChargeItem, updateChargeItem, type ChargeItem } from "@/lib/chargeItems";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type DraftCharge = {
  category: string;
  statement: string;
  chargeLevel: number;
  inferred: boolean;
  priorityRank?: number;
  accepted: boolean;
};

interface ChargeListManagerProps {
  operatorId: string;
  operatorName: string;
  onClose: () => void;
}

const ChargeListManager = ({ operatorId, operatorName, onClose }: ChargeListManagerProps) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>(CHARGE_CATEGORIES[0].key);
  const [newStatement, setNewStatement] = useState("");
  const [newChargeLevel, setNewChargeLevel] = useState(5);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [intakeText, setIntakeText] = useState("");
  const [drafts, setDrafts] = useState<DraftCharge[]>([]);
  const [showDraftReview, setShowDraftReview] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["charge_items", operatorId],
    queryFn: () => getChargeItems(operatorId),
  });

  // Realtime subscription
  useQuery({
    queryKey: ["charge_items_realtime", operatorId],
    queryFn: () => {
      const channel = supabase
        .channel(`charges-${operatorId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "charge_items", filter: `operator_id=eq.${operatorId}` }, () => {
          queryClient.invalidateQueries({ queryKey: ["charge_items", operatorId] });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
    staleTime: Infinity,
  });

  const addMutation = useMutation({
    mutationFn: () => addChargeItem(operatorId, selectedCategory, newStatement, newChargeLevel, items.filter(i => i.category === selectedCategory).length),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charge_items", operatorId] });
      setNewStatement("");
      setNewChargeLevel(5);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChargeItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charge_items", operatorId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateChargeItem>[1] }) => updateChargeItem(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charge_items", operatorId] }),
  });

  // AI generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      // Parse intake text as key-value pairs or raw text
      let intakeData: Record<string, string>;
      try {
        intakeData = JSON.parse(intakeText);
      } catch {
        // Treat as free-text intake
        intakeData = { raw_intake: intakeText };
      }

      const { data, error } = await supabase.functions.invoke("generate-charges", {
        body: { intakeData, operatorName },
      });

      if (error) throw new Error(error.message || "Failed to generate charges");
      if (data?.error) throw new Error(data.error);
      return data as { charges: DraftCharge[] };
    },
    onSuccess: (data) => {
      setDrafts(data.charges.map(c => ({ ...c, accepted: true })));
      setShowDraftReview(true);
      setShowIntakeForm(false);
    },
    onError: (err: Error) => {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  // Approve drafts mutation
  const approveDraftsMutation = useMutation({
    mutationFn: async () => {
      const accepted = drafts.filter(d => d.accepted);
      const catCounts: Record<string, number> = {};
      for (const d of accepted) {
        const sortOrder = catCounts[d.category] || 0;
        catCounts[d.category] = sortOrder + 1;
        await addChargeItem(operatorId, d.category, d.statement, d.chargeLevel, sortOrder);
      }
      // Set priority ranks after all items created
      const freshItems = await getChargeItems(operatorId);
      for (const d of accepted) {
        if (d.priorityRank) {
          const match = freshItems.find(i => i.statement === d.statement && i.category === d.category);
          if (match) await updateChargeItem(match.id, { priority_rank: d.priorityRank });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charge_items", operatorId] });
      setShowDraftReview(false);
      setDrafts([]);
      toast({ title: "Charges approved", description: "AI-generated charges have been added to the inventory." });
    },
  });

  const priorityItems = items.filter(i => i.priority_rank !== null).sort((a, b) => (a.priority_rank || 0) - (b.priority_rank || 0));
  const grouped = CHARGE_CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.key),
    avgLevel: (() => {
      const catItems = items.filter(i => i.category === cat.key);
      if (catItems.length === 0) return 0;
      return Math.round(catItems.reduce((s, i) => s + i.charge_level, 0) / catItems.length);
    })(),
  }));

  const setPriority = (item: ChargeItem, rank: number | null) => {
    // Clear existing priority if assigning to new item
    if (rank !== null) {
      const existing = items.find(i => i.priority_rank === rank && i.id !== item.id);
      if (existing) {
        updateMutation.mutate({ id: existing.id, updates: { priority_rank: null } });
      }
    }
    updateMutation.mutate({ id: item.id, updates: { priority_rank: rank } });
  };

  const saveNotes = (id: string) => {
    updateMutation.mutate({ id, updates: { command_notes: noteText || null } });
    setEditingNotes(null);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "cleared": return "text-field-green";
      case "in_progress": return "text-command-gold";
      default: return "text-slate-grey";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "cleared": return "✅";
      case "in_progress": return "🟡";
      default: return "⬜";
    }
  };

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="directive-card max-w-3xl w-full max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg uppercase tracking-wider text-command-gold">
              Charge Inventory
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-grey mt-1">
              {operatorName} · {items.length} charges · {items.filter(i => i.status === "cleared").length} cleared
            </p>
          </div>
          <button onClick={onClose} className="text-slate-grey hover:text-steel-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Generate Button */}
        {!showDraftReview && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowIntakeForm(!showIntakeForm)}
              className="flex items-center gap-2 px-3 py-2 bg-accent/20 border border-accent/30 text-accent rounded-sm hover:bg-accent/30 transition-colors font-heading text-xs uppercase tracking-widest"
            >
              <Sparkles className="w-4 h-4" />
              Generate from Intake
            </button>
          </div>
        )}

        {/* Intake Data Form */}
        {showIntakeForm && !showDraftReview && (
          <div className="mb-4 p-4 bg-background rounded-sm border border-accent/30 space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-accent">Paste Intake Form Data</h4>
            <p className="text-xs text-slate-grey">Paste the operator's intake form answers below. Can be JSON or free-text.</p>
            <textarea
              value={intakeText}
              onChange={e => setIntakeText(e.target.value)}
              placeholder={`{\n  "biggest_challenge": "Scaling my business past $500k",\n  "stress_level": "8/10",\n  "what_keeps_you_up": "Fear of going broke"\n}\n\nOr paste free-text intake notes...`}
              className="w-full h-40 bg-tactical-steel border border-gunmetal rounded-sm px-3 py-2 text-sm text-steel-white font-mono focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => generateMutation.mutate()}
                disabled={!intakeText.trim() || generateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-background font-heading text-xs uppercase tracking-widest rounded-sm hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Charges</>
                )}
              </button>
              <button
                onClick={() => setShowIntakeForm(false)}
                className="px-4 py-2 text-xs text-slate-grey hover:text-steel-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Draft Review Panel */}
        {showDraftReview && (
          <div className="mb-4 flex-1 overflow-y-auto">
            <div className="p-4 bg-background rounded-sm border border-accent/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  Review AI-Generated Charges ({drafts.filter(d => d.accepted).length}/{drafts.length} selected)
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDrafts(drafts.map(d => ({ ...d, accepted: true })))}
                    className="font-mono text-[10px] text-command-gold hover:text-steel-white"
                  >Select All</button>
                  <button
                    onClick={() => setDrafts(drafts.map(d => ({ ...d, accepted: false })))}
                    className="font-mono text-[10px] text-slate-grey hover:text-steel-white"
                  >Deselect All</button>
                </div>
              </div>
              <p className="text-xs text-slate-grey">Review and toggle charges before approving. Deselect any you don't want.</p>

              {CHARGE_CATEGORIES.map(cat => {
                const catDrafts = drafts.filter(d => d.category === cat.key);
                if (catDrafts.length === 0) return null;
                return (
                  <div key={cat.key} className="border border-gunmetal/30 rounded-sm">
                    <div className="flex items-center gap-2 px-3 py-2 bg-tactical-steel/30">
                      <span className="text-sm">{cat.emoji}</span>
                      <span className="font-heading text-xs uppercase tracking-wider text-steel-white">{cat.label}</span>
                      <span className="font-mono text-[10px] text-slate-grey">({catDrafts.length})</span>
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                      {catDrafts.map((draft, idx) => {
                        const globalIdx = drafts.indexOf(draft);
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 p-2 rounded-sm border transition-colors ${
                              draft.accepted ? "border-accent/30 bg-accent/5" : "border-gunmetal/20 bg-background opacity-50"
                            }`}
                          >
                            <button
                              onClick={() => {
                                const newDrafts = [...drafts];
                                newDrafts[globalIdx] = { ...draft, accepted: !draft.accepted };
                                setDrafts(newDrafts);
                              }}
                              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
                                draft.accepted ? "bg-accent border-accent text-background" : "border-gunmetal"
                              }`}
                            >
                              {draft.accepted && <Check className="w-3 h-3" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-steel-white/90">{draft.statement}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="font-mono text-[10px] text-command-gold">Level: {draft.chargeLevel}/10</span>
                                {draft.inferred && <span className="font-mono text-[10px] text-slate-grey italic">inferred</span>}
                                {draft.priorityRank && (
                                  <span className="font-mono text-[10px] text-warning-red font-bold">BIG #{draft.priorityRank}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => approveDraftsMutation.mutate()}
                  disabled={drafts.filter(d => d.accepted).length === 0 || approveDraftsMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 bg-command-gold text-background font-heading text-xs uppercase tracking-widest rounded-sm hover:bg-command-gold/90 disabled:opacity-50 transition-colors"
                >
                  {approveDraftsMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Approving...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Approve {drafts.filter(d => d.accepted).length} Charges</>
                  )}
                </button>
                <button
                  onClick={() => { setShowDraftReview(false); setDrafts([]); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-slate-grey hover:text-steel-white font-heading text-xs uppercase tracking-widest transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Discard All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Priority Clearing Targets */}
        {!showDraftReview && priorityItems.length > 0 && (
          <div className="mb-4 p-3 border-l-2 border-warning-red bg-warning-red/5 rounded-sm">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-warning-red mb-2">Priority Clearing Targets</h4>
            {priorityItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 py-1">
                <span className="font-heading text-xs text-warning-red font-bold w-14">BIG #{item.priority_rank}</span>
                <span className="text-sm text-steel-white/90 flex-1">{item.statement}</span>
                <span className="font-mono text-[10px] text-command-gold">{item.charge_level}/10</span>
              </div>
            ))}
          </div>
        )}

        {/* Add new charge */}
        <div className="mb-4 p-3 bg-background rounded-sm border border-gunmetal">
          <div className="flex gap-2 mb-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1.5 text-xs text-steel-white focus:outline-none focus:border-command-gold"
            >
              {CHARGE_CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-slate-grey">LVL</span>
              <input
                type="number"
                min={1}
                max={10}
                value={newChargeLevel}
                onChange={e => setNewChargeLevel(Number(e.target.value))}
                className="w-12 bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1.5 text-xs text-steel-white text-center focus:outline-none focus:border-command-gold"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={newStatement}
              onChange={e => setNewStatement(e.target.value)}
              placeholder={CHARGE_CATEGORIES.find(c => c.key === selectedCategory)?.prefix || "Enter charge statement..."}
              className="flex-1 bg-tactical-steel border border-gunmetal rounded-sm px-3 py-2 text-sm text-steel-white focus:outline-none focus:border-command-gold"
              onKeyDown={e => e.key === "Enter" && newStatement.trim() && addMutation.mutate()}
            />
            <button
              onClick={() => addMutation.mutate()}
              disabled={!newStatement.trim() || addMutation.isPending}
              className="px-3 py-2 bg-command-gold text-background rounded-sm hover:bg-command-gold/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Charge list by category */}
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
          {grouped.map(group => (
            <div key={group.key} className="border border-gunmetal/50 rounded-sm">
              <button
                onClick={() => setExpandedCategory(expandedCategory === group.key ? null : group.key)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-tactical-steel/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCategory === group.key ? <ChevronDown className="w-3 h-3 text-slate-grey" /> : <ChevronRight className="w-3 h-3 text-slate-grey" />}
                  <span className="text-sm">{group.emoji}</span>
                  <span className="font-heading text-xs uppercase tracking-wider text-steel-white">{group.label}</span>
                  <span className="font-mono text-[10px] text-slate-grey">({group.items.length})</span>
                </div>
                {group.items.length > 0 && (
                  <div className="w-7 h-7 rounded-full bg-command-gold/20 flex items-center justify-center">
                    <span className="font-mono text-xs text-command-gold font-bold">{group.avgLevel}</span>
                  </div>
                )}
              </button>
              {expandedCategory === group.key && group.items.length > 0 && (
                <div className="border-t border-gunmetal/30 px-3 py-2 space-y-1.5">
                  {group.items.map(item => (
                    <div key={item.id} className="bg-background rounded-sm border border-gunmetal/30 p-2.5">
                      <div className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">{statusIcon(item.status)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${statusColor(item.status)}`}>{item.statement}</p>
                          {item.command_notes && (
                            <p className="text-xs text-slate-grey mt-1 italic">📝 {item.command_notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="font-mono text-[10px] text-command-gold">{item.charge_level}</span>
                          {/* Priority toggle */}
                          <div className="relative group/priority">
                            <button
                              className={`p-1 rounded-sm transition-colors ${item.priority_rank ? "text-warning-red" : "text-gunmetal hover:text-slate-grey"}`}
                              onClick={() => {
                                if (item.priority_rank) {
                                  setPriority(item, null);
                                } else {
                                  const nextRank = [1, 2, 3].find(r => !items.some(i => i.priority_rank === r));
                                  if (nextRank) setPriority(item, nextRank);
                                }
                              }}
                            >
                              <Star className="w-3 h-3" fill={item.priority_rank ? "currentColor" : "none"} />
                            </button>
                          </div>
                          {/* Notes */}
                          <button
                            onClick={() => { setEditingNotes(item.id); setNoteText(item.command_notes || ""); }}
                            className="p-1 text-gunmetal hover:text-slate-grey rounded-sm transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="p-1 text-gunmetal hover:text-warning-red rounded-sm transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {/* Notes editor */}
                      {editingNotes === item.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Command notes (hidden from operator)..."
                            className="flex-1 bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1 text-xs text-steel-white focus:outline-none focus:border-command-gold"
                            onKeyDown={e => e.key === "Enter" && saveNotes(item.id)}
                            autoFocus
                          />
                          <button onClick={() => saveNotes(item.id)} className="px-2 py-1 bg-command-gold text-background text-xs rounded-sm">Save</button>
                          <button onClick={() => setEditingNotes(null)} className="px-2 py-1 text-xs text-slate-grey">Cancel</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Heatmap summary */}
        <div className="mt-4 pt-3 border-t border-gunmetal">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-grey mb-2">Charge Heatmap</h4>
          <div className="grid grid-cols-5 gap-1">
            {grouped.map(g => {
              const color = g.items.length === 0 ? "bg-gunmetal" :
                g.avgLevel >= 7 ? "bg-warning-red/60" :
                g.avgLevel >= 4 ? "bg-command-gold/60" :
                "bg-field-green/60";
              return (
                <div key={g.key} className={`${color} rounded-sm p-1.5 text-center`}>
                  <span className="text-xs">{g.emoji}</span>
                  <p className="font-mono text-[8px] text-steel-white/70 mt-0.5">{g.avgLevel || "—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargeListManager;
