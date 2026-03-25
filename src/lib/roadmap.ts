import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type RoadmapItem = Database["public"]["Tables"]["roadmap_items"]["Row"];
export type RoadmapPhase = Database["public"]["Enums"]["roadmap_phase"];
export type RoadmapItemType = Database["public"]["Enums"]["roadmap_item_type"];
export type WeeklyFocus = Database["public"]["Tables"]["weekly_focus"]["Row"];

export const PHASE_INFO = [
  { key: "phase_1" as const, label: "COMMAND DEPLOYMENT", weeks: "Weeks 1–4", number: 1 },
  { key: "phase_2" as const, label: "BUSINESS ELITE REORGANIZATION", weeks: "Weeks 5–8", number: 2 },
  { key: "phase_3" as const, label: "COMMAND & CONTROL DEPLOYMENT", weeks: "Weeks 9–11", number: 3 },
  { key: "phase_4" as const, label: "ADVANCED COMMAND OPERATIONS", weeks: "Week 12+", number: 4 },
];

export const DEFAULT_ROADMAP_ITEMS: Array<{
  phase: RoadmapPhase;
  title: string;
  description: string;
  icon: string;
  target_week: number;
}> = [
  // Phase 1
  { phase: "phase_1", title: "Complete Pre-Deployment Manual Review", description: "Read and acknowledge all onboarding materials", icon: "📋", target_week: 1 },
  { phase: "phase_1", title: "Complete Mind Clearing Inventory Review", description: "Review all charges with Command during deployment call", icon: "🧠", target_week: 1 },
  { phase: "phase_1", title: "Install Morning Battle Rhythm", description: "Begin daily 05:00 wake + morning protocol", icon: "⏰", target_week: 1 },
  { phase: "phase_1", title: "Submit First SITREP", description: "Complete and submit first daily situation report", icon: "📝", target_week: 1 },
  { phase: "phase_1", title: "Complete Time Audit", description: "Track all time for 7 days, identify leakage points", icon: "⏱️", target_week: 2 },
  { phase: "phase_1", title: "First Clearing Session (BIG #1)", description: "Conduct first dedicated clearing operation on primary charge", icon: "🎯", target_week: 2 },
  { phase: "phase_1", title: "Define 90-Day Strategic Objectives", description: "Lock in 3–5 measurable objectives for the Passage", icon: "🗺️", target_week: 3 },
  { phase: "phase_1", title: "Establish KPI Dashboard", description: "Define and begin tracking 5 core business metrics", icon: "📊", target_week: 3 },
  { phase: "phase_1", title: "Complete Command Foundations Assessment", description: "Self-assessment across all 5 Command Centers", icon: "🏛️", target_week: 4 },
  // Phase 2
  { phase: "phase_2", title: "Strategic Positioning Analysis", description: "Analyse current market position and competitive landscape", icon: "🔍", target_week: 5 },
  { phase: "phase_2", title: "Mission Targeting Workshop", description: "Define ideal client avatar and value proposition", icon: "🎯", target_week: 6 },
  { phase: "phase_2", title: "Delegation Audit", description: "Map all tasks, identify delegation opportunities", icon: "👥", target_week: 6 },
  { phase: "phase_2", title: "Revenue Architecture Review", description: "Analyse revenue streams, identify strategic focus areas", icon: "💰", target_week: 7 },
  { phase: "phase_2", title: "Strategic Command Positioning", description: "Define your role as strategic leader vs tactical operator", icon: "🏗️", target_week: 8 },
  // Phase 3
  { phase: "phase_3", title: "Time Command Implementation", description: "Restructure calendar around strategic priorities", icon: "⏰", target_week: 9 },
  { phase: "phase_3", title: "Fear & Edge Operations", description: "Execute on identified fear-based charges with clearing protocols", icon: "⚔️", target_week: 10 },
  { phase: "phase_3", title: "Environment Audit & Optimization", description: "Audit physical, digital, and relational environments", icon: "🏠", target_week: 10 },
  { phase: "phase_3", title: "90-Day Review & Recalibration", description: "Review progress against objectives, adjust tactical approach", icon: "📊", target_week: 11 },
  // Phase 4
  { phase: "phase_4", title: "Pre-Passage Integration", description: "Consolidate all learnings and systems before Passage completion", icon: "🔄", target_week: 12 },
  { phase: "phase_4", title: "Advanced Command Deployment", description: "Implement advanced leadership frameworks", icon: "⭐", target_week: 12 },
  { phase: "phase_4", title: "Post-Passage Transition Plan", description: "Define ongoing rhythm and accountability structure", icon: "🚀", target_week: 12 },
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
