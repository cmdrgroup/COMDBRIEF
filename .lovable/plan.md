## Dynamic roadmap window based on time-until-Passage

### Concept
Stop hardcoding 12 weeks. Compute the available window from `today → passage_date`, then map template items into it. Fixed items hold their position relative to start/end; clearing sessions distribute across the remaining middle weeks.

### 1. Tag every template item with an anchor (`src/lib/roadmapTemplate.ts`)
Extend `RoadmapTemplateItem`:
```ts
type Anchor = "start" | "end" | "flex";
interface RoadmapTemplateItem {
  phase: RoadmapPhase;
  title: string;
  description: string;
  icon: string;
  anchor: Anchor;
  offset: number;        // start: weeks from week 1 (0..3). end: weeks before passage week (0..2).
  flex_cluster?: number; // 0..N for flex items, groups items that should share the same week
}
```

Re-tag the existing 33 items:
- **Phase 1** (start, offsets 0–3): Manual review, Mind Clearing Inventory, Begin C75, Time Audit, First SITREP, Physical Baseline, Learn Framework, First Clearing BIG#1, Record Outcome, Foundations Assessment, 90-Day Objectives, SITREP+Compliance.
- **Phase 2 + W9 of Phase 3 = flex clusters 0–4**: Self-Doubt+SITREP / Fear+SITREP / Guilt+Shame+Judgment+SITREP / Resentment+Frustration+ChargeInventoryReview+SITREP / ClearRemaining+90DayCheckin+SITREP.
- **Phase 3 W10 → end offset 2**: Physical Readiness, Home Front Prep, SITREP.
- **Phase 3 W11 → end offset 1**: Packing, Letter to Self, Final SITREP.
- **Phase 4 → end offset 0**: Arrive, Debrief, Transition.

(`target_week` field removed from the template — it's computed at insert time.)

### 2. New helpers in `src/lib/roadmap.ts`

```ts
const MIN_WEEKS = 8; // 4 (phase 1) + 3 (end anchors) + 1 (must have at least one flex slot)

export function computeWeeksUntilPassage(passageDate: string, today: Date = new Date()): number {
  const passage = new Date(`${passageDate}T00:00:00Z`);
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const diffDays = Math.max(0, Math.round((passage.getTime() - todayUtc.getTime()) / 86400000));
  const weeks = Math.ceil(diffDays / 7);
  return Math.max(MIN_WEEKS, weeks);
}

export function assignWeekNumbers(items: RoadmapTemplateItem[], totalWeeks: number): (RoadmapTemplateItem & { target_week: number })[] {
  const startWindowEnd = 4;                 // phase 1 always weeks 1–4
  const endWindowStart = totalWeeks - 2;    // last 3 weeks reserved for end anchors
  const flexStart = startWindowEnd + 1;     // first flex week
  const flexEnd = endWindowStart - 1;       // last flex week (inclusive)
  const flexSpan = Math.max(1, flexEnd - flexStart + 1);

  const flexClusters = [...new Set(items.filter(i => i.anchor === "flex").map(i => i.flex_cluster!))].sort((a, b) => a - b);
  const clusterToWeek = new Map<number, number>();
  flexClusters.forEach((c, idx) => {
    const week = flexClusters.length === 1
      ? flexStart
      : flexStart + Math.round(idx * (flexSpan - 1) / (flexClusters.length - 1));
    clusterToWeek.set(c, Math.min(flexEnd, Math.max(flexStart, week)));
  });

  return items.map(item => {
    let target_week: number;
    if (item.anchor === "start") target_week = 1 + item.offset;
    else if (item.anchor === "end") target_week = totalWeeks - item.offset;
    else target_week = clusterToWeek.get(item.flex_cluster!)!;
    return { ...item, target_week };
  });
}
```

Update `loadDefaultTemplate` to take `passageDate` (required for week assignment) and call `assignWeekNumbers(DEFAULT_ROADMAP_ITEMS, computeWeeksUntilPassage(passageDate))` before insert. Each row's `target_week` and `target_date` come from the dynamic calc.

Update `generateRoadmapForOperator(operatorId, passageDate)` to call the new path. No external API change.

`reanchorRoadmapDates` stays as-is (it re-derives totalWeeks from existing items' max `target_week`, then recomputes `target_date`). Per your prior direction: re-setting passage date does NOT reassign week numbers, only re-anchors calendar dates.

### 3. Edge cases
- **Passage < 8 weeks away**: clamp to MIN_WEEKS=8. The roadmap "starts in the past" — earlier weeks' calendar dates fall before today. Show a toast warning: "Passage is less than 8 weeks away — roadmap compressed; some early items have past target dates."
- **Passage = today or earlier**: same clamp; warn.
- **Multiple flex clusters compressed into same week**: that's intentional — better to load a week than drop work. Items already share weeks in the original 12-week template (e.g. Resentment + Frustration both W8).

### 4. Behavioural confirmation
- 12-week window → identical layout to current hardcoded template.
- 10-week window → Phase 1 stays W1–4. Phase 4 = W10. Phase 3 end anchors = W8, W9. Flex clusters compressed into W5–7.
- 16-week window → Phase 1 stays W1–4. Phase 4 = W16. End anchors = W14, W15. Flex clusters spread across W5–13 (more breathing room between clearing sessions).

### 5. UI nicety (small)
Add a subtle "{N}-week window" label in the roadmap header. Already shows "Week N of 12" — change to "Week N of {totalWeeks}" derived from `max(target_week)` of the operator's items.

### Out of scope (raise later if needed)
- Phase boundaries (`phase_1`/`phase_2`/etc.) — keep current phase tags; UI groups by phase. If you want phase labels to also flex (e.g. "Clearing Operations: Weeks 5–9" instead of fixed "5–8"), say so and I'll derive phase ranges from item weeks.