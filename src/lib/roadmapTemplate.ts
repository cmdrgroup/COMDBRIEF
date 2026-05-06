/**
 * Commander's Passage — Pre-Deployment Roadmap Template
 *
 * Items are tagged with anchors instead of hardcoded weeks:
 *   - "start"  : pinned to weeks 1–4 by `offset` (0 = W1, 3 = W4)
 *   - "end"    : pinned to the final 3 weeks by `offset` (0 = passage week, 1 = W-1, 2 = W-2)
 *   - "flex"   : clearing sessions etc. — distributed evenly across the middle window.
 *                Items sharing a `flex_cluster` land on the same week.
 *
 * Actual week numbers are computed at insert time from the operator's
 * available preparation window (today → passage_date).
 */

import type { Database } from "@/integrations/supabase/types";

type RoadmapPhase = Database["public"]["Enums"]["roadmap_phase"];

export type RoadmapAnchor = "start" | "end" | "flex";

export interface RoadmapTemplateItem {
  phase: RoadmapPhase;
  title: string;
  description: string;
  icon: string;
  anchor: RoadmapAnchor;
  offset: number;
  flex_cluster?: number;
}

export const DEFAULT_ROADMAP_ITEMS: RoadmapTemplateItem[] = [
  // ── PHASE 1 — COMMAND INSTALLATION (start, weeks 1–4)
  // Week 1 (offset 0)
  { phase: "phase_1", title: "Complete Pre-Deployment Manual Review", description: "Read the preparation document — what the Passage is, what it isn't, what's expected.", icon: "📋", anchor: "start", offset: 0 },
  { phase: "phase_1", title: "Complete Mind Clearing Inventory", description: "List every unresolved charge — who, what, rate 0-10. Create your clearing priority list for Phase 2.", icon: "🧠", anchor: "start", offset: 0 },
  { phase: "phase_1", title: "Begin Commander's 75", description: "Day 1 of daily compliance. Full standard. Tracked in the Commander's 75 app.", icon: "⚡", anchor: "start", offset: 0 },
  // Week 2 (offset 1)
  { phase: "phase_1", title: "Complete Time Audit", description: "Track every 30-minute block for 7 days. Where does the time actually go?", icon: "⏱️", anchor: "start", offset: 1 },
  { phase: "phase_1", title: "Submit First SITREP", description: "Current state of business, home, and self. Honest. No performance.", icon: "📝", anchor: "start", offset: 1 },
  { phase: "phase_1", title: "Complete Physical Baseline", description: "Record: body weight, resting heart rate, push-ups (2 min), sit-ups (2 min), 2.4km run time.", icon: "💪", anchor: "start", offset: 1 },
  // Week 3 (offset 2)
  { phase: "phase_1", title: "Learn the Charge-Clearing Framework", description: "Review the 10 tools, the process, the principle.", icon: "📖", anchor: "start", offset: 2 },
  { phase: "phase_1", title: "Record Clearing Outcome", description: "Log: charge type, target, initial rating, final rating, new belief, committed action.", icon: "📊", anchor: "start", offset: 2 },
  // Week 4 (offset 3)
  { phase: "phase_1", title: "Complete Command Foundations Assessment", description: "Self-assessment against the Three Gates: responsibility, avoidance awareness, submission to structure.", icon: "🏛️", anchor: "start", offset: 3 },
  { phase: "phase_1", title: "Define 90-Day Strategic Objectives", description: "Three domains — Business, Home, Self. Measurable. Specific. Time-bound.", icon: "🗺️", anchor: "start", offset: 3 },
  { phase: "phase_1", title: "Submit SITREP + Compliance Review", description: "Honest 4-week review. What's slipping? Where did you negotiate with the standard?", icon: "📝", anchor: "start", offset: 3 },

  // ── PHASE 2 / 3 SCAFFOLDING — non-clearing items only.
  // Clearing sessions are inserted dynamically per-operator from their charge inventory.
  { phase: "phase_2", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", anchor: "flex", offset: 0, flex_cluster: 0 },
  { phase: "phase_2", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", anchor: "flex", offset: 0, flex_cluster: 1 },
  { phase: "phase_2", title: "Charge Inventory Review", description: "Revisit Week 1 inventory. What's cleared? What remains? What surfaced? Re-rate everything.", icon: "📊", anchor: "flex", offset: 0, flex_cluster: 2 },
  { phase: "phase_2", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", anchor: "flex", offset: 0, flex_cluster: 2 },

  // ── PHASE 3 — EDGE & INTEGRATION (non-clearing scaffolding)
  { phase: "phase_3", title: "90-Day Objectives Check-In", description: "Revisit Week 4 objectives. Still the right targets? Refine.", icon: "🗺️", anchor: "flex", offset: 0, flex_cluster: 3 },
  { phase: "phase_3", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", anchor: "flex", offset: 0, flex_cluster: 3 },

  // Edge — end offset 2 (passage week minus 2)
  { phase: "phase_3", title: "Physical Readiness Check", description: "Re-test Week 2 baseline. Has it improved? Commander's 75 movement should show results.", icon: "💪", anchor: "end", offset: 2 },
  { phase: "phase_3", title: "Prepare the Home Front", description: "Off-grid 5 days. Wife informed? Team briefed? Delegation set? If not — fix it this week.", icon: "🏠", anchor: "end", offset: 2 },
  { phase: "phase_3", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", anchor: "end", offset: 2 },

  // Final preparation — end offset 1
  { phase: "phase_3", title: "Complete Packing List", description: "Everything packed. Ready by end of this week, not the night before.", icon: "🎒", anchor: "end", offset: 1 },
  { phase: "phase_3", title: "Write Letter to Self", description: "Who you are today. What you're afraid of. What you're avoiding. What you hope to become. Sealed. Opened post-Passage.", icon: "✉️", anchor: "end", offset: 1 },
  { phase: "phase_3", title: "Submit Final SITREP", description: "Last pre-Passage report. Charges cleared to date. Commander's 75 summary. The baseline for post-Passage measurement.", icon: "📝", anchor: "end", offset: 1 },

  // ── PHASE 4 — DEPLOYMENT (end offset 0 = passage week)
  { phase: "phase_4", title: "Arrive", description: "On time. Prepared. Ready.", icon: "🚀", anchor: "end", offset: 0 },
  { phase: "phase_4", title: "Post-Passage Debrief", description: "What broke? What did you see? What do you now believe is true? What do you commit to? (Auto-triggered 72 hours post-Passage)", icon: "📋", anchor: "end", offset: 0 },
  { phase: "phase_4", title: "Transition Plan", description: "Where next? Protocol? Command Room? 90-day execution plan. (Auto-triggered 1 week post-Passage)", icon: "🗺️", anchor: "end", offset: 0 },
];
