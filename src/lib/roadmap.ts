import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_ROADMAP_ITEMS } from "@/lib/roadmapTemplate";
export { DEFAULT_ROADMAP_ITEMS } from "@/lib/roadmapTemplate";

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

export async function loadDefaultTemplate(operatorId: string): Promise<void> {
  const items = DEFAULT_ROADMAP_ITEMS.map((item, i) => ({
    operator_id: operatorId,
    phase: item.phase,
    item_type: "standard" as RoadmapItemType,
    title: item.title,
    description: item.description,
    icon: item.icon,
    target_week: item.target_week,
    sort_order: i,
  }));
  const { error } = await supabase.from("roadmap_items").insert(items);
  if (error) throw error;
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
