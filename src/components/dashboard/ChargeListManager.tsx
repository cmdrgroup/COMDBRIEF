import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { CHARGE_CATEGORIES, getChargeItems, addChargeItem, deleteChargeItem } from "@/lib/chargeItems";

interface ChargeListManagerProps {
  operatorId: string;
  operatorName: string;
  onClose: () => void;
}

const ChargeListManager = ({ operatorId, operatorName, onClose }: ChargeListManagerProps) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>(CHARGE_CATEGORIES[0].key);
  const [newContent, setNewContent] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["charge_items", operatorId],
    queryFn: () => getChargeItems(operatorId),
  });

  const addMutation = useMutation({
    mutationFn: () => addChargeItem(operatorId, selectedCategory, newContent, items.filter(i => i.category === selectedCategory).length),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charge_items", operatorId] });
      setNewContent("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChargeItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["charge_items", operatorId] }),
  });

  const grouped = CHARGE_CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.key),
  })).filter(g => g.items.length > 0);

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="directive-card max-w-2xl w-full max-h-[85vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg uppercase tracking-wider text-command-gold">
              Mind Clearing Charges
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-grey mt-1">
              {operatorName}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-grey hover:text-steel-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add new charge */}
        <div className="mb-4 p-3 bg-background rounded-sm border border-gunmetal">
          <div className="flex gap-2 mb-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-tactical-steel border border-gunmetal rounded-sm px-2 py-1.5 text-xs text-steel-white focus:outline-none focus:border-command-gold"
            >
              {CHARGE_CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Enter charge statement..."
              className="flex-1 bg-tactical-steel border border-gunmetal rounded-sm px-3 py-2 text-sm text-steel-white focus:outline-none focus:border-command-gold"
              onKeyDown={e => e.key === "Enter" && newContent.trim() && addMutation.mutate()}
            />
            <button
              onClick={() => addMutation.mutate()}
              disabled={!newContent.trim() || addMutation.isPending}
              className="px-3 py-2 bg-command-gold text-background rounded-sm hover:bg-command-gold/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Charge list */}
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin">
          {grouped.length === 0 ? (
            <p className="text-center text-slate-grey text-sm py-8">No charges added yet. Use the form above to add charge items.</p>
          ) : (
            grouped.map(group => (
              <div key={group.key}>
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-command-gold mb-2">
                  {group.emoji} {group.label} ({group.items.length})
                </h4>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-start gap-2 px-3 py-2 bg-background rounded-sm border border-gunmetal/50 group">
                      <span className={`flex-1 text-sm ${item.is_cleared ? "text-slate-grey line-through" : "text-steel-white"}`}>
                        {item.content}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-warning-red/20 rounded-sm transition-all"
                      >
                        <Trash2 className="w-3 h-3 text-warning-red" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gunmetal">
          <p className="font-mono text-[10px] text-slate-grey uppercase tracking-widest">
            Total charges: {items.length} · Cleared: {items.filter(i => i.is_cleared).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChargeListManager;
