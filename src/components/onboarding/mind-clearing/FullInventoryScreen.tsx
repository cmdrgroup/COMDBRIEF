import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { CHARGE_CATEGORIES, ChargeItem, DOMAIN_LABELS, SOURCE_LABELS } from "@/lib/chargeItems";

interface FullInventoryScreenProps {
  items: ChargeItem[];
  onUpdateRating: (id: string, rating: number) => void;
  onAddCharge: (category: string, statement: string, rating: number) => void;
  onContinue: () => void;
}

const FullInventoryScreen = ({ items, onUpdateRating, onAddCharge, onContinue }: FullInventoryScreenProps) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showEvidence, setShowEvidence] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newStatement, setNewStatement] = useState("");
  const [newRating, setNewRating] = useState(5);

  const grouped = CHARGE_CATEGORIES.map(cat => {
    const catItems = items.filter(i => i.category === cat.key && i.source !== "blind_spot");
    const highest = catItems.length > 0 ? Math.max(...catItems.map(i => i.current_charge_level ?? i.charge_level)) : 0;
    return { ...cat, items: catItems, highest };
  }).filter(g => g.items.length > 0 || true); // Show all categories

  const handleAdd = (catKey: string) => {
    if (!newStatement.trim()) return;
    onAddCharge(catKey, newStatement.trim(), newRating);
    setNewStatement("");
    setNewRating(5);
    setAddingTo(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="font-heading text-lg uppercase tracking-wider text-command-gold">Full Charge Inventory</h2>
        <p className="text-xs text-steel-white/60 mt-1">{items.filter(i => i.source !== "blind_spot").length} charges identified across all categories</p>
      </div>

      {grouped.map(group => (
        <div key={group.key} className="bg-tactical-steel rounded-sm border border-gunmetal/50 overflow-hidden">
          <button
            onClick={() => setExpandedCat(expandedCat === group.key ? null : group.key)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <span>{group.emoji}</span>
              <span className="font-heading text-xs uppercase tracking-wider text-steel-white">{group.label}</span>
              <span className="text-xs text-slate-grey">({group.items.length} charges)</span>
            </div>
            <div className="flex items-center gap-3">
              {group.highest > 0 && (
                <span className="text-[10px] text-slate-grey">Highest: <span className="text-command-gold">{group.highest}/10</span></span>
              )}
              {expandedCat === group.key ? <ChevronDown className="w-4 h-4 text-slate-grey" /> : <ChevronRight className="w-4 h-4 text-slate-grey" />}
            </div>
          </button>

          {expandedCat === group.key && (
            <div className="px-4 pb-3 space-y-2">
              {group.items.length === 0 ? (
                <p className="text-xs text-slate-grey py-2">No charges identified in this category.</p>
              ) : (
                group.items.map(item => {
                  const domain = DOMAIN_LABELS[item.domain || "both"];
                  const source = SOURCE_LABELS[item.source || "stated"];
                  return (
                    <div key={item.id} className="bg-background rounded-sm border border-gunmetal/30 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-steel-white/90 leading-relaxed flex-1">"{item.statement}"</p>
                        <span className="font-mono text-sm text-command-gold font-bold whitespace-nowrap">
                          {item.current_charge_level ?? item.charge_level}/10
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-grey">
                        <span>{domain?.emoji} {domain?.label}</span>
                        <span>{source?.emoji} {source?.label}</span>
                        {item.evidence && (
                          <button
                            onClick={() => setShowEvidence(showEvidence === item.id ? null : item.id)}
                            className="text-command-gold/70 hover:text-command-gold underline"
                          >
                            Why this?
                          </button>
                        )}
                      </div>
                      {showEvidence === item.id && item.evidence && (
                        <p className="text-[10px] text-slate-grey bg-tactical-steel p-2 rounded-sm italic">
                          {item.evidence}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-grey">Rating:</span>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={item.current_charge_level ?? item.charge_level}
                          onChange={e => onUpdateRating(item.id, Number(e.target.value))}
                          className="flex-1 accent-command-gold"
                        />
                        <span className="font-mono text-xs text-command-gold w-4">{item.current_charge_level ?? item.charge_level}</span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Add your own */}
              {addingTo === group.key ? (
                <div className="bg-background border border-command-gold/30 rounded-sm p-3 space-y-2">
                  <p className="font-mono text-[10px] text-command-gold uppercase tracking-widest">Add your own charge</p>
                  <input
                    value={newStatement}
                    onChange={e => setNewStatement(e.target.value)}
                    placeholder={group.prefix}
                    className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1.5 text-sm text-steel-white focus:outline-none focus:border-command-gold"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-grey">Rating:</span>
                    <input type="range" min={1} max={10} value={newRating} onChange={e => setNewRating(Number(e.target.value))} className="flex-1 accent-command-gold" />
                    <span className="font-mono text-xs text-command-gold w-4">{newRating}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAdd(group.key)} className="flex-1 py-1.5 bg-command-gold text-background text-xs font-heading uppercase tracking-widest rounded-sm hover:bg-command-gold/90">
                      Add Charge
                    </button>
                    <button onClick={() => setAddingTo(null)} className="px-3 py-1.5 text-xs text-slate-grey hover:text-steel-white">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingTo(group.key); setNewStatement(""); }}
                  className="w-full flex items-center justify-center gap-1 py-2 text-xs text-command-gold/70 hover:text-command-gold border border-dashed border-gunmetal/40 rounded-sm"
                >
                  <Plus className="w-3 h-3" /> Add a charge
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={onContinue}
        className="w-full py-3 bg-command-gold text-background font-heading text-sm uppercase tracking-widest rounded-sm hover:bg-command-gold/90 mt-4"
      >
        Continue to Blind Spots
      </button>
    </div>
  );
};

export default FullInventoryScreen;
