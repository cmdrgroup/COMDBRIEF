import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChargeItems, updateChargeItem, addChargeItem, type ChargeItem } from "@/lib/chargeItems";
import { supabase } from "@/integrations/supabase/client";
import StepLayout from "../StepLayout";
import BigThreeScreen from "../mind-clearing/BigThreeScreen";
import FullInventoryScreen from "../mind-clearing/FullInventoryScreen";
import BlindSpotsScreen from "../mind-clearing/BlindSpotsScreen";
import SummaryScreen from "../mind-clearing/SummaryScreen";

type Screen = "intro" | "big_three" | "inventory" | "blind_spots" | "summary";

interface MindClearingStepProps {
  operatorId: string;
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const MindClearingStep = ({ operatorId, isCompleted, onAcknowledge, onContinue }: MindClearingStepProps) => {
  const queryClient = useQueryClient();
  const [screen, setScreen] = useState<Screen>("intro");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["charge_items_operator", operatorId],
    queryFn: () => getChargeItems(operatorId),
  });

  // Realtime subscription
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

  const updateRatingMutation = useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: number }) => {
      await updateChargeItem(id, { current_charge_level: rating });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operatorId] }),
  });

  const addChargeMutation = useMutation({
    mutationFn: async ({ category, statement, rating }: { category: string; statement: string; rating: number }) => {
      const maxSort = items.filter(i => i.category === category).length;
      await addChargeItem(operatorId, category, statement, rating, maxSort, { source: "self_reported" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charge_items_operator", operatorId] }),
  });

  const handleUpdateRating = useCallback((id: string, rating: number) => {
    updateRatingMutation.mutate({ id, rating });
  }, [updateRatingMutation]);

  const handleAddCharge = useCallback((category: string, statement: string, rating: number) => {
    addChargeMutation.mutate({ category, statement, rating });
  }, [addChargeMutation]);

  const handleBlindSpotAdd = useCallback((item: ChargeItem, statement: string, rating: number) => {
    addChargeMutation.mutate({ category: item.category, statement, rating });
  }, [addChargeMutation]);

  const handleBlindSpotDismiss = useCallback((_id: string) => {
    // Keep in data but mark as dismissed — no-op for now
  }, []);

  const hasItems = items.filter(i => i.source !== "blind_spot").length > 0;

  // Intro screen content
  if (screen === "intro" || !hasItems) {
    return (
      <StepLayout
        stepNumber={6}
        title="MIND CLEARING OPERATIONS"
        isCompleted={isCompleted}
        onAcknowledge={onAcknowledge}
        onContinue={onContinue}
        acknowledgmentText="I have reviewed my charge inventory and understand the mind clearing protocol"
        requireScroll={false}
      >
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-center font-mono text-xs text-slate-grey uppercase tracking-widest py-8">Loading charge inventory...</p>
          ) : !hasItems ? (
            <div className="directive-card text-center py-8">
              <p className="text-slate-grey text-sm">Your charge inventory has not been prepared yet.</p>
              <p className="text-xs text-slate-grey mt-1">Your Command Officer will generate your charges before your deployment call.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="directive-card space-y-4">
                <h3 className="font-heading text-sm uppercase tracking-wider text-command-gold">Mind Clearing Inventory</h3>
                <p className="text-sm text-steel-white/90 leading-relaxed">
                  What you're about to see is your charge inventory — a map of every unresolved emotional weight you're likely carrying into the Passage.
                </p>
                <p className="text-sm text-steel-white/90 leading-relaxed">
                  Some of these will hit immediately. Some won't resonate. Some you'll want to dismiss — those are usually the ones that matter most.
                </p>
                <div className="bg-tactical-steel p-3 rounded-sm space-y-2">
                  <p className="font-heading text-xs uppercase tracking-wider text-steel-white">Your job:</p>
                  <ul className="text-sm text-steel-white/80 space-y-1.5 list-none">
                    <li>→ Read each charge statement</li>
                    <li>→ Rate it honestly (1-10). Not how you want to feel about it. How you <span className="text-command-gold">actually</span> feel.</li>
                    <li>→ Add anything that's missing. The AI surfaced what your data shows — but only you know the full picture.</li>
                  </ul>
                </div>
                <p className="text-xs text-steel-white/60 italic">
                  Nothing here is shared with anyone except Curtis. This is your operational intelligence.
                </p>
              </div>

              <button
                onClick={() => setScreen("big_three")}
                className="w-full py-3 bg-command-gold text-background font-heading text-sm uppercase tracking-widest rounded-sm hover:bg-command-gold/90"
              >
                Begin Review
              </button>
            </div>
          )}
        </div>
      </StepLayout>
    );
  }

  // Sub-screens (Big Three → Inventory → Blind Spots → Summary)
  return (
    <StepLayout
      stepNumber={6}
      title="MIND CLEARING OPERATIONS"
      isCompleted={isCompleted}
      onAcknowledge={onAcknowledge}
      onContinue={onContinue}
      acknowledgmentText="I have reviewed my charge inventory and understand the mind clearing protocol"
      requireScroll={true}
    >
      {screen === "big_three" && (
        <BigThreeScreen
          items={items}
          onUpdateRating={handleUpdateRating}
          onContinue={() => setScreen("inventory")}
        />
      )}
      {screen === "inventory" && (
        <FullInventoryScreen
          items={items}
          onUpdateRating={handleUpdateRating}
          onAddCharge={handleAddCharge}
          onContinue={() => setScreen("blind_spots")}
        />
      )}
      {screen === "blind_spots" && (
        <BlindSpotsScreen
          items={items}
          onAddToInventory={handleBlindSpotAdd}
          onDismiss={handleBlindSpotDismiss}
          onContinue={() => setScreen("summary")}
        />
      )}
      {screen === "summary" && (
        <SummaryScreen
          items={items}
          onSave={() => {
            onAcknowledge();
            onContinue();
          }}
          isSaving={false}
        />
      )}
    </StepLayout>
  );
};

export default MindClearingStep;
