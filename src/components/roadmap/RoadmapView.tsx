import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronRight, Lock, Plus, Trash2 } from "lucide-react";
import { getRoadmapItems, toggleRoadmapComplete, addRoadmapItem, deleteRoadmapItem, PHASE_INFO, type RoadmapItem, type RoadmapPhase } from "@/lib/roadmap";
import { supabase } from "@/integrations/supabase/client";

interface RoadmapViewProps {
  operatorId: string;
  isCommand?: boolean;
  currentWeek?: number;
}

const RoadmapView = ({ operatorId, isCommand = false, currentWeek = 1 }: RoadmapViewProps) => {
  const queryClient = useQueryClient();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(() => {
    if (currentWeek <= 4) return "phase_1";
    if (currentWeek <= 8) return "phase_2";
    if (currentWeek <= 11) return "phase_3";
    return "phase_4";
  });
  const [addingToPhase, setAddingToPhase] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newWeek, setNewWeek] = useState(1);

  const { data: items = [] } = useQuery({
    queryKey: ["roadmap_items", operatorId],
    queryFn: () => getRoadmapItems(operatorId),
  });

  // Realtime
  useQuery({
    queryKey: ["roadmap_rt", operatorId],
    queryFn: () => {
      const channel = supabase
        .channel(`roadmap-${operatorId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "roadmap_items", filter: `operator_id=eq.${operatorId}` }, () => {
          queryClient.invalidateQueries({ queryKey: ["roadmap_items", operatorId] });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
    staleTime: Infinity,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => toggleRoadmapComplete(id, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roadmap_items", operatorId] }),
  });

  const addMutation = useMutation({
    mutationFn: (phase: RoadmapPhase) => addRoadmapItem({
      operator_id: operatorId,
      phase,
      item_type: "personalised",
      title: newTitle,
      description: newDescription || undefined,
      target_week: newWeek,
      sort_order: items.filter(i => i.phase === phase).length,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap_items", operatorId] });
      setNewTitle("");
      setNewDescription("");
      setAddingToPhase(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRoadmapItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roadmap_items", operatorId] }),
  });

  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const getPhaseItems = (phase: string) => items.filter(i => i.phase === phase);
  const getPhaseProgress = (phase: string) => {
    const phaseItems = getPhaseItems(phase);
    if (phaseItems.length === 0) return 0;
    return Math.round((phaseItems.filter(i => i.completed).length / phaseItems.length) * 100);
  };

  const isPhaseAccessible = (phaseKey: string) => {
    if (isCommand) return true;
    const phaseIndex = PHASE_INFO.findIndex(p => p.key === phaseKey);
    if (phaseIndex === 0) return true;
    const prevPhase = PHASE_INFO[phaseIndex - 1];
    return getPhaseProgress(prevPhase.key) >= 80;
  };

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="directive-card">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-xs uppercase tracking-wider text-command-gold">Deployment Progress</span>
          <span className="font-mono text-sm text-command-gold font-bold">{overallProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gunmetal rounded-full overflow-hidden">
          <div className="h-full bg-command-gold rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="font-mono text-[10px] text-slate-grey mt-2">{completedItems} of {totalItems} items completed · Week {currentWeek} of 12</p>
      </div>

      {/* Phase blocks */}
      {PHASE_INFO.map(phase => {
        const phaseItems = getPhaseItems(phase.key);
        const progress = getPhaseProgress(phase.key);
        const accessible = isPhaseAccessible(phase.key);

        return (
          <div key={phase.key} className={`border rounded-sm ${accessible ? "border-gunmetal" : "border-gunmetal/30 opacity-60"}`}>
            <button
              onClick={() => accessible && setExpandedPhase(expandedPhase === phase.key ? null : phase.key)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-tactical-steel/30 transition-colors"
              disabled={!accessible}
            >
              <div className="flex items-center gap-3">
                {!accessible && <Lock className="w-4 h-4 text-slate-grey" />}
                <div className="text-left">
                  <span className="font-heading text-sm uppercase tracking-wider text-steel-white">Phase {phase.number}: {phase.label}</span>
                  <p className="font-mono text-[10px] text-slate-grey mt-0.5">{phase.weeks}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-1.5 bg-gunmetal rounded-full overflow-hidden">
                  <div className="h-full bg-command-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="font-mono text-[10px] text-slate-grey w-8 text-right">{progress}%</span>
                {accessible && (expandedPhase === phase.key ? <ChevronDown className="w-4 h-4 text-slate-grey" /> : <ChevronRight className="w-4 h-4 text-slate-grey" />)}
              </div>
            </button>

            {expandedPhase === phase.key && accessible && (
              <div className="border-t border-gunmetal/30 px-4 py-3 space-y-2">
                {phaseItems.map(item => {
                  const isOverdue = item.target_week && item.target_week < currentWeek && !item.completed;
                  return (
                    <div key={item.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-sm border ${
                      item.item_type === "personalised" ? "border-l-2 border-l-command-gold border-gunmetal/30 bg-command-gold/5" : "border-gunmetal/30 bg-background"
                    }`}>
                      <button
                        onClick={() => toggleMutation.mutate({ id: item.id, completed: !item.completed })}
                        className={`mt-0.5 w-5 h-5 rounded-sm flex-shrink-0 flex items-center justify-center border transition-colors ${
                          item.completed ? "bg-command-gold border-command-gold" : "border-gunmetal hover:border-command-gold"
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3 text-background" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.icon && <span className="text-sm">{item.icon}</span>}
                          <span className={`text-sm ${item.completed ? "text-slate-grey line-through" : "text-steel-white"}`}>{item.title}</span>
                          {item.item_type === "personalised" && (
                            <span className="font-mono text-[8px] uppercase tracking-widest text-command-gold bg-command-gold/10 px-1.5 py-0.5 rounded">Personal</span>
                          )}
                          {isOverdue && (
                            <span className="font-mono text-[8px] uppercase tracking-widest text-warning-red">Overdue</span>
                          )}
                        </div>
                        {item.description && <p className="text-xs text-slate-grey mt-1">{item.description}</p>}
                        {item.completed && item.completed_at && (
                          <p className="font-mono text-[10px] text-field-green mt-1">
                            Completed {new Date(item.completed_at).toLocaleDateString("en-AU")}
                          </p>
                        )}
                      </div>
                      {item.target_week && (
                        <span className="font-mono text-[10px] text-slate-grey flex-shrink-0">W{item.target_week}</span>
                      )}
                      {isCommand && item.item_type === "personalised" && (
                        <button onClick={() => deleteMutation.mutate(item.id)} className="p-1 text-gunmetal hover:text-warning-red transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add directive (Command only) */}
                {isCommand && (
                  <>
                    {addingToPhase === phase.key ? (
                      <div className="p-3 bg-background rounded-sm border border-command-gold/30 space-y-2">
                        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Directive title..." className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-3 py-2 text-sm text-steel-white focus:outline-none focus:border-command-gold" />
                        <input value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Description (optional)..." className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-3 py-2 text-xs text-steel-white focus:outline-none focus:border-command-gold" />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-grey">Target Week:</span>
                          <input type="number" min={1} max={12} value={newWeek} onChange={e => setNewWeek(Number(e.target.value))} className="w-14 bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1 text-xs text-steel-white text-center focus:outline-none focus:border-command-gold" />
                          <div className="flex-1" />
                          <button onClick={() => newTitle.trim() && addMutation.mutate(phase.key)} disabled={!newTitle.trim()} className="px-3 py-1.5 bg-command-gold text-background text-xs font-heading uppercase tracking-widest rounded-sm disabled:opacity-50">Add</button>
                          <button onClick={() => setAddingToPhase(null)} className="px-3 py-1.5 text-xs text-slate-grey">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingToPhase(phase.key)} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-grey hover:text-command-gold transition-colors border border-dashed border-gunmetal rounded-sm">
                        <Plus className="w-3 h-3" /> Add Personalised Directive
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapView;
