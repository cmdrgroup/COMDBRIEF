import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_ROADMAP_ITEMS, type RoadmapTemplateItem } from "@/lib/roadmapTemplate";
export { DEFAULT_ROADMAP_ITEMS } from "@/lib/roadmapTemplate";

/** Minimum window: 4 (phase 1) + 3 end-anchor weeks + 1 flex slot. */
export const MIN_ROADMAP_WEEKS = 8;

export type RoadmapItem = Database["public"]["Tables"]["roadmap_items"]["Row"];
export type RoadmapPhase = Database["public"]["Enums"]["roadmap_phase"];
export type RoadmapItemType = Database["public"]["Enums"]["roadmap_item_type"];
export type WeeklyFocus = Database["public"]["Tables"]["weekly_focus"]["Row"];

export const PHASE_INFO = [
  { key: "phase_1" as const, label: "COMMAND INSTALLATION", weeks: "Weeks 1–4", number: 1 },
  { key: "phase_2" as const, label: "CLEARING OPERATIONS", weeks: "Weeks 5–8", number: 2 },
  { key: "phase_3" as const, label: "EDGE & INTEGRATION", weeks: "Weeks 9–11", number: 3 },
  { key: "phase_4" as const, label: "DEPLOYMENT", weeks: "Week 12", number: 4 },
];


export async function getRoadmapItems(operatorId: string): Promise<RoadmapItem[]> {
  const { data, error } = await supabase
    .from("roadmap_items")
    .select("*")
    .eq("operator_id", operatorId)
    .order("phase")
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function addRoadmapItem(item: {
  operator_id: string;
  phase: RoadmapPhase;
  item_type: RoadmapItemType;
  title: string;
  description?: string;
  icon?: string;
  target_week?: number;
  sort_order?: number;
}): Promise<RoadmapItem> {
  const { data, error } = await supabase
    .from("roadmap_items")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRoadmapItem(id: string, updates: Partial<{
  title: string;
  description: string | null;
  icon: string | null;
  target_week: number | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
  phase: RoadmapPhase;
  item_type: RoadmapItemType;
}>): Promise<void> {
  const { error } = await supabase.from("roadmap_items").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteRoadmapItem(id: string): Promise<void> {
  const { error } = await supabase.from("roadmap_items").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Compute the calendar target_date for a roadmap item.
 * Final week (totalWeeks) lands on the passage date; earlier weeks step back 7 days each.
 * totalWeeks is variable so the same math works when the roadmap length changes per operator.
 */
export function computeTargetDate(passageDate: string, targetWeek: number, totalWeeks: number): string {
  const passage = new Date(`${passageDate}T00:00:00Z`);
  const offsetDays = (totalWeeks - targetWeek) * 7;
  const target = new Date(passage.getTime() - offsetDays * 86400000);
  return target.toISOString().slice(0, 10);
}

export async function loadDefaultTemplate(operatorId: string, passageDate?: string | null): Promise<void> {
  const totalWeeks = DEFAULT_ROADMAP_ITEMS.reduce((max, it) => Math.max(max, it.target_week), 0);
  const items = DEFAULT_ROADMAP_ITEMS.map((item, i) => ({
    operator_id: operatorId,
    phase: item.phase,
    item_type: "standard" as RoadmapItemType,
    title: item.title,
    description: item.description,
    icon: item.icon,
    target_week: item.target_week,
    target_date: passageDate ? computeTargetDate(passageDate, item.target_week, totalWeeks) : null,
    sort_order: i,
  }));
  const { error } = await supabase.from("roadmap_items").insert(items as never);
  if (error) throw error;
}

/**
 * Generate the default roadmap for an operator if they don't already have one.
 * Returns true if items were created, false if the operator already had a roadmap.
 */
export async function generateRoadmapForOperator(operatorId: string, passageDate: string): Promise<boolean> {
  const { data: existing, error: checkError } = await supabase
    .from("roadmap_items")
    .select("id")
    .eq("operator_id", operatorId)
    .limit(1);
  if (checkError) throw checkError;
  if (existing && existing.length > 0) return false;
  await loadDefaultTemplate(operatorId, passageDate);
  return true;
}

/**
 * Re-anchor existing roadmap items' target_date values to a new passage date.
 * Preserves all item content/completion; derives totalWeeks from the operator's actual items.
 */
export async function reanchorRoadmapDates(operatorId: string, passageDate: string): Promise<void> {
  const items = await getRoadmapItems(operatorId);
  if (items.length === 0) return;
  const totalWeeks = items.reduce((max, it) => Math.max(max, it.target_week ?? 0), 0);
  if (totalWeeks === 0) return;
  await Promise.all(
    items
      .filter((it) => it.target_week != null)
      .map((it) =>
        supabase
          .from("roadmap_items")
          .update({ target_date: computeTargetDate(passageDate, it.target_week!, totalWeeks) } as never)
          .eq("id", it.id)
      )
  );
}

export async function getWeeklyFocus(operatorId: string, weekNumber: number): Promise<WeeklyFocus | null> {
  const { data, error } = await supabase
    .from("weekly_focus")
    .select("*")
    .eq("operator_id", operatorId)
    .eq("week_number", weekNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertWeeklyFocus(focus: {
  operator_id: string;
  week_number: number;
  headline: string;
  priority_charge_ids?: string[];
  priority_action_ids?: string[];
  command_briefing_datetime?: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from("weekly_focus")
    .upsert(focus, { onConflict: "operator_id,week_number" });
  if (error) throw error;
}

export async function toggleRoadmapComplete(id: string, completed: boolean): Promise<void> {
  await updateRoadmapItem(id, {
    completed,
    completed_at: completed ? new Date().toISOString() : null,
  });
}
