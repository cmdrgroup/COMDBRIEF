/**
 * Commander's Passage — Pre-Deployment Roadmap Template
 * 35 items across 4 phases / 12 weeks
 *
 * Where each action lives:
 *   In-app (content/form)  → handled inside the platform
 *   Charge-clearing app    → links out to clearing tool
 *   Circle (SitRep space)  → links out to Circle community
 *   Commander's 75 app     → referenced, tracked externally
 */

import type { RoadmapPhase } from "@/lib/roadmap";

export interface RoadmapTemplateItem {
  phase: RoadmapPhase;
  title: string;
  description: string;
  icon: string;
  target_week: number;
}

export const DEFAULT_ROADMAP_ITEMS: RoadmapTemplateItem[] = [
  // ═══════════════════════════════════════════════════════════
  // PHASE 1 — COMMAND INSTALLATION (Weeks 1–4)
  // Mission: Strip away the noise. Install the foundation. See the truth.
  // ═══════════════════════════════════════════════════════════

  // Week 1: Orientation ⚡
  // Directive: "You've committed. Now learn what you've committed to."
  { phase: "phase_1", title: "Complete Pre-Deployment Manual Review", description: "Read the preparation document — what the Passage is, what it isn't, what's expected.", icon: "📋", target_week: 1 },
  { phase: "phase_1", title: "Complete Mind Clearing Inventory", description: "List every unresolved charge — who, what, rate 0-10. Create your clearing priority list for Phase 2.", icon: "🧠", target_week: 1 },
  { phase: "phase_1", title: "Begin Commander's 75", description: "Day 1 of daily compliance. Full standard. Tracked in the Commander's 75 app.", icon: "⚡", target_week: 1 },

  // Week 2: The Baseline ⚡
  // Directive: "Before you can change anything, you need to see what's actually happening."
  { phase: "phase_1", title: "Complete Time Audit", description: "Track every 30-minute block for 7 days. Where does the time actually go?", icon: "⏱️", target_week: 2 },
  { phase: "phase_1", title: "Submit First SITREP", description: "Current state of business, home, and self. Honest. No performance.", icon: "📝", target_week: 2 },
  { phase: "phase_1", title: "Complete Physical Baseline", description: "Record: body weight, resting heart rate, push-ups (2 min), sit-ups (2 min), 2.4km run time.", icon: "💪", target_week: 2 },

  // Week 3: Internal Reconnaissance ⚡
  // Directive: "You've seen the external. Now look internal. What are you carrying?"
  { phase: "phase_1", title: "Learn the Charge-Clearing Framework", description: "Review the 10 tools, the process, the principle.", icon: "📖", target_week: 3 },
  { phase: "phase_1", title: "First Clearing Session (BIG #1)", description: "Take the highest-rated charge from your inventory. Run the full protocol.", icon: "🎯", target_week: 3 },
  { phase: "phase_1", title: "Record Clearing Outcome", description: "Log: charge type, target, initial rating, final rating, new belief, committed action.", icon: "📊", target_week: 3 },

  // Week 4: Foundation Check ⚡
  // Directive: "Four weeks in. Are you building the foundation or performing compliance?"
  { phase: "phase_1", title: "Complete Command Foundations Assessment", description: "Self-assessment against the Three Gates: responsibility, avoidance awareness, submission to structure.", icon: "🏛️", target_week: 4 },
  { phase: "phase_1", title: "Define 90-Day Strategic Objectives", description: "Three domains — Business, Home, Self. Measurable. Specific. Time-bound.", icon: "🗺️", target_week: 4 },
  { phase: "phase_1", title: "Submit SITREP + Compliance Review", description: "Honest 4-week review. What's slipping? Where did you negotiate with the standard?", icon: "📝", target_week: 4 },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2 — CLEARING OPERATIONS (Weeks 5–8)
  // Mission: Systematically clear the emotional load. The lighter he arrives, the deeper the Passage goes.
  // ═══════════════════════════════════════════════════════════

  // Week 5: Self-Doubt ⚡
  // Directive: "Self-doubt is the first thing the Passage will target. Start dismantling it now."
  { phase: "phase_2", title: "Self-Doubt Clearing Session", description: "Where are you doubting yourself most — leader, husband, father, operator? Clear it.", icon: "🎯", target_week: 5 },
  { phase: "phase_2", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", target_week: 5 },

  // Week 6: Fear & Anxiety ⚡
  // Directive: "Fear tells you where weaknesses lie. It's intelligence data, not a stop sign."
  { phase: "phase_2", title: "Fear & Anxiety Clearing Session", description: "What are you afraid of? The Passage? Failing? Being exposed? Your marriage? Name it. Clear it.", icon: "🎯", target_week: 6 },
  { phase: "phase_2", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", target_week: 6 },

  // Week 7: Guilt, Shame & Judgment ⚡
  // Directive: "These three charges keep men performing instead of leading. Strip them."
  { phase: "phase_2", title: "Guilt & Shame Clearing Session", description: "Past failures, things you haven't told your wife, the double life. Clear it before the Passage exposes it.", icon: "🎯", target_week: 7 },
  { phase: "phase_2", title: "Judgment Clearing Session", description: "Fear of being judged by the other men, by Curtis, by yourself. Or judgment of others keeping you isolated.", icon: "🎯", target_week: 7 },
  { phase: "phase_2", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", target_week: 7 },

  // Week 8: Resentment & Frustration ⚡
  // Directive: "Resentment is a leadership failure you haven't addressed. Frustration is an expectation you haven't enforced."
  { phase: "phase_2", title: "Resentment Clearing Session", description: "Who do you resent? Wife? Business partner? Parent? Yourself? Often the heaviest charge.", icon: "🎯", target_week: 8 },
  { phase: "phase_2", title: "Frustration Clearing Session", description: "What frustrates you most? Usually a conversation you haven't had or an expectation you haven't enforced.", icon: "🎯", target_week: 8 },
  { phase: "phase_2", title: "Charge Inventory Review", description: "Revisit Week 1 inventory. What's cleared? What remains? What surfaced? Re-rate everything.", icon: "📊", target_week: 8 },
  { phase: "phase_2", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", target_week: 8 },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3 — EDGE & INTEGRATION (Weeks 9–11)
  // Mission: Clearing work done or underway. Integrate. Prepare. Get ready.
  // ═══════════════════════════════════════════════════════════

  // Week 9: Integration ⚡
  // Directive: "What's left? What are you still carrying?"
  { phase: "phase_3", title: "Clear Remaining Charges", description: "Anything still rated 7+ gets cleared. If you've been avoiding one — that's the one.", icon: "🎯", target_week: 9 },
  { phase: "phase_3", title: "90-Day Objectives Check-In", description: "Revisit Week 4 objectives. Still the right targets? Refine.", icon: "🗺️", target_week: 9 },
  { phase: "phase_3", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", target_week: 9 },

  // Week 10: Edge ⚡
  // Directive: "The Passage is 75 hours of deliberate pressure. Be ready."
  { phase: "phase_3", title: "Physical Readiness Check", description: "Re-test Week 2 baseline. Has it improved? Commander's 75 movement should show results.", icon: "💪", target_week: 10 },
  { phase: "phase_3", title: "Prepare the Home Front", description: "Off-grid 5 days. Wife informed? Team briefed? Delegation set? If not — fix it this week.", icon: "🏠", target_week: 10 },
  { phase: "phase_3", title: "Submit SITREP", description: "Weekly situation report — progress, blockers, state of mind.", icon: "📝", target_week: 10 },

  // Week 11: Final Preparation ⚡
  // Directive: "Next week you arrive. Prepare like a soldier deploying."
  { phase: "phase_3", title: "Complete Packing List", description: "Everything packed. Ready by end of this week, not the night before.", icon: "🎒", target_week: 11 },
  { phase: "phase_3", title: "Write Letter to Self", description: "Who you are today. What you're afraid of. What you're avoiding. What you hope to become. Sealed. Opened post-Passage.", icon: "✉️", target_week: 11 },
  { phase: "phase_3", title: "Submit Final SITREP", description: "Last pre-Passage report. Charges cleared to date. Commander's 75 summary. The baseline for post-Passage measurement.", icon: "📝", target_week: 11 },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4 — DEPLOYMENT (Week 12)
  // Mission: Arrive. Execute. Surrender to the process.
  // ═══════════════════════════════════════════════════════════

  // Week 12: The Passage ⚡
  // Directive: "You've done the preparation. Trust the process."
  { phase: "phase_4", title: "Arrive", description: "On time. Prepared. Ready.", icon: "🚀", target_week: 12 },
  { phase: "phase_4", title: "Post-Passage Debrief", description: "What broke? What did you see? What do you now believe is true? What do you commit to? (Auto-triggered 72 hours post-Passage)", icon: "📋", target_week: 12 },
  { phase: "phase_4", title: "Transition Plan", description: "Where next? Protocol? Command Room? 90-day execution plan. (Auto-triggered 1 week post-Passage)", icon: "🗺️", target_week: 12 },
];
