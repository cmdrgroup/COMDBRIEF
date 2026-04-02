import { useState } from "react";
import { ChargeItem, DOMAIN_LABELS, getCategoryInfo } from "@/lib/chargeItems";

interface BlindSpotsScreenProps {
  items: ChargeItem[];
  onAddToInventory: (item: ChargeItem, statement: string, rating: number) => void;
  onDismiss: (id: string) => void;
  onContinue: () => void;
}

const BlindSpotsScreen = ({ items, onAddToInventory, onDismiss, onContinue }: BlindSpotsScreenProps) => {
  const blindSpots = items.filter(i => i.source === "blind_spot");
  const [responding, setResponding] = useState<string | null>(null);
  const [statement, setStatement] = useState("");
  const [rating, setRating] = useState(5);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [converted, setConverted] = useState<Set<string>>(new Set());

  const handleConvert = (item: ChargeItem) => {
    if (!statement.trim()) return;
    onAddToInventory(item, statement.trim(), rating);
    setConverted(prev => new Set(prev).add(item.id));
    setResponding(null);
    setStatement("");
    setRating(5);
  };

  const handleDismiss = (item: ChargeItem) => {
    onDismiss(item.id);
    setDismissed(prev => new Set(prev).add(item.id));
  };

  if (blindSpots.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-sm text-steel-white/70">No blind spot questions were generated.</p>
        <button onClick={onContinue} className="w-full py-3 bg-command-gold text-background font-heading text-sm uppercase tracking-widest rounded-sm hover:bg-command-gold/90">
          Continue to Summary
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h2 className="font-heading text-lg uppercase tracking-wider text-command-gold">Questions to Sit With</h2>
        <p className="text-sm text-steel-white/70">
          These aren't charges — they're questions. The AI can't answer them. Only you can. You don't have to engage with them now. But if one lands, add it to your inventory.
        </p>
      </div>

      <div className="space-y-3">
        {blindSpots.map(item => {
          const domain = DOMAIN_LABELS[item.domain || "both"];
          const catInfo = getCategoryInfo(item.category);
          const isDismissed = dismissed.has(item.id);
          const isConverted = converted.has(item.id);

          if (isDismissed || isConverted) {
            return (
              <div key={item.id} className="bg-tactical-steel/50 rounded-sm p-4 border border-gunmetal/30 opacity-50">
                <p className="text-sm text-steel-white/60 italic">
                  {isConverted ? "✅ Added to inventory" : "Dismissed"}
                </p>
              </div>
            );
          }

          return (
            <div key={item.id} className="bg-tactical-steel rounded-sm border border-gunmetal/50 p-4 space-y-3">
              <p className="text-sm text-steel-white leading-relaxed font-medium">
                "{item.blind_spot_question || item.statement}"
              </p>
              <div className="flex items-center gap-3 text-[10px] text-slate-grey">
                <span>{domain?.emoji} {domain?.label}</span>
                <span>{catInfo?.emoji} {catInfo?.label}</span>
              </div>

              {responding === item.id ? (
                <div className="space-y-2 border-t border-gunmetal/30 pt-3">
                  <input
                    value={statement}
                    onChange={e => setStatement(e.target.value)}
                    placeholder={catInfo?.prefix || "Write your charge statement..."}
                    className="w-full bg-background border border-gunmetal rounded-sm px-2 py-1.5 text-sm text-steel-white focus:outline-none focus:border-command-gold"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-grey">Rating:</span>
                    <input type="range" min={1} max={10} value={rating} onChange={e => setRating(Number(e.target.value))} className="flex-1 accent-command-gold" />
                    <span className="font-mono text-xs text-command-gold w-4">{rating}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleConvert(item)} className="flex-1 py-1.5 bg-command-gold text-background text-xs font-heading uppercase tracking-widest rounded-sm">
                      Add to Inventory
                    </button>
                    <button onClick={() => setResponding(null)} className="px-3 py-1.5 text-xs text-slate-grey">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setResponding(item.id); setStatement(""); }}
                    className="flex-1 py-2 bg-command-gold/10 text-command-gold text-xs font-heading uppercase tracking-widest rounded-sm border border-command-gold/30 hover:bg-command-gold/20"
                  >
                    Yes — add to inventory
                  </button>
                  <button
                    onClick={() => handleDismiss(item)}
                    className="flex-1 py-2 text-slate-grey text-xs font-heading uppercase tracking-widest rounded-sm border border-gunmetal/30 hover:text-steel-white"
                  >
                    Not relevant
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 bg-command-gold text-background font-heading text-sm uppercase tracking-widest rounded-sm hover:bg-command-gold/90 mt-4"
      >
        Continue to Summary
      </button>
    </div>
  );
};

export default BlindSpotsScreen;
