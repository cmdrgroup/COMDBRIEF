import { ChargeItem, DOMAIN_LABELS } from "@/lib/chargeItems";

interface BigThreeScreenProps {
  items: ChargeItem[];
  onUpdateRating: (id: string, rating: number) => void;
  onContinue: () => void;
}

const BigThreeScreen = ({ items, onUpdateRating, onContinue }: BigThreeScreenProps) => {
  const bigThree = items
    .filter(i => i.priority_rank !== null)
    .sort((a, b) => (a.priority_rank || 0) - (b.priority_rank || 0))
    .slice(0, 3);

  const priorityLabels = ["BIG #1", "BIG #2", "BIG #3"];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h2 className="font-heading text-lg uppercase tracking-wider text-command-gold">Your Highest-Priority Charges</h2>
        <p className="text-sm text-steel-white/70">These are the charges most likely impacting your business execution and your presence at home.</p>
      </div>

      <div className="space-y-4">
        {bigThree.map((item, idx) => {
          const domain = DOMAIN_LABELS[item.domain || "both"];
          const catEmoji = getCatEmoji(item.category);
          return (
            <div key={item.id} className="border border-warning-red/40 bg-warning-red/5 rounded-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs uppercase tracking-wider text-warning-red font-bold">
                  {priorityLabels[idx] || `BIG #${idx + 1}`}
                </span>
                <span className="text-xs text-slate-grey">{catEmoji} {item.category.replace("_", " ")}</span>
              </div>
              <p className="text-steel-white font-medium leading-relaxed">"{item.statement}"</p>
              <div className="flex items-center gap-3 text-xs text-slate-grey">
                <span>{domain?.emoji} {domain?.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-grey">Your rating:</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={item.current_charge_level ?? item.charge_level}
                  onChange={e => onUpdateRating(item.id, Number(e.target.value))}
                  className="flex-1 accent-command-gold"
                />
                <span className="font-mono text-sm text-command-gold font-bold w-8 text-right">
                  {item.current_charge_level ?? item.charge_level}/10
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-steel-white/60 text-center">
        You'll clear these first during Phase 2. Your first clearing session is in Week 3.
      </p>

      <button
        onClick={onContinue}
        className="w-full py-3 bg-command-gold text-background font-heading text-sm uppercase tracking-widest rounded-sm hover:bg-command-gold/90"
      >
        Continue to Full Inventory
      </button>
    </div>
  );
};

function getCatEmoji(category: string): string {
  const map: Record<string, string> = {
    anger: "😡", resentment: "😒", frustration: "🤬", fear_anxiety: "😬",
    self_doubt: "😟", guilt_shame: "😣", judgment: "👁️", infatuation: "❤️",
    depression: "😔", grief_loss: "💔",
  };
  return map[category] || "⚡";
}

export default BigThreeScreen;
