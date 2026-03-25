import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { CHARGE_CATEGORIES, getChargeItems, toggleChargeCleared } from "@/lib/chargeItems";
import StepLayout from "../StepLayout";

interface MindClearingStepProps {
  operatorId: string;
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const MindClearingStep = ({ operatorId, isCompleted, onAcknowledge, onContinue }: MindClearingStepProps) => {
  const queryClient = useQueryClient();
  const [acknowledged, setAcknowledged] = useState(isCompleted);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["charge_items_operator", operatorId],
    queryFn: () => getChargeItems(operatorId),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, cleared }: { id: string; cleared: boolean }) => toggleChargeCleared(id, cleared),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operatorId] }),
  });

  const grouped = CHARGE_CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.key),
  })).filter(g => g.items.length > 0);

  const hasItems = items.length > 0;

  return (
    <StepLayout
      title="MIND CLEARING OPERATIONS"
      subtitle="CHARGE INVENTORY PROTOCOL"
      isCompleted={isCompleted}
      acknowledged={acknowledged}
      onAcknowledge={() => { setAcknowledged(true); onAcknowledge(); }}
      onContinue={onContinue}
      acknowledgmentText="I have reviewed my charge inventory and understand the mind clearing protocol"
      scrollRequired={hasItems}
    >
      <div className="space-y-6">
        <div className="text-sm text-steel-white/90 leading-relaxed space-y-3">
          <p>
            Mind Clearing Operations form the foundation of your command effectiveness. These operations
            systematically identify and neutralize internal resistance points that prevent optimal performance.
          </p>
          <p className="text-slate-grey text-xs">
            Your Command Officer has prepared your personalized charge inventory below. Review each item
            and check off charges as you process and clear them throughout the Passage.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center font-mono text-xs text-slate-grey uppercase tracking-widest py-8">
            Loading charge inventory...
          </p>
        ) : !hasItems ? (
          <div className="directive-card text-center py-8">
            <p className="text-slate-grey text-sm">Your charge inventory has not been prepared yet.</p>
            <p className="text-xs text-slate-grey mt-1">Your Command Officer will add charges before your deployment call.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(group => (
              <div key={group.key}>
                <h3 className="font-heading text-sm uppercase tracking-wider text-command-gold mb-3 flex items-center gap-2">
                  <span>{group.emoji}</span>
                  <span>{group.label}</span>
                  <span className="font-mono text-[10px] text-slate-grey">
                    ({group.items.filter(i => i.is_cleared).length}/{group.items.length})
                  </span>
                </h3>
                <div className="space-y-2">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleMutation.mutate({ id: item.id, cleared: !item.is_cleared })}
                      className="w-full flex items-start gap-3 px-4 py-3 bg-tactical-steel border border-gunmetal/50 rounded-sm hover:border-command-gold/30 transition-colors text-left"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-sm flex-shrink-0 flex items-center justify-center border transition-colors ${
                        item.is_cleared
                          ? "bg-field-green border-field-green"
                          : "border-gunmetal hover:border-command-gold"
                      }`}>
                        {item.is_cleared && <Check className="w-3 h-3 text-steel-white" />}
                      </div>
                      <span className={`text-sm leading-relaxed ${
                        item.is_cleared ? "text-slate-grey line-through" : "text-steel-white/90"
                      }`}>
                        {item.content}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="directive-card mt-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-grey">
                  Charges Cleared
                </span>
                <span className="font-heading text-lg text-command-gold">
                  {items.filter(i => i.is_cleared).length} / {items.length}
                </span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-gunmetal rounded-full overflow-hidden">
                <div
                  className="h-full bg-command-gold rounded-full transition-all"
                  style={{ width: `${(items.filter(i => i.is_cleared).length / items.length) * 100}%` }}
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
