import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_ROADMAP_ITEMS, type RoadmapTemplateItem } from "@/lib/roadmapTemplate";
import { CHARGE_CATEGORIES, type ChargeItem, getChargeItems } from "@/lib/chargeItems";
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

/**
 * Build personalised clearing-session roadmap items from an operator's charge inventory.
 * Slot rules:
 *  - Week 1 = orientation (no clearing)
 *  - Week 2 = BIG #1, Week 3 = BIG #2, Week 4 = BIG #3 (top charge from each of the top 3 tools)
 *  - Weeks 5..(totalWeeks-1) = next highest-rated charges, round-robin across remaining tools
 *  - Final week = deployment prep (no clearing)
 * Each item carries the specific charge text and tool name.
 */
export function buildClearingSessionItems(
  charges: ChargeItem[],
  totalWeeks: number,
): RoadmapTemplateItem[] {
  const slots = Math.max(0, totalWeeks - 2);
  if (slots === 0 || charges.length === 0) return [];

  const byCategory = new Map<string, ChargeItem[]>();
  for (const c of charges) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category)!.push(c);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => (b.charge_level ?? 0) - (a.charge_level ?? 0));
  }

  const rankedCategories = [...byCategory.entries()]
    .map(([cat, list]) => ({ cat, top: list[0]?.charge_level ?? 0 }))
    .sort((a, b) => b.top - a.top)
    .map((x) => x.cat);

  const consumed = new Map<string, number>();
  const picks: ChargeItem[] = [];
  let safety = 0;
  while (picks.length < slots && safety++ < (slots + 1) * (rankedCategories.length + 1)) {
    let picked = false;
    for (const cat of rankedCategories) {
      const list = byCategory.get(cat)!;
      const idx = consumed.get(cat) ?? 0;
      if (idx >= list.length) continue;
      picks.push(list[idx]);
      consumed.set(cat, idx + 1);
      picked = true;
      if (picks.length >= slots) break;
    }
    if (!picked) break;
  }

  const categoryLabel = (key: string) =>
    CHARGE_CATEGORIES.find((c) => c.key === key)?.label ?? key;

  return picks.map((charge, i) => {
    const week = 2 + i;
    const offset = week - 1;
    const phase: RoadmapPhase = week <= 4 ? "phase_1" : week <= totalWeeks - 3 ? "phase_2" : "phase_3";
    const tool = categoryLabel(charge.category);
    const big = i < 3 ? `BIG #${i + 1} — ` : "";
    return {
      phase,
      title: `${big}${tool} Clearing: ${charge.statement}`,
      description: `Run the ${tool} clearing protocol on this charge. Initial rating ${charge.charge_level ?? 0}/10. Log the outcome.`,
      icon: "🎯",
      anchor: "start",
      offset,
    };
  });
}


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

/**
 * Compute the available preparation window in weeks between today and the passage date.
 * Clamped to MIN_ROADMAP_WEEKS so the schedule structure (start anchors + end anchors + flex)
 * always has room. Caller can detect a clamped result by comparing to the raw diff.
 */
export function computeWeeksUntilPassage(passageDate: string, today: Date = new Date()): number {
  const passage = new Date(`${passageDate}T00:00:00Z`);
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const diffDays = Math.max(0, Math.round((passage.getTime() - todayUtc.getTime()) / 86400000));
  const weeks = Math.ceil(diffDays / 7);
  return Math.max(MIN_ROADMAP_WEEKS, weeks);
}

/**
 * Map template items into concrete week numbers for a given window length.
 * - "start"  → week (1 + offset)
 * - "end"    → week (totalWeeks - offset)
 * - "flex"   → distributed evenly across the middle window; items sharing a flex_cluster land on the same week.
 */
export function assignWeekNumbers(
  items: RoadmapTemplateItem[],
  totalWeeks: number,
): (RoadmapTemplateItem & { target_week: number })[] {
  const startWindowEnd = 4;                   // phase 1 always weeks 1–4
  const endWindowStart = totalWeeks - 2;      // last 3 weeks reserved for end anchors (offsets 0,1,2)
  const flexStart = startWindowEnd + 1;
  const flexEnd = Math.max(flexStart, endWindowStart - 1);
  const flexSpan = Math.max(1, flexEnd - flexStart + 1);

  const flexClusters = [
    ...new Set(items.filter((i) => i.anchor === "flex").map((i) => i.flex_cluster ?? 0)),
  ].sort((a, b) => a - b);

  const clusterToWeek = new Map<number, number>();
  flexClusters.forEach((c, idx) => {
    let week: number;
    if (flexClusters.length === 1) {
      week = flexStart;
    } else {
      week = flexStart + Math.round((idx * (flexSpan - 1)) / (flexClusters.length - 1));
    }
    clusterToWeek.set(c, Math.min(flexEnd, Math.max(flexStart, week)));
  });

  return items.map((item) => {
    let target_week: number;
    if (item.anchor === "start") target_week = 1 + item.offset;
    else if (item.anchor === "end") target_week = totalWeeks - item.offset;
    else target_week = clusterToWeek.get(item.flex_cluster ?? 0) ?? flexStart;
    return { ...item, target_week };
  });
}

export async function loadDefaultTemplate(operatorId: string, passageDate: string): Promise<void> {
  const totalWeeks = computeWeeksUntilPassage(passageDate);
  const charges = await getChargeItems(operatorId);
  const clearingItems = buildClearingSessionItems(charges, totalWeeks);
  const assigned = assignWeekNumbers([...DEFAULT_ROADMAP_ITEMS, ...clearingItems], totalWeeks);
  const items = assigned.map((item, i) => ({
    operator_id: operatorId,
    phase: item.phase,
    item_type: "standard" as RoadmapItemType,
    title: item.title,
    description: item.description,
    icon: item.icon,
    target_week: item.target_week,
    target_date: computeTargetDate(passageDate, item.target_week, totalWeeks),
    sort_order: i,
  }));
  const { error } = await supabase.from("roadmap_items").insert(items as never);
  if (error) throw error;
}

/** Window (weeks) beyond which roadmap generation is deferred for manual scheduling. */
export const ROADMAP_AUTOGEN_MAX_WEEKS = 10;

/**
 * Compute the raw (un-clamped) number of weeks between today and the passage date.
 * Used to decide whether to auto-generate the roadmap or defer it.
 */
export function rawWeeksUntilPassage(passageDate: string, today: Date = new Date()): number {
  const passage = new Date(`${passageDate}T00:00:00Z`);
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const diffDays = Math.max(0, Math.round((passage.getTime() - todayUtc.getTime()) / 86400000));
  return Math.ceil(diffDays / 7);
}

export type RoadmapGenerationResult = "created" | "deferred" | "exists";

/**
 * Generate the default roadmap for an operator if they don't already have one.
 * - Returns "exists" if a roadmap is already present.
 * - Returns "deferred" if the passage date is more than ROADMAP_AUTOGEN_MAX_WEEKS away
 *   (Command will trigger generation manually via forceGenerateRoadmap).
 * - Returns "created" if items were generated.
 */
export async function generateRoadmapForOperator(
  operatorId: string,
  passageDate: string,
): Promise<RoadmapGenerationResult> {
  const { data: existing, error: checkError } = await supabase
    .from("roadmap_items")
    .select("id")
    .eq("operator_id", operatorId)
    .limit(1);
  if (checkError) throw checkError;
  if (existing && existing.length > 0) return "exists";
  if (rawWeeksUntilPassage(passageDate) > ROADMAP_AUTOGEN_MAX_WEEKS) return "deferred";
  await loadDefaultTemplate(operatorId, passageDate);
  return "created";
}

/**
 * Force-generate the roadmap regardless of how far out the passage date is.
 * Used by Command to manually time delivery for operators with longer windows.
 */
export async function forceGenerateRoadmap(operatorId: string, passageDate: string): Promise<boolean> {
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
