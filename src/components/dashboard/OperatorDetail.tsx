import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CHARGE_CATEGORIES, getChargeItems, type ChargeItem } from "@/lib/chargeItems";
import { supabase } from "@/integrations/supabase/client";
import ChargeListManager from "./ChargeListManager";
import RoadmapView from "../roadmap/RoadmapView";
import { getRoadmapItems, loadDefaultTemplate } from "@/lib/roadmap";
import type { Operator } from "@/lib/operators";

interface OperatorDetailProps {
  operator: Operator;
  onClose: () => void;
}

const OperatorDetail = ({ operator, onClose }: OperatorDetailProps) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"charges" | "roadmap">("charges");
  const [showChargeManager, setShowChargeManager] = useState(false);

  const { data: chargeItems = [] } = useQuery({
    queryKey: ["charge_items", operator.id],
    queryFn: () => getChargeItems(operator.id),
  });

  const { data: roadmapItems = [] } = useQuery({
    queryKey: ["roadmap_items", operator.id],
    queryFn: () => getRoadmapItems(operator.id),
  });

  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const handleLoadTemplate = async () => {
    setLoadingTemplate(true);
    await loadDefaultTemplate(operator.id);
    queryClient.invalidateQueries({ queryKey: ["roadmap_items", operator.id] });
    setLoadingTemplate(false);
  };

  const grouped = CHARGE_CATEGORIES.map(cat => {
    const catItems = chargeItems.filter(i => i.category === cat.key);
    const avg = catItems.length > 0 ? Math.round(catItems.reduce((s, i) => s + i.charge_level, 0) / catItems.length) : 0;
    return { ...cat, count: catItems.length, avg, cleared: catItems.filter(i => i.status === "cleared").length };
  });

  const tabs = [
    { key: "charges" as const, label: "🎯 Charges", count: chargeItems.length },
    { key: "roadmap" as const, label: "🗺️ Roadmap", count: roadmapItems.length },
  ];

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="directive-card max-w-4xl w-full max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg uppercase tracking-wider text-command-gold">
              {operator.first_name} {operator.last_name}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-grey mt-1">
              {operator.email} · Enrolled {new Date(operator.enrolled_at).toLocaleDateString("en-AU")}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-grey hover:text-steel-white text-lg">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-gunmetal">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "text-command-gold border-command-gold"
                  : "text-slate-grey border-transparent hover:text-steel-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "charges" && (
            <div className="space-y-4">
              {/* Heatmap */}
              <div className="grid grid-cols-5 gap-2">
                {grouped.map(g => {
                  const color = g.count === 0 ? "bg-gunmetal" : g.avg >= 7 ? "bg-warning-red/40" : g.avg >= 4 ? "bg-command-gold/40" : "bg-field-green/40";
                  return (
                    <div key={g.key} className={`${color} rounded-sm p-2 text-center`}>
                      <span className="text-sm">{g.emoji}</span>
                      <p className="font-mono text-[10px] text-steel-white/80 mt-0.5">{g.count > 0 ? `${g.avg}/10` : "—"}</p>
                      <p className="font-mono text-[8px] text-slate-grey">{g.cleared}/{g.count}</p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowChargeManager(true)}
                className="w-full py-2.5 bg-command-gold text-background font-heading text-xs uppercase tracking-widest rounded-sm hover:bg-command-gold/90 transition-colors"
              >
                Manage Charge Inventory
              </button>

              {/* Clearing timeline */}
              {chargeItems.filter(i => i.status !== "not_started").length > 0 && (
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-grey mb-2">Active Charges</h4>
                  {chargeItems.filter(i => i.status !== "not_started").map(item => {
                    const cat = CHARGE_CATEGORIES.find(c => c.key === item.category);
                    return (
                      <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-gunmetal/30">
                        <span className="text-xs">{item.status === "cleared" ? "✅" : "🟡"}</span>
                        <span className="text-xs">{cat?.emoji}</span>
                        <span className="text-sm text-steel-white/80 flex-1 truncate">{item.statement}</span>
                        <span className="font-mono text-[10px] text-command-gold">
                          {item.charge_level} → {item.current_charge_level ?? "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "roadmap" && (
            <div className="space-y-4">
              {roadmapItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-grey text-sm mb-4">No roadmap items yet.</p>
                  <button
                    onClick={handleLoadTemplate}
                    disabled={loadingTemplate}
                    className="px-6 py-2.5 bg-command-gold text-background font-heading text-xs uppercase tracking-widest rounded-sm hover:bg-command-gold/90 disabled:opacity-50"
                  >
                    {loadingTemplate ? "Loading Template..." : "Load Default Template"}
                  </button>
                </div>
              ) : (
                <RoadmapView operatorId={operator.id} isCommand={true} />
              )}
            </div>
          )}
        </div>

        {showChargeManager && (
          <ChargeListManager
            operatorId={operator.id}
            operatorName={`${operator.first_name} ${operator.last_name}`}
            onClose={() => setShowChargeManager(false)}
          />
        )}
      </div>
    </div>
  );
};

export default OperatorDetail;
