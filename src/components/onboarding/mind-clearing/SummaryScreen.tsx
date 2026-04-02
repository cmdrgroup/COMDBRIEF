import { ChargeItem } from "@/lib/chargeItems";

interface SummaryScreenProps {
  items: ChargeItem[];
  onSave: () => void;
  isSaving: boolean;
}

const SummaryScreen = ({ items, onSave, isSaving }: SummaryScreenProps) => {
  const nonBlindSpot = items.filter(i => i.source !== "blind_spot");
  const selfAdded = nonBlindSpot.filter(i => i.source === "self_reported").length;
  const rated7Plus = nonBlindSpot.filter(i => (i.current_charge_level ?? i.charge_level) >= 7).length;
  const rated9Plus = nonBlindSpot.filter(i => (i.current_charge_level ?? i.charge_level) >= 9).length;
  const bigThree = nonBlindSpot
    .filter(i => i.priority_rank !== null)
    .sort((a, b) => (a.priority_rank || 0) - (b.priority_rank || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="font-heading text-lg uppercase tracking-wider text-command-gold">Your Charge Inventory</h2>
      </div>

      <div className="bg-tactical-steel rounded-sm border border-gunmetal/50 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Total charges" value={nonBlindSpot.length} />
          <Stat label="Self-added" value={selfAdded} />
          <Stat label="Rated 7+" value={rated7Plus} />
          <Stat label="Rated 9-10" value={rated9Plus} />
        </div>

        {bigThree.length > 0 && (
          <div className="border-t border-gunmetal/30 pt-4 space-y-2">
            {bigThree.map((item, idx) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="font-heading text-xs text-warning-red font-bold w-14 shrink-0">
                  BIG #{idx + 1}
                </span>
                <span className="text-sm text-steel-white/90 flex-1 leading-relaxed">"{item.statement}"</span>
                <span className="font-mono text-xs text-command-gold">{item.current_charge_level ?? item.charge_level}/10</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gunmetal/30 pt-4">
          <p className="text-xs text-steel-white/60 text-center">
            Your first clearing session is in Week 3. You'll start with your BIG #1.
          </p>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-3 bg-command-gold text-background font-heading text-sm uppercase tracking-widest rounded-sm hover:bg-command-gold/90 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Inventory"}
      </button>
    </div>
  );
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-heading text-2xl text-command-gold">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-grey">{label}</p>
    </div>
  );
}

export default SummaryScreen;
