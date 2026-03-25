import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const CHARGE_CATEGORIES = [
  { key: "fear_anxiety", label: "Fear & Anxiety", emoji: "😬", prefix: "I fear..." },
  { key: "self_doubt", label: "Self Doubt", emoji: "😟", prefix: "I doubt..." },
  { key: "frustration", label: "Frustration", emoji: "🤬", prefix: "I'm frustrated that..." },
  { key: "anger", label: "Anger", emoji: "😡", prefix: "I feel angry that..." },
  { key: "depression", label: "Depression", emoji: "😔", prefix: "I feel..." },
  { key: "resentment", label: "Resentment", emoji: "😒", prefix: "I resent..." },
  { key: "guilt_shame", label: "Guilt & Shame", emoji: "😣", prefix: "I feel guilty for..." },
  { key: "grief_loss", label: "Grief & Loss", emoji: "💔", prefix: "I grieve..." },
  { key: "judgment", label: "Judgment", emoji: "👁️", prefix: "I judge myself for..." },
  { key: "infatuation", label: "Infatuation", emoji: "❤️", prefix: "I'm attached to..." },
] as const;

export type ChargeCategory = typeof CHARGE_CATEGORIES[number]["key"];
export type ChargeStatus = Database["public"]["Enums"]["charge_status"];

export type ChargeItem = Database["public"]["Tables"]["charge_items"]["Row"];
export type ClearingLog = Database["public"]["Tables"]["clearing_logs"]["Row"];

export async function getChargeItems(operatorId: string): Promise<ChargeItem[]> {
  const { data, error } = await supabase
    .from("charge_items")
    .select("*")
    .eq("operator_id", operatorId)
    .order("category")
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function addChargeItem(
  operatorId: string,
  category: string,
  statement: string,
  chargeLevel: number = 5,
  sortOrder: number = 0
): Promise<ChargeItem> {
  const { data, error } = await supabase
    .from("charge_items")
    .insert({ operator_id: operatorId, category, statement, charge_level: chargeLevel, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateChargeItem(id: string, updates: Partial<{
  statement: string;
  charge_level: number;
  current_charge_level: number | null;
  priority_rank: number | null;
  status: ChargeStatus;
  command_notes: string | null;
  sort_order: number;
}>): Promise<void> {
  const { error } = await supabase.from("charge_items").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteChargeItem(id: string): Promise<void> {
  const { error } = await supabase.from("charge_items").delete().eq("id", id);
  if (error) throw error;
}

export async function getClearingLogs(chargeId: string): Promise<ClearingLog[]> {
  const { data, error } = await supabase
    .from("clearing_logs")
    .select("*")
    .eq("charge_id", chargeId)
    .order("logged_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addClearingLog(
  chargeId: string,
  operatorId: string,
  preClearingLevel: number,
  postClearingLevel: number,
  operatorNotes?: string
): Promise<void> {
  const { error } = await supabase.from("clearing_logs").insert({
    charge_id: chargeId,
    operator_id: operatorId,
    pre_clearing_level: preClearingLevel,
    post_clearing_level: postClearingLevel,
    operator_notes: operatorNotes || null,
  });
  if (error) throw error;
  // Update the charge item's current level and status
  await updateChargeItem(chargeId, {
    current_charge_level: postClearingLevel,
    status: postClearingLevel === 0 ? "cleared" : "in_progress",
  });
}

export function getCategoryInfo(key: string) {
  return CHARGE_CATEGORIES.find(c => c.key === key);
}
