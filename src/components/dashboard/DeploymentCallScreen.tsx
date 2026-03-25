import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Plus } from "lucide-react";
import { getAllOperators, type Operator } from "@/lib/operators";
import { getChargeItems, CHARGE_CATEGORIES, addChargeItem } from "@/lib/chargeItems";
import { getRoadmapItems, addRoadmapItem, type RoadmapPhase } from "@/lib/roadmap";
import ChargeListManager from "./ChargeListManager";
import RoadmapView from "../roadmap/RoadmapView";
import { supabase } from "@/integrations/supabase/client";

interface DeploymentCallScreenProps {
  operatorId?: string;
  onBack: () => void;
}

const DeploymentCallScreen = ({ operatorId: initialOperatorId, onBack }: DeploymentCallScreenProps) => {
  const queryClient = useQueryClient();
  const [selectedOperatorId, setSelectedOperatorId] = useState(initialOperatorId || "");
  const [callStart] = useState(new Date());
  const [elapsed, setElapsed] = useState("00:00");
  const [quickAddType, setQuickAddType] = useState<"charge" | "directive" | null>(null);
  const [quickCategory, setQuickCategory] = useState<string>(CHARGE_CATEGORIES[0].key);
  const [quickStatement, setQuickStatement] = useState("");
  const [quickLevel, setQuickLevel] = useState(5);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPhase, setQuickPhase] = useState<RoadmapPhase>("phase_1");

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - callStart.getTime()) / 1000);
      const mins = Math.floor(diff / 60).toString().padStart(2, "0");
      const secs = (diff % 60).toString().padStart(2, "0");
      setElapsed(`${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [callStart]);

  const { data: operators = [] } = useQuery({
    queryKey: ["operators"],
    queryFn: getAllOperators,
  });

  const selectedOperator = operators.find(o => o.id === selectedOperatorId);

  const { data: charges = [] } = useQuery({
    queryKey: ["charge_items", selectedOperatorId],
    queryFn: () => getChargeItems(selectedOperatorId),
    enabled: !!selectedOperatorId,
  });

  // Realtime for charges
  useQuery({
    queryKey: ["call_charges_rt", selectedOperatorId],
    queryFn: () => {
      if (!selectedOperatorId) return () => {};
      const channel = supabase
        .channel(`call-charges-${selectedOperatorId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "charge_items", filter: `operator_id=eq.${selectedOperatorId}` }, () => {
          queryClient.invalidateQueries({ queryKey: ["charge_items", selectedOperatorId] });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
    enabled: !!selectedOperatorId,
    staleTime: Infinity,
  });

  const priorityCharges = charges.filter(c => c.priority_rank !== null).sort((a, b) => (a.priority_rank || 0) - (b.priority_rank || 0));

  const grouped = CHARGE_CATEGORIES.map(cat => ({
    ...cat,
    items: charges.filter(c => c.category === cat.key),
  })).filter(g => g.items.length > 0);

  const handleQuickAddCharge = async () => {
    if (!quickStatement.trim() || !selectedOperatorId) return;
    await addChargeItem(selectedOperatorId, quickCategory, quickStatement, quickLevel);
    queryClient.invalidateQueries({ queryKey: ["charge_items", selectedOperatorId] });
    setQuickStatement("");
    setQuickAddType(null);
  };

  const handleQuickAddDirective = async () => {
    if (!quickTitle.trim() || !selectedOperatorId) return;
    await addRoadmapItem({ operator_id: selectedOperatorId, phase: quickPhase, item_type: "personalised", title: quickTitle });
    queryClient.invalidateQueries({ queryKey: ["roadmap_items", selectedOperatorId] });
    setQuickTitle("");
    setQuickAddType(null);
  };

  if (!selectedOperator) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto mt-20">
          <h2 className="font-heading text-xl uppercase tracking-wider text-command-gold mb-4">Select Operator</h2>
          <select
            value={selectedOperatorId}
            onChange={e => setSelectedOperatorId(e.target.value)}
            className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-4 py-3 text-sm text-steel-white focus:outline-none focus:border-command-gold mb-4"
          >
            <option value="">Choose operator...</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>{op.first_name} {op.last_name}</option>
            ))}
          </select>
          <button onClick={onBack} className="text-sm text-slate-grey hover:text-steel-white">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="classified-strip flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-grey hover:text-steel-white text-xs">← DASHBOARD</button>
          <span className="text-command-gold font-heading uppercase tracking-wider">
            {selectedOperator.first_name} {selectedOperator.last_name}
          </span>
          <span className="text-[10px] text-slate-grey">
            Enrolled {new Date(selectedOperator.enrolled_at).toLocaleDateString("en-AU")}
          </span>
          {selectedOperator.status === "complete" && (
            <span className="text-[10px] text-field-green">✅ ONBOARDING COMPLETE</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setQuickAddType("charge")} className="text-[10px] text-command-gold hover:text-command-gold/80 uppercase tracking-widest">
            + Add Charge
          </button>
          <button onClick={() => setQuickAddType("directive")} className="text-[10px] text-command-gold hover:text-command-gold/80 uppercase tracking-widest">
            + Add Directive
          </button>
          <div className="flex items-center gap-1 text-slate-grey">
            <Clock className="w-3 h-3" />
            <span className="font-mono text-xs">{elapsed}</span>
          </div>
        </div>
      </div>

      {/* Quick add modals */}
      {quickAddType && (
        <div className="absolute top-12 right-4 z-50 directive-card w-96 animate-fade-in-up">
          {quickAddType === "charge" ? (
            <div className="space-y-2">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-command-gold">Quick Add Charge</h4>
              <select value={quickCategory} onChange={e => setQuickCategory(e.target.value)} className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1.5 text-xs text-steel-white">
                {CHARGE_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
              <input value={quickStatement} onChange={e => setQuickStatement(e.target.value)} placeholder="Charge statement..." className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-3 py-2 text-sm text-steel-white focus:outline-none focus:border-command-gold" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-grey">Level:</span>
                <input type="number" min={1} max={10} value={quickLevel} onChange={e => setQuickLevel(Number(e.target.value))} className="w-12 bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1 text-xs text-center text-steel-white" />
                <div className="flex-1" />
                <button onClick={handleQuickAddCharge} className="px-3 py-1.5 bg-command-gold text-background text-xs rounded-sm">Add</button>
                <button onClick={() => setQuickAddType(null)} className="px-3 py-1.5 text-xs text-slate-grey">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-command-gold">Quick Add Directive</h4>
              <select value={quickPhase} onChange={e => setQuickPhase(e.target.value as RoadmapPhase)} className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1.5 text-xs text-steel-white">
                <option value="phase_1">Phase 1: Command Deployment</option>
                <option value="phase_2">Phase 2: Business Elite</option>
                <option value="phase_3">Phase 3: Command & Control</option>
                <option value="phase_4">Phase 4: Advanced Ops</option>
              </select>
              <input value={quickTitle} onChange={e => setQuickTitle(e.target.value)} placeholder="Directive title..." className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-3 py-2 text-sm text-steel-white focus:outline-none focus:border-command-gold" />
              <div className="flex justify-end gap-2">
                <button onClick={handleQuickAddDirective} className="px-3 py-1.5 bg-command-gold text-background text-xs rounded-sm">Add</button>
                <button onClick={() => setQuickAddType(null)} className="px-3 py-1.5 text-xs text-slate-grey">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Charges (60%) */}
        <div className="w-[60%] border-r border-gunmetal overflow-y-auto p-4 space-y-4">
          <h3 className="font-heading text-sm uppercase tracking-wider text-command-gold">Charge Inventory</h3>

          {/* Priority targets */}
          {priorityCharges.length > 0 && (
            <div className="border-l-2 border-warning-red p-3 bg-warning-red/5 rounded-sm">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-warning-red mb-2">Priority Clearing Targets</h4>
              {priorityCharges.map(c => (
                <div key={c.id} className="flex items-center gap-2 py-1">
                  <span className="font-heading text-xs text-warning-red font-bold w-14">BIG #{c.priority_rank}</span>
                  <span className="text-sm text-steel-white/90 flex-1">{c.statement}</span>
                  <span className="font-mono text-[10px] text-command-gold">{c.charge_level}/10</span>
                </div>
              ))}
            </div>
          )}

          {/* Categories */}
          {grouped.map(group => (
            <div key={group.key} className="space-y-1">
              <div className="flex items-center gap-2">
                <span>{group.emoji}</span>
                <span className="font-heading text-xs uppercase tracking-wider text-steel-white">{group.label}</span>
                <span className="font-mono text-[10px] text-slate-grey">({group.items.length})</span>
              </div>
              {group.items.map(item => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-tactical-steel/30 rounded-sm">
                  <span className="text-xs">{item.status === "cleared" ? "✅" : item.status === "in_progress" ? "🟡" : "⬜"}</span>
                  <span className={`text-sm flex-1 ${item.status === "cleared" ? "text-slate-grey line-through" : "text-steel-white/90"}`}>
                    {item.statement}
                  </span>
                  <span className="font-mono text-[10px] text-command-gold">{item.charge_level}</span>
                </div>
              ))}
            </div>
          ))}

          {charges.length === 0 && (
            <p className="text-center text-slate-grey text-sm py-8">No charges yet. Use "+ Add Charge" to start building the inventory.</p>
          )}
        </div>

        {/* Right panel: Roadmap (40%) */}
        <div className="w-[40%] overflow-y-auto p-4">
          <h3 className="font-heading text-sm uppercase tracking-wider text-command-gold mb-4">Deployment Roadmap</h3>
          <RoadmapView operatorId={selectedOperatorId} isCommand={true} />
        </div>
      </div>
    </div>
  );
};

export default DeploymentCallScreen;
