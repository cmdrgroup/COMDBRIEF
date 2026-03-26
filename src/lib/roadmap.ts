import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type RoadmapItem = Database["public"]["Tables"]["roadmap_items"]["Row"];
export type RoadmapPhase = Database["public"]["Enums"]["roadmap_phase"];
export type RoadmapItemType = Database["public"]["Enums"]["roadmap_item_type"];
export type WeeklyFocus = Database["public"]["Tables"]["weekly_focus"]["Row"];

export const PHASE_INFO = [
  { key: "phase_1" as const, label: "COMMAND INSTALLATION", weeks: "Weeks 1–3", number: 1 },
  { key: "phase_2" as const, label: "CLEARING OPERATIONS", weeks: "Weeks 4–6", number: 2 },
  { key: "phase_3" as const, label: "EDGE & INTEGRATION", weeks: "Weeks 7–9", number: 3 },
  { key: "phase_4" as const, label: "PASSAGE READY", weeks: "Weeks 10–12", number: 4 },
];

export const DEFAULT_ROADMAP_ITEMS: Array<{
  phase: RoadmapPhase;
  title: string;
  description: string;
  icon: string;
  target_week: number;
}> = [
  // ── PHASE 1: COMMAND INSTALLATION (Weeks 1–3) ──
  // Week 1 — Deployment & Foundation
  { phase: "phase_1", title: "Complete Pre-Deployment Manual Acknowledgment", description: "Read and acknowledge all onboarding materials via the app", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Complete Deployment Call with Command", description: "Initial deployment call with Command Officer", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Review Mind Clearing Charge Inventory", description: "Review all charges with Command during deployment call", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Confirm Access to All Platforms", description: "Community, clearing tool, curriculum — all confirmed", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Set Calendar Alerts for Command Briefings", description: "All weekly Command Briefing calls in your calendar", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Install Morning Protocol", description: "05:00 wake, no snooze, no phone before rhythm complete", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Establish Commander's 75 Daily Tracker", description: "App or physical log — track every daily action", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Submit First Daily SITREP", description: "First daily situation report submitted", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Post First Operational Debrief", description: "First post in the Command Community", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Watch: How to Use the Mind Clearing Tools", description: "Full briefing — do NOT clear until you've watched this", icon: "🎥", target_week: 1 },
  { phase: "phase_1", title: "Watch: Charge Clearing — Fear, Frustration, Self-Doubt", description: "Core clearing lesson before first operation", icon: "🎥", target_week: 1 },
  { phase: "phase_1", title: "Complete 1st Clearing Operation — BIG #1", description: "Primary charge clearing (60–90 min)", icon: "🚀", target_week: 1 },
  { phase: "phase_1", title: "Log Clearing Outcome in Charge Tracker", description: "Record pre/post clearing levels", icon: "🚀", target_week: 1 },
  // Week 2 — Rhythm Lock & First Audit
  { phase: "phase_1", title: "7 Consecutive Days of C75 Actions Logged", description: "Full week of Commander's 75 daily actions tracked", icon: "🚀", target_week: 2 },
  { phase: "phase_1", title: "Submit First Friday SITREP", description: "Situation, Actions Taken, Next Week's Mission", icon: "🚀", target_week: 2 },
  { phase: "phase_1", title: "Attend First Weekly Command Briefing", description: "First weekly briefing call attended", icon: "🚀", target_week: 2 },
  { phase: "phase_1", title: "Complete 2nd Clearing Operation", description: "BIG #1 continued or BIG #2 (60–90 min)", icon: "🚀", target_week: 2 },
  { phase: "phase_1", title: "Complete 3rd Clearing Operation", description: "Third clearing session (60–90 min)", icon: "🚀", target_week: 2 },
  { phase: "phase_1", title: "Post Clearing Debriefs in Community", description: "Debrief in Command Community after each session", icon: "🚀", target_week: 2 },
  { phase: "phase_1", title: "Begin 7-Day Time Audit", description: "Track every 30-minute block for 7 days", icon: "🚀", target_week: 2 },
  { phase: "phase_1", title: "Identify Top 3 Time Leakage Points", description: "Where is your time disappearing?", icon: "📊", target_week: 2 },
  { phase: "phase_1", title: "Identify Sedation Windows", description: "When are you numbing / avoiding / scrolling?", icon: "📊", target_week: 2 },
  // Week 3 — Sedation Elimination & Body Command
  { phase: "phase_1", title: "Watch: Tactical Brief — Discipline & Morning Orders", description: "Morning discipline framework", icon: "🎥", target_week: 3 },
  { phase: "phase_1", title: "Watch: Tactical Brief — Eliminating Sedation", description: "Sedation identification and elimination", icon: "🎥", target_week: 3 },
  { phase: "phase_1", title: "Complete Sedation Inventory", description: "Identify all numbing behaviours — alcohol, porn, scrolling, gaming, binge eating, overworking as avoidance", icon: "🚀", target_week: 3 },
  { phase: "phase_1", title: "Define Sedation Elimination Protocol", description: "Reduction or elimination plan for each sedation pattern", icon: "🚀", target_week: 3 },
  { phase: "phase_1", title: "Install Replacement Behaviours", description: "What do you do instead when the urge hits?", icon: "🚀", target_week: 3 },
  { phase: "phase_1", title: "Report Sedation Audit in Friday SITREP", description: "Full findings reported", icon: "🚀", target_week: 3 },
  { phase: "phase_1", title: "Complete 4th Clearing Operation", description: "Sessions should be getting more efficient (45–60 min)", icon: "🚀", target_week: 3 },
  { phase: "phase_1", title: "Complete 5th Clearing Operation", description: "Minimum 5 total clearings by end of Week 3", icon: "⚠️", target_week: 3 },
  { phase: "phase_1", title: "Watch: Tactical Brief — Commanding Your Body", description: "Physical conditioning framework", icon: "🎥", target_week: 3 },
  { phase: "phase_1", title: "Implement Structured Training Program", description: "Not just 'go to the gym' — structured program in place", icon: "🚀", target_week: 3 },
  { phase: "phase_1", title: "Lock In Nutrition Plan", description: "Macros defined, meal prep established", icon: "🚀", target_week: 3 },
  { phase: "phase_1", title: "Establish Cold Exposure Protocol", description: "Daily ice bath or cold shower as habit", icon: "🚀", target_week: 3 },

  // ── PHASE 2: CLEARING OPERATIONS (Weeks 4–6) ──
  // Week 4 — Deep Clearing & Command Foundations
  { phase: "phase_2", title: "Complete 6th Clearing Operation", description: "Begin working secondary charges beyond BIG 3", icon: "🚀", target_week: 4 },
  { phase: "phase_2", title: "Complete 7th Clearing Operation", description: "Deep clearing session", icon: "🚀", target_week: 4 },
  { phase: "phase_2", title: "Review Charge Inventory with Command", description: "Reassess charge levels, identify what's shifted", icon: "🚀", target_week: 4 },
  { phase: "phase_2", title: "Complete Command Foundations Assessment", description: "Self-assessment across all 5 Command Centers (Mind, Time, Vision, Environment, Field)", icon: "🚀", target_week: 4 },
  { phase: "phase_2", title: "Rate All 5 Command Centers (1–10)", description: "Where are you strong? Where are you exposed?", icon: "📊", target_week: 4 },
  { phase: "phase_2", title: "Discuss Assessment with Command", description: "Review Command Foundations on weekly briefing", icon: "🚀", target_week: 4 },
  { phase: "phase_2", title: "Review First 28 Days of C75", description: "How many days fully completed?", icon: "📊", target_week: 4 },
  { phase: "phase_2", title: "Identify Most Resisted Daily Action", description: "The one you resist most — double down on it", icon: "🚀", target_week: 4 },
  { phase: "phase_2", title: "Post 28-Day C75 Check-In to Community", description: "Share your 28-day Commander's 75 status", icon: "🚀", target_week: 4 },
  // Week 5 — Tough Conversations & Relational Clearing
  { phase: "phase_2", title: "Watch: Tough Conversations in Leadership", description: "Tactical brief on having difficult conversations", icon: "🎥", target_week: 5 },
  { phase: "phase_2", title: "Identify ONE Avoided Tough Conversation", description: "Business or home — which one have you been dodging?", icon: "🚀", target_week: 5 },
  { phase: "phase_2", title: "Plan Conversation Using Command Framework", description: "Use Command Communications framework to prepare", icon: "🚀", target_week: 5 },
  { phase: "phase_2", title: "Execute the Tough Conversation", description: "Have the conversation you've been avoiding", icon: "🚀", target_week: 5 },
  { phase: "phase_2", title: "Debrief Conversation Outcome in SITREP", description: "Report what happened and what shifted", icon: "🚀", target_week: 5 },
  { phase: "phase_2", title: "Complete 8th Clearing — Relational Charges", description: "Focus on resentment, guilt, or grief charges tied to relationships", icon: "🚀", target_week: 5 },
  { phase: "phase_2", title: "Complete 9th Clearing Operation", description: "Continue relational charge work", icon: "🚀", target_week: 5 },
  { phase: "phase_2", title: "Report Relationship Charge Shifts to Command", description: "Are relationship-based charges shifting?", icon: "🚀", target_week: 5 },
  // Week 6 — Brotherhood & Accountability
  { phase: "phase_2", title: "Watch: Tactical Brief — Forging Brotherhood", description: "Brotherhood and accountability framework", icon: "🎥", target_week: 6 },
  { phase: "phase_2", title: "Watch: Building Battle Rhythms", description: "Sync personal rhythm with business cadence", icon: "🎥", target_week: 6 },
  { phase: "phase_2", title: "Engage in Command Community (2+ Responses)", description: "Respond to at least 2 other men's posts this week", icon: "🚀", target_week: 6 },
  { phase: "phase_2", title: "Share One Win and One Struggle Publicly", description: "Genuine vulnerability in the community", icon: "🚀", target_week: 6 },
  { phase: "phase_2", title: "Establish Accountability Connection", description: "Lock in accountability with at least one other operator", icon: "🚀", target_week: 6 },
  { phase: "phase_2", title: "Complete 10th Clearing Operation", description: "MILESTONE: 10 charges cleared — minimum threshold for advancement", icon: "⚠️", target_week: 6 },
  { phase: "phase_2", title: "Post 10-Clearing Milestone Debrief", description: "Share your milestone debrief in Command Community", icon: "🚀", target_week: 6 },
  { phase: "phase_2", title: "Full Charge Inventory Review with Command", description: "Update all charge levels, reassess BIG 3", icon: "🚀", target_week: 6 },

  // ── PHASE 3: EDGE & INTEGRATION (Weeks 7–9) ──
  // Week 7 — Fatherhood, Presence & Home Front
  { phase: "phase_3", title: "Watch: Fatherhood & Presence at Home", description: "Tactical brief on presence and fatherhood", icon: "🎥", target_week: 7 },
  { phase: "phase_3", title: "Implement Weekly Family SITREP", description: "Structured check-in with partner on how the home is running", icon: "🚀", target_week: 7 },
  { phase: "phase_3", title: "Identify Weak Presence Area at Home", description: "Where has your presence been lacking? Commit to a specific change", icon: "🚀", target_week: 7 },
  { phase: "phase_3", title: "Brief Partner on the Passage", description: "Direct conversation — what it is, what it requires, what to expect", icon: "🚀", target_week: 7 },
  { phase: "phase_3", title: "Complete 11th Clearing — Fear & Self-Doubt", description: "Focus on fear and self-doubt charges", icon: "🚀", target_week: 7 },
  { phase: "phase_3", title: "Complete 12th Clearing Operation", description: "Begin applying clearing principles in real-time", icon: "🚀", target_week: 7 },
  // Week 8 — Time Command Implementation
  { phase: "phase_3", title: "Watch: Systemising the Business", description: "Know what needs systemising — build it post-Passage", icon: "🎥", target_week: 8 },
  { phase: "phase_3", title: "Watch: Time Command Protocol", description: "Time management and calendar mastery", icon: "🎥", target_week: 8 },
  { phase: "phase_3", title: "Watch: Company Priority Planning Protocol", description: "Strategic priority planning framework", icon: "🎥", target_week: 8 },
  { phase: "phase_3", title: "Complete Second Time Audit", description: "Compare to Week 2 audit — what's changed? What hasn't?", icon: "🚀", target_week: 8 },
  { phase: "phase_3", title: "Restructure Calendar Around Strategic Priorities", description: "Block time for clearing, exercise, HPAs, family", icon: "🚀", target_week: 8 },
  { phase: "phase_3", title: "Complete Priority Planning Tool", description: "Define top 3 strategic priorities for next 90 days", icon: "🚀", target_week: 8 },
  { phase: "phase_3", title: "Eliminate or Delegate Lowest-Value Tasks", description: "Identify and remove recurring low-value work", icon: "🚀", target_week: 8 },
  { phase: "phase_3", title: "Complete 13th Clearing Operation", description: "Continued clearing work", icon: "🚀", target_week: 8 },
  { phase: "phase_3", title: "Complete 14th Clearing Operation", description: "Continued clearing work", icon: "🚀", target_week: 8 },
  // Week 9 — Fear & Edge Operations
  { phase: "phase_3", title: "Watch: Facing Fear Head-On", description: "Tactical brief on fear operations", icon: "🎥", target_week: 9 },
  { phase: "phase_3", title: "Watch: Sharpening Your Edge", description: "Tactical brief on maintaining your edge", icon: "🎥", target_week: 9 },
  { phase: "phase_3", title: "Identify #1 Remaining Fear-Based Charge", description: "The one that still has the most grip", icon: "🚀", target_week: 9 },
  { phase: "phase_3", title: "Design Real-World Fear-Facing Action", description: "Not just a clearing session — an actual thing you do that confronts the fear", icon: "🚀", target_week: 9 },
  { phase: "phase_3", title: "Execute Fear-Facing Action", description: "Do the thing. Face it.", icon: "🚀", target_week: 9 },
  { phase: "phase_3", title: "Debrief Fear Action in Friday SITREP", description: "What shifted after facing it?", icon: "🚀", target_week: 9 },
  { phase: "phase_3", title: "Audit Physical Environment", description: "Office, home, vehicle — what creates drag? What reinforces focus?", icon: "🚀", target_week: 9 },
  { phase: "phase_3", title: "Audit Digital Environment", description: "Phone screen time, notifications, time-wasting apps", icon: "🚀", target_week: 9 },
  { phase: "phase_3", title: "Audit Relational Environment", description: "Who drains energy? Who reinforces mission? Boundaries needed?", icon: "🚀", target_week: 9 },
  { phase: "phase_3", title: "Make at Least ONE Environmental Change", description: "Implement one concrete change from your audits", icon: "🚀", target_week: 9 },
  { phase: "phase_3", title: "Review & Refine Daily Battle Rhythm", description: "What's working? What needs adjusting?", icon: "📊", target_week: 9 },
  { phase: "phase_3", title: "Lock In Refined Rhythm as Permanent Cadence", description: "This is your operating system from here on", icon: "🚀", target_week: 9 },

  // ── PHASE 4: PASSAGE READY (Weeks 10–12) ──
  // Week 10 — Final Clearing Push
  { phase: "phase_4", title: "Complete 15th Clearing Operation", description: "Should be clearing efficiently in 20–30 min by now", icon: "🚀", target_week: 10 },
  { phase: "phase_4", title: "Revisit BIG #1, #2, #3 — Rerate Charge Levels", description: "How far have they dropped?", icon: "🚀", target_week: 10 },
  { phase: "phase_4", title: "Clear Remaining High-Charge Items (Above 5/10)", description: "Final push on any charges still elevated", icon: "🚀", target_week: 10 },
  { phase: "phase_4", title: "Full Charge Inventory Review — Pre-Passage", description: "Final pre-Passage assessment with Command", icon: "🚀", target_week: 10 },
  { phase: "phase_4", title: "Review Full C75 Performance", description: "How many days completed out of 70?", icon: "📊", target_week: 10 },
  { phase: "phase_4", title: "Identify Actions That Still Feel Like Effort", description: "Those are the ones the Passage will pressure-test", icon: "🚀", target_week: 10 },
  { phase: "phase_4", title: "Post C75 Progress Report in Community", description: "Share your Commander's 75 final status", icon: "🚀", target_week: 10 },
  // Week 11 — Integration & Consolidation
  { phase: "phase_4", title: "Review Progress Against Week 1 Objectives", description: "How did you track against initial strategic objectives?", icon: "📊", target_week: 11 },
  { phase: "phase_4", title: "Re-Rate All 5 Command Centers", description: "Compare to Week 4 assessment — what's shifted?", icon: "📊", target_week: 11 },
  { phase: "phase_4", title: "Document Top 3 Internal Shifts", description: "What's fundamentally different about how you think, feel, or operate?", icon: "🚀", target_week: 11 },
  { phase: "phase_4", title: "Document Top 3 External Changes", description: "What's observably different in behaviour, relationships, or business?", icon: "🚀", target_week: 11 },
  { phase: "phase_4", title: "Watch: Command Communications Framework", description: "If not already completed — review before Passage", icon: "🎥", target_week: 11 },
  { phase: "phase_4", title: "Confirm SITREP, BUB, FRAGO Protocol Fluency", description: "You'll use these during and after the Passage", icon: "🚀", target_week: 11 },
  { phase: "phase_4", title: "Submit Practice BUB", description: "Demonstrate format mastery on a current situation", icon: "🚀", target_week: 11 },
  // Week 12 — Passage Preparation
  { phase: "phase_4", title: "Watch: Preparing for Passage", description: "Final tactical brief before the Passage", icon: "🎥", target_week: 12 },
  { phase: "phase_4", title: "Confirm All Passage Logistics", description: "Dates, location, travel, accommodation — all locked", icon: "🚀", target_week: 12 },
  { phase: "phase_4", title: "Arrange Business Coverage", description: "Delegate or pause non-critical operations for the Passage window", icon: "🚀", target_week: 12 },
  { phase: "phase_4", title: "Arrange Family Coverage", description: "Partner and family briefed, support plan in place", icon: "🚀", target_week: 12 },
  { phase: "phase_4", title: "Conduct Family Briefing", description: "Explain what the Passage involves, what to expect during and after, what you need from them", icon: "🚀", target_week: 12 },
  { phase: "phase_4", title: "Set Re-Entry Expectations with Partner", description: "Communication cadence during Passage, re-entry plan after", icon: "🚀", target_week: 12 },
  { phase: "phase_4", title: "Write 'Why I'm Here' Statement", description: "One page — what brought you here, what you're leaving behind, what you're walking toward. Bring to the Passage.", icon: "🚀", target_week: 12 },
  { phase: "phase_4", title: "Submit Final Pre-Passage SITREP", description: "Your last report before the Passage", icon: "🚀", target_week: 12 },
  { phase: "phase_4", title: "Confirm Readiness with Command Officer", description: "Final authorization from Command", icon: "🚀", target_week: 12 },
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
