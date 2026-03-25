import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { CHARGE_CATEGORIES, getChargeItems, updateChargeItem, addClearingLog, type ChargeItem } from "@/lib/chargeItems";
import { supabase } from "@/integrations/supabase/client";
import StepLayout from "../StepLayout";

interface MindClearingStepProps {
  operatorId: string;
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const MindClearingStep = ({ operatorId, isCompleted, onAcknowledge, onContinue }: MindClearingStepProps) => {
  const queryClient = useQueryClient();
  const [expandedCharge, setExpandedCharge] = useState<string | null>(null);
  const [clearingLevel, setClearingLevel] = useState(5);
  const [clearingNotes, setClearingNotes] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["charge_items_operator", operatorId],
    queryFn: () => getChargeItems(operatorId),
  });

  // Realtime
  useQuery({
    queryKey: ["charge_items_rt", operatorId],
    queryFn: () => {
      const channel = supabase
        .channel(`op-charges-${operatorId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "charge_items", filter: `operator_id=eq.${operatorId}` }, () => {
          queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operatorId] });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
    staleTime: Infinity,
  });

  const clearMutation = useMutation({
    mutationFn: async (item: ChargeItem) => {
      await addClearingLog(item.id, operatorId, item.current_charge_level ?? item.charge_level, clearingLevel, clearingNotes || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operatorId] });
      setExpandedCharge(null);
      setClearingLevel(5);
      setClearingNotes("");
    },
  });

  const statusCycleMutation = useMutation({
    mutationFn: async (item: ChargeItem) => {
      const next = item.status === "not_started" ? "in_progress" : item.status === "in_progress" ? "cleared" : "not_started";
      await updateChargeItem(item.id, { status: next as any });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operatorId] }),
  });

  const priorityItems = items.filter(i => i.priority_rank !== null).sort((a, b) => (a.priority_rank || 0) - (b.priority_rank || 0));
  const grouped = CHARGE_CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.key),
    avgLevel: (() => {
      const catItems = items.filter(i => i.category === cat.key);
      if (catItems.length === 0) return 0;
      return Math.round(catItems.reduce((s, i) => s + (i.current_charge_level ?? i.charge_level), 0) / catItems.length);
    })(),
  })).filter(g => g.items.length > 0);

  const hasItems = items.length > 0;
  const statusIcon = (s: string) => s === "cleared" ? "✅" : s === "in_progress" ? "🟡" : "⬜";

  return (
    <StepLayout
      stepNumber={6}
      title="MIND CLEARING OPERATIONS"
      isCompleted={isCompleted}
      onAcknowledge={onAcknowledge}
      onContinue={onContinue}
      acknowledgmentText="I have reviewed my charge inventory and understand the mind clearing protocol"
      requireScroll={hasItems}
    >
      <div className="space-y-6">
        <div className="text-sm text-steel-white/90 leading-relaxed space-y-3">
          <p>Mind Clearing Operations form the foundation of your command effectiveness. These operations systematically identify and neutralize internal resistance points that prevent optimal performance.</p>
        </div>

        {isLoading ? (
          <p className="text-center font-mono text-xs text-slate-grey uppercase tracking-widest py-8">Loading charge inventory...</p>
        ) : !hasItems ? (
          <div className="directive-card text-center py-8">
            <p className="text-slate-grey text-sm">Your charge inventory has not been prepared yet.</p>
            <p className="text-xs text-slate-grey mt-1">Your Command Officer will add charges before your deployment call.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Priority Targets */}
            {priorityItems.length > 0 && (
              <div className="border-l-2 border-warning-red p-4 bg-warning-red/5 rounded-sm">
                <h3 className="font-heading text-xs uppercase tracking-wider text-warning-red mb-3">Priority Clearing Targets</h3>
                {priorityItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-1.5">
                    <span className="font-heading text-xs text-warning-red font-bold w-14">BIG #{item.priority_rank}</span>
                    <span className="text-sm text-steel-white/90 flex-1">{item.statement}</span>
                    <span className="font-mono text-[10px] text-command-gold">{item.current_charge_level ?? item.charge_level}/10</span>
                  </div>
                ))}
              </div>
            )}

            {/* Categories */}
            {grouped.map(group => (
              <div key={group.key} className="bg-tactical-steel rounded-sm border border-gunmetal/50">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{group.emoji}</span>
                    <span className="font-heading text-xs uppercase tracking-wider text-steel-white">{group.label}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-command-gold/20 flex items-center justify-center">
                    <span className="font-mono text-xs text-command-gold font-bold">{group.avgLevel}</span>
                  </div>
                </div>
                <div className="px-4 pb-3 space-y-2">
                  {group.items.map(item => (
                    <div key={item.id} className="bg-background rounded-sm border border-gunmetal/30">
                      <button
                        onClick={() => setExpandedCharge(expandedCharge === item.id ? null : item.id)}
                        className="w-full flex items-start gap-3 px-3 py-2.5 text-left"
                      >
                        <button
                          onClick={e => { e.stopPropagation(); statusCycleMutation.mutate(item); }}
                          className="mt-0.5 text-sm"
                        >
                          {statusIcon(item.status)}
                        </button>
                        <span className={`flex-1 text-sm leading-relaxed ${item.status === "cleared" ? "text-slate-grey line-through" : "text-steel-white/90"}`}>
                          {item.statement}
                        </span>
                        <span className="font-mono text-[10px] text-command-gold">{item.current_charge_level ?? item.charge_level}</span>
                        {expandedCharge === item.id ? <ChevronDown className="w-3 h-3 text-slate-grey mt-1" /> : <ChevronRight className="w-3 h-3 text-slate-grey mt-1" />}
                      </button>
                      {expandedCharge === item.id && (
                        <div className="px-3 pb-3 border-t border-gunmetal/30 pt-2 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-slate-grey">Original Level:</span> <span className="text-command-gold">{item.charge_level}/10</span></div>
                            <div><span className="text-slate-grey">Current Level:</span> <span className="text-command-gold">{item.current_charge_level ?? item.charge_level}/10</span></div>
                          </div>
                          <div className="p-2 bg-tactical-steel rounded-sm">
                            <p className="font-mono text-[10px] text-slate-grey uppercase tracking-widest mb-2">Log Clearing Session</p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-grey">Post-clearing level:</span>
                              <input
                                type="range"
                                min={0}
                                max={10}
                                value={clearingLevel}
                                onChange={e => setClearingLevel(Number(e.target.value))}
                                className="flex-1 accent-command-gold"
                              />
                              <span className="font-mono text-xs text-command-gold w-4">{clearingLevel}</span>
                            </div>
                            <input
                              value={clearingNotes}
                              onChange={e => setClearingNotes(e.target.value)}
                              placeholder="What shifted? (optional)"
                              className="w-full bg-background border border-gunmetal rounded-sm px-2 py-1.5 text-xs text-steel-white focus:outline-none focus:border-command-gold mb-2"
                            />
                            <button
                              onClick={() => clearMutation.mutate(item)}
                              disabled={clearMutation.isPending}
                              className="w-full py-1.5 bg-command-gold text-background text-xs font-heading uppercase tracking-widest rounded-sm hover:bg-command-gold/90 disabled:opacity-50"
                            >
                              {clearMutation.isPending ? "Logging..." : "Log Clearing"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Progress */}
            <div className="directive-card">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-grey">Charges Cleared</span>
                <span className="font-heading text-lg text-command-gold">
                  {items.filter(i => i.status === "cleared").length} / {items.length}
                </span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-gunmetal rounded-full overflow-hidden">
                <div
                  className="h-full bg-command-gold rounded-full transition-all"
                  style={{ width: `${(items.filter(i => i.status === "cleared").length / items.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
};

export default MindClearingStep;
