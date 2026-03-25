export const STEP_NAMES = [
  "Welcome Gate",
  "Mission Directive",
  "Rules of Engagement",
  "Mission Parameters",
  "Mission Failure Points",
  "Center of Gravity",
  "Mind Clearing Operations",
  "Communications Protocol",
  "Daily Battle Rhythm",
  "Command Authorization",
] as const;

export const MISSION_DIRECTIVE = {
  title: "MISSION DIRECTIVE",
  content: `The Commander's Passage is a 75-hour leadership transformation deployment designed for operators who refuse to settle. This is not theory. This is not motivation. This is an operational framework built for founders who build, lead, and command in the real world.

You have been selected because you demonstrate the capacity for command-level leadership. What follows is your pre-deployment briefing — the doctrines, directives, and operational standards that will govern your Passage.

CLASSIFICATION NOTICE: The material contained within this program is proprietary to CMDR Group. All frameworks, methodologies, language systems, and operational structures are classified as internal doctrine. Unauthorized reproduction, distribution, or disclosure of this material outside the program is strictly prohibited. By proceeding, you accept these classification parameters.`,
};

export const OPERATIONAL_DIRECTIVES = [
  {
    number: 1,
    title: "Execute With Discipline",
    description: "Discipline is the foundation of all operational success. You will show up, do the work, and execute the plan — regardless of how you feel. Feelings are data, not directives. Your commitment to the process must be non-negotiable.",
  },
  {
    number: 2,
    title: "Own Everything",
    description: "Extreme ownership is your default operating system. If something in your life or business isn't working, it's your responsibility. No blame. No excuses. No deflection. The moment you point the finger outward, you lose command authority.",
  },
  {
    number: 3,
    title: "Protect Your Center of Gravity",
    description: "Your Center of Gravity is the source of your power and effectiveness. You will learn to identify, protect, and strengthen it. Every operational decision should be filtered through this lens: does this protect or compromise my Center of Gravity?",
  },
  {
    number: 4,
    title: "Communicate With Precision",
    description: "Unclear communication is an operational failure. You will adopt the communication frameworks provided and use them consistently. Say what you mean. Mean what you say. Eliminate ambiguity from your language.",
  },
  {
    number: 5,
    title: "Maintain Operational Tempo",
    description: "Consistency beats intensity. Your Daily Battle Rhythm is not optional — it is the heartbeat of your deployment. Maintain tempo even when motivation fades. Especially when motivation fades.",
  },
  {
    number: 6,
    title: "Embrace Discomfort",
    description: "Growth lives on the other side of comfort. The exercises, assignments, and confrontations in this program are designed to challenge your current operating system. Lean in. Resistance is a signal that you're approaching the edge of your growth.",
  },
  {
    number: 7,
    title: "Trust the Process",
    description: "This program has been battle-tested. The sequence, the timing, the methodology — it's all intentional. Don't skip ahead. Don't cherry-pick. Follow the deployment sequence as designed. You will understand why in retrospect.",
  },
  {
    number: 8,
    title: "Guard Your Intel",
    description: "What's shared in The Passage stays in The Passage. You will hear and share things of deep personal and professional significance. The trust of the group is sacred. Protect it absolutely.",
  },
  {
    number: 9,
    title: "Lead From the Front",
    description: "You are here to become a better leader — not just for your business, but for your family, your team, and yourself. Leadership is not a title. It's a behaviour. Model the standard you expect from others.",
  },
];

export const THIS_IS_NOT = [
  {
    number: 1,
    title: "This Is Not Therapy",
    description: "While elements of this program may surface emotional content, The Commander's Passage is not a substitute for professional psychological support. If you are in crisis, seek appropriate professional help immediately.",
  },
  {
    number: 2,
    title: "This Is Not a Course",
    description: "There is no 'watch the videos and get a certificate' pathway here. This is an active deployment requiring daily execution, real-world application, and personal accountability. Passive participants will fail.",
  },
  {
    number: 3,
    title: "This Is Not a Mastermind",
    description: "While peer interaction is a component, this is not a networking group or business advisory circle. This is a leadership development deployment with a specific methodology and command structure.",
  },
  {
    number: 4,
    title: "This Is Not Motivation",
    description: "If you're looking for someone to pump you up and make you feel good, this isn't it. We deal in operational reality, tactical frameworks, and honest confrontation. Motivation is temporary. Systems are permanent.",
  },
  {
    number: 5,
    title: "This Is Not Optional Once You Start",
    description: "Half-measures and selective participation are not compatible with this program. If you deploy, you deploy fully. If you cannot commit to the full 75 hours and the Daily Battle Rhythm, do not commence.",
  },
  {
    number: 6,
    title: "This Is Not About Your Business Alone",
    description: "Yes, your business will benefit. But The Passage addresses the operator — the human being running the business. You cannot command effectively if you are compromised personally. This program is holistic by design.",
  },
];

export const FAILURE_POINTS = [
  { number: 1, text: "Not completing the Daily Battle Rhythm consistently." },
  { number: 2, text: "Skipping or rushing through exercises without genuine reflection." },
  { number: 3, text: "Failing to attend scheduled calls or sessions without prior notice." },
  { number: 4, text: "Not submitting SITREPs or required communications on time." },
  { number: 5, text: "Breaking confidentiality of group discussions or shared intel." },
  { number: 6, text: "Refusing to engage with uncomfortable material or exercises." },
  { number: 7, text: "Blaming external circumstances for lack of progress." },
  { number: 8, text: "Not implementing feedback or tactical adjustments from Command." },
  { number: 9, text: "Allowing lifestyle drift to erode your operational standards." },
  { number: 10, text: "Treating this as a passive learning experience rather than active deployment." },
  { number: 11, text: "Quitting when the terrain gets difficult — this is when the real work begins." },
];

export const COMMAND_CENTERS = [
  {
    name: "MIND",
    tactical: "Mental Fortification & Cognitive Discipline",
    operational: "Develop unshakeable mental frameworks that eliminate decision fatigue, emotional reactivity, and cognitive drift. Master the internal dialogue that drives every external outcome.",
  },
  {
    name: "TIME",
    tactical: "Temporal Command & Operational Cadence",
    operational: "Establish absolute command over your schedule, priorities, and operational tempo. Eliminate time leakage, implement battle rhythm discipline, and create sustainable high-performance routines.",
  },
  {
    name: "VISION",
    tactical: "Strategic Clarity & Directional Authority",
    operational: "Define, refine, and lock in your strategic direction across all domains — business, family, personal. Eliminate ambiguity in your mission and create clear operational objectives for the next 90 days and beyond.",
  },
  {
    name: "ENVIRONMENT",
    tactical: "Operational Theatre Control",
    operational: "Audit and optimise every environment you operate in — physical, digital, relational. Remove friction, eliminate compromise vectors, and engineer spaces that reinforce your operational standards.",
  },
  {
    name: "FIELD",
    tactical: "Execution Authority & Tactical Output",
    operational: "Bridge the gap between strategy and action. Develop execution systems that ensure consistent tactical output regardless of motivation, mood, or external conditions. This is where plans become results.",
  },
];

export const SUPPORT_HIERARCHY = [
  { step: 1, action: "Consult your Pre-Deployment Manual and program materials first." },
  { step: 2, action: "Review relevant training modules and exercises for answers." },
  { step: 3, action: "Post in the dedicated Slack/communication channel for peer support." },
  { step: 4, action: "Raise the issue during your next scheduled group session." },
  { step: 5, action: "Direct message your Command Officer via the approved channel." },
  { step: 6, action: "Request a dedicated 1:1 debrief if the issue requires private resolution." },
];

export const COMMUNICATION_FRAMEWORKS = [
  {
    name: "SITREP",
    fullName: "Situation Report",
    description: "Daily end-of-day report submitted to Command.",
    structure: [
      "WINS — What went well today. Minimum 3.",
      "LOSSES — Where you fell short. Own it.",
      "LESSONS — What did you learn or realise?",
      "TOMORROW'S INTENT — Top 3 priorities for tomorrow.",
      "COMMAND REQUEST — Any support needed from Command? (Optional)",
    ],
  },
  {
    name: "BUB",
    fullName: "Battle Update Brief",
    description: "Weekly progress update submitted before your group session.",
    structure: [
      "MISSION STATUS — Overall progress against your 90-day objectives.",
      "KEY ACHIEVEMENTS — Notable wins or breakthroughs this week.",
      "OBSTACLES — What's blocking or slowing progress?",
      "ADJUSTMENTS — What tactical changes are you making?",
      "SUPPORT NEEDED — Specific requests for Command or the group.",
    ],
  },
  {
    name: "FRAGO",
    fullName: "Fragmentary Order",
    description: "Used when you need to change plans or adjust your approach mid-deployment.",
    structure: [
      "SITUATION — What has changed?",
      "IMPACT — How does this affect your current mission/objectives?",
      "NEW INTENT — What is your adjusted plan?",
      "RESOURCES — What do you need to execute the adjustment?",
      "TIMELINE — When will the adjustment take effect?",
    ],
  },
];

export const DAILY_OPERATIONS = [
  { time: "Morning", action: "Complete Morning Battle Rhythm (prayer/meditation, physical training, journaling, priority setting)" },
  { time: "Midday", action: "Midday Checkpoint — Review progress against daily priorities, adjust as needed" },
  { time: "Afternoon", action: "Execute primary operational tasks — focused deep work on your highest-impact activities" },
  { time: "Evening", action: "Complete Evening Debrief — Review the day, capture lessons, prepare tomorrow's intent" },
  { time: "Night", action: "Submit Daily SITREP — Report to Command before 21:30" },
];

export const BATTLE_RHYTHM = [
  { time: "05:00", activity: "REVEILLE — Wake. No snooze. Feet on the floor.", phase: "morning" },
  { time: "05:15", activity: "MENTAL FORTIFICATION — Prayer, meditation, or focused breathing (15 min)", phase: "morning" },
  { time: "05:30", activity: "PHYSICAL TRAINING — Minimum 30 minutes. Non-negotiable.", phase: "morning" },
  { time: "06:00", activity: "FUEL — Clean nutrition. Hydration. No processed garbage.", phase: "morning" },
  { time: "06:30", activity: "COMMAND JOURNAL — Morning journal entry: gratitude, intent, focus.", phase: "morning" },
  { time: "07:00", activity: "MISSION BRIEF — Review today's priorities. Top 3 non-negotiables.", phase: "morning" },
  { time: "07:30–12:00", activity: "OPERATIONAL BLOCK 1 — Deep work. Highest-impact tasks. No distractions.", phase: "work" },
  { time: "12:00", activity: "MIDDAY CHECKPOINT — Review progress. Eat clean. Reset.", phase: "midday" },
  { time: "13:00–17:00", activity: "OPERATIONAL BLOCK 2 — Continued execution. Meetings, calls, tactical output.", phase: "work" },
  { time: "17:00", activity: "STAND DOWN — Close operational tasks. No new initiatives after this point.", phase: "evening" },
  { time: "17:30", activity: "PHYSICAL RECOVERY — Walk, stretch, or light activity.", phase: "evening" },
  { time: "18:00", activity: "FAMILY / PERSONAL TIME — Present. Device-free where possible.", phase: "evening" },
  { time: "20:00", activity: "EVENING DEBRIEF — Review the day. Capture wins, losses, lessons.", phase: "evening" },
  { time: "20:30", activity: "TOMORROW'S INTENT — Set top 3 priorities for tomorrow.", phase: "evening" },
  { time: "21:00", activity: "SITREP SUBMISSION — Submit daily report to Command.", phase: "evening" },
  { time: "21:30", activity: "LIGHTS OUT — Wind down. Screen-free. Sleep is a force multiplier.", phase: "evening" },
];

export const SITREP_STRUCTURE = [
  "OPERATOR: [Your Name]",
  "DATE: [Today's Date]",
  "WINS: [Minimum 3 wins from today]",
  "LOSSES: [Where you fell short — own it]",
  "LESSONS: [What you learned or realised]",
  "TOMORROW'S INTENT: [Top 3 priorities]",
  "COMMAND REQUEST: [Any support needed — optional]",
];
