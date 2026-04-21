import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getChargeItems, CHARGE_CATEGORIES, updateChargeItem, addClearingLog, deleteChargeItem, type ChargeItem } from "@/lib/chargeItems";
import { getRoadmapItems, toggleRoadmapComplete } from "@/lib/roadmap";
import { supabase } from "@/integrations/supabase/client";
import RoadmapView from "../roadmap/RoadmapView";
import { STEP_NAMES } from "@/data/onboardingContent";
import type { Operator } from "@/lib/operators";
import { ChevronDown, ChevronRight, ExternalLink, Trash2 } from "lucide-react";

interface OperatorDashboardProps {
  operator: Operator;
}

const OperatorDashboard = ({ operator }: OperatorDashboardProps) => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<"charges" | "roadmap" | "onboarding">("charges");
  const [expandedCharge, setExpandedCharge] = useState<string | null>(null);
  const [clearingLevel, setClearingLevel] = useState(5);
  const [clearingNotes, setClearingNotes] = useState("");

  const { data: charges = [] } = useQuery({
    queryKey: ["charge_items_operator", operator.id],
    queryFn: () => getChargeItems(operator.id),
  });

  // Realtime
  useQuery({
    queryKey: ["op_dash_charges_rt", operator.id],
    queryFn: () => {
      const channel = supabase
        .channel(`op-dash-${operator.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "charge_items", filter: `operator_id=eq.${operator.id}` }, () => {
          queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operator.id] });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
    staleTime: Infinity,
  });

  const priorityItems = charges.filter(c => c.priority_rank !== null).sort((a, b) => (a.priority_rank || 0) - (b.priority_rank || 0));
  const grouped = CHARGE_CATEGORIES.map(cat => ({
    ...cat,
    items: charges.filter(c => c.category === cat.key),
    avgLevel: (() => {
      const catItems = charges.filter(c => c.category === cat.key);
      return catItems.length > 0 ? Math.round(catItems.reduce((s, i) => s + (i.current_charge_level ?? i.charge_level), 0) / catItems.length) : 0;
    })(),
  })).filter(g => g.items.length > 0);

  const handleClearingLog = async (item: ChargeItem) => {
    await addClearingLog(item.id, operator.id, item.current_charge_level ?? item.charge_level, clearingLevel, clearingNotes || undefined);
    queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operator.id] });
    setExpandedCharge(null);
    setClearingLevel(5);
    setClearingNotes("");
  };

  const handleStatusCycle = async (item: ChargeItem) => {
    // Cycle: not_started → in_progress → cleared → not_started
    const next =
      item.status === "not_started" ? "in_progress" :
      item.status === "in_progress" ? "cleared" : "not_started";
    await updateChargeItem(item.id, {
      status: next as any,
      ...(next === "cleared"
        ? { is_cleared: true, cleared_at: new Date().toISOString() }
        : { is_cleared: false, cleared_at: null }),
    });
    queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operator.id] });
  };

  const handleDelete = async (item: ChargeItem) => {
    if (!confirm(`Delete this charge?\n\n"${item.statement}"`)) return;
    await deleteChargeItem(item.id);
    queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operator.id] });
  };

  const navItems = [
    { key: "charges" as const, label: "🎯 CHARGE INVENTORY" },
    { key: "roadmap" as const, label: "🗺️ DEPLOYMENT ROADMAP" },
    { key: "onboarding" as const, label: "📋 PRE-DEPLOYMENT" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="classified-strip">
        ⬛ CLASSIFIED — CMDR GROUP — OPERATOR PORTAL
      </div>

      {/* Nav */}
      <div className="border-b border-gunmetal">
        <div className="max-w-5xl mx-auto px-6 flex gap-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 ${
                activeSection === item.key ? "text-command-gold border-command-gold" : "text-slate-grey border-transparent hover:text-steel-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-xl uppercase tracking-wider text-steel-white">
            {operator.first_name} {operator.last_name}
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-grey mt-1">
            Commander's Passage Deployment Dashboard
          </p>
        </div>

        {activeSection === "charges" && (
          <div className="space-y-6">
            {/* Launch Clearing Room */}
            <button
              onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  const url = `https://mindclearingdrill.lovable.app/auth?access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
                  window.open(url, '_blank');
                } else {
                  window.open('https://mindclearingdrill.lovable.app/auth', '_blank');
                }
              }}
              className="w-full text-left border-l-4 border-command-gold bg-tactical-steel/60 hover:bg-tactical-steel transition-colors p-5 rounded-sm group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-heading text-base uppercase tracking-wider text-command-gold mb-1 flex items-center gap-2">
                    Launch Clearing Room
                    <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-steel-white/80 leading-relaxed">
                    Begin clearing charges with the full tactical toolkit. Use the same email and access code.
                  </p>
                </div>
              </div>
            </button>

            {/* Priority Targets */}
            {priorityItems.length > 0 && (
              <div className="border-l-2 border-warning-red p-4 bg-warning-red/5 rounded-sm">
                <h3 className="font-heading text-sm uppercase tracking-wider text-warning-red mb-3">Priority Clearing Targets</h3>
                {priorityItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <span className="font-heading text-sm text-warning-red font-bold w-16">BIG #{item.priority_rank}</span>
                    <span className="text-sm text-steel-white/90 flex-1">{item.statement}</span>
                    <span className="font-mono text-xs text-command-gold">{item.current_charge_level ?? item.charge_level}/10</span>
                  </div>
                ))}
              </div>
            )}

            {/* Categories */}
            {grouped.map(group => (
              <div key={group.key} className="directive-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{group.emoji}</span>
                    <span className="font-heading text-sm uppercase tracking-wider text-steel-white">{group.label}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-command-gold/20 flex items-center justify-center">
                    <span className="font-mono text-sm text-command-gold font-bold">{group.avgLevel}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {group.items.map(item => (
                    <div key={item.id} className="bg-background rounded-sm border border-gunmetal/30">
                      <button
                        onClick={() => setExpandedCharge(expandedCharge === item.id ? null : item.id)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left"
                      >
                        <button
                          onClick={e => { e.stopPropagation(); handleStatusCycle(item); }}
                          className="mt-0.5 text-sm flex-shrink-0 cursor-pointer hover:opacity-70"
                          title="Click to cycle status (untick by clicking again)"
                        >
                          {item.status === "cleared" ? "✅" : item.status === "in_progress" ? "🟡" : "⬜"}
                        </button>
                        <span className={`flex-1 text-sm leading-relaxed ${item.status === "cleared" ? "text-slate-grey line-through" : "text-steel-white/90"}`}>
                          {item.statement}
                        </span>
                        <span className="font-mono text-[10px] text-command-gold">{item.current_charge_level ?? item.charge_level}/10</span>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(item); }}
                          className="text-slate-grey hover:text-warning-red transition-colors mt-0.5 flex-shrink-0"
                          title="Delete charge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {expandedCharge === item.id ? <ChevronDown className="w-3 h-3 text-slate-grey mt-1" /> : <ChevronRight className="w-3 h-3 text-slate-grey mt-1" />}
                      </button>
                      {expandedCharge === item.id && (
                        <div className="px-4 pb-4 border-t border-gunmetal/30 pt-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-tactical-steel p-2 rounded-sm">
                              <span className="text-slate-grey block">Original Level</span>
                              <span className="text-command-gold text-lg font-bold">{item.charge_level}</span>
                            </div>
                            <div className="bg-tactical-steel p-2 rounded-sm">
                              <span className="text-slate-grey block">Current Level</span>
                              <span className="text-command-gold text-lg font-bold">{item.current_charge_level ?? item.charge_level}</span>
                            </div>
                          </div>
                          <div className="p-3 bg-tactical-steel rounded-sm">
                            <p className="font-mono text-[10px] text-command-gold uppercase tracking-widest mb-2">Log Clearing Session</p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-grey">Post-clearing level:</span>
                              <input type="range" min={0} max={10} value={clearingLevel} onChange={e => setClearingLevel(Number(e.target.value))} className="flex-1 accent-command-gold" />
                              <span className="font-mono text-sm text-command-gold w-6 text-center">{clearingLevel}</span>
                            </div>
                            <input
                              value={clearingNotes}
                              onChange={e => setClearingNotes(e.target.value)}
                              placeholder="What shifted? (optional)"
                              className="w-full bg-background border border-gunmetal rounded-sm px-3 py-2 text-xs text-steel-white focus:outline-none focus:border-command-gold mb-2"
                            />
                            <button
                              onClick={() => handleClearingLog(item)}
                              className="w-full py-2 bg-command-gold text-background text-xs font-heading uppercase tracking-widest rounded-sm hover:bg-command-gold/90"
                            >
                              Log Clearing
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {charges.length === 0 && (
              <div className="directive-card text-center py-12">
                <p className="text-slate-grey">Your charge inventory has not been prepared yet.</p>
                <p className="text-xs text-slate-grey mt-1">Your Command Officer will build your inventory before the deployment call.</p>
              </div>
            )}

            {/* Overall progress */}
            {charges.length > 0 && (
              <div className="directive-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-grey">Overall Clearing Progress</span>
                  <span className="font-heading text-lg text-command-gold">
                    {charges.filter(c => c.status === "cleared").length} / {charges.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-gunmetal rounded-full overflow-hidden">
                  <div className="h-full bg-command-gold rounded-full transition-all" style={{ width: `${(charges.filter(c => c.status === "cleared").length / charges.length) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "roadmap" && (
          <RoadmapView operatorId={operator.id} />
        )}

        {activeSection === "onboarding" && (
          <div className="space-y-2">
            <h3 className="font-heading text-sm uppercase tracking-wider text-command-gold mb-4">Pre-Deployment Acknowledgments</h3>
            {STEP_NAMES.map((name, i) => {
              const completed = (operator as Record<string, unknown>)[`step_${i}_completed`] as boolean;
              return (
                <div key={i} className="flex items-center gap-3 py-2 px-4 bg-tactical-steel rounded-sm">
                  <div className={`w-5 h-5 rounded-sm flex items-center justify-center ${completed ? "bg-field-green" : "bg-gunmetal"}`}>
                    {completed && <span className="text-steel-white text-xs">✓</span>}
                  </div>
                  <span className="font-mono text-xs text-slate-grey w-8">{String(i).padStart(2, "0")}</span>
                  <span className={`text-sm ${completed ? "text-steel-white/70" : "text-slate-grey"}`}>{name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="noise-overlay" />
    </div>
  );
};

export default OperatorDashboard;
