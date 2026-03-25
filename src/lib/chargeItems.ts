import { supabase } from "@/integrations/supabase/client";

export const CHARGE_CATEGORIES = [
  { key: "fear_anxiety", label: "Fear & Anxiety", emoji: "😬" },
  { key: "self_doubt", label: "Self Doubt", emoji: "😟" },
  { key: "frustration", label: "Frustration", emoji: "😡" },
  { key: "anger", label: "Anger", emoji: "🤬" },
  { key: "depression", label: "Depression", emoji: "😞" },
  { key: "resentment", label: "Resentment", emoji: "😤" },
  { key: "guilt_shame", label: "Guilt & Shame", emoji: "😔" },
  { key: "grief_loss", label: "Grief & Loss", emoji: "💔" },
  { key: "judgment", label: "Judgment", emoji: "👁" },
  { key: "infatuation", label: "Infatuation", emoji: "❤" },
] as const;

export type ChargeCategory = typeof CHARGE_CATEGORIES[number]["key"];

export interface ChargeItem {
  id: string;
  operator_id: string;
  category: string;
  content: string;
  is_cleared: boolean;
  cleared_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getChargeItems(operatorId: string): Promise<ChargeItem[]> {
  const { data, error } = await supabase
    .from("charge_items")
    .select("*")
    .eq("operator_id", operatorId)
    .order("category")
    .order("sort_order");
  if (error) throw error;
  return (data as ChargeItem[]) || [];
}

export async function addChargeItem(operatorId: string, category: string, content: string, sortOrder = 0): Promise<ChargeItem> {
  const { data, error } = await supabase
    .from("charge_items")
    .insert({ operator_id: operatorId, category, content, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data as ChargeItem;
}

export async function deleteChargeItem(id: string): Promise<void> {
  const { error } = await supabase.from("charge_items").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleChargeCleared(id: string, isCleared: boolean): Promise<void> {
  const { error } = await supabase
    .from("charge_items")
    .update({
      is_cleared: isCleared,
      cleared_at: isCleared ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}
