## Rebuild roadmap when passage date changes

**Problem:** `reanchorRoadmapDates()` only shifts existing item dates against a frozen `totalWeeks` derived from the old roadmap. When you push the passage date out (or in), the phase structure (Weeks 1–4 / 5–8 / 9–11 / 12) and the underlying `target_week` values stay frozen — only `target_date` slides — so weeks anchored near the start can land before today and the four-phase split no longer matches the new window.

**Fix:** When the passage date changes on an operator who already has a roadmap, rebuild the roadmap against the new window so `totalWeeks`, phase assignments, and per-item `target_date` are all recomputed.

### Behaviour

In `passageDateMutation` (`src/pages/CommandDashboard.tsx`), when a roadmap already exists and the date changes:
1. Capture which item titles are currently `completed` for that operator.
2. Delete all existing `roadmap_items` for the operator.
3. Run `loadDefaultTemplate(operatorId, newPassageDate)` — this recomputes `totalWeeks` via `computeWeeksUntilPassage`, re-assigns weeks, re-derives `target_date`, and re-inserts everything.
4. Re-mark items whose title matches a previously-completed item as `completed` (best-effort preservation of progress).
5. Toast: "Roadmap rebuilt for new passage date" so it's clear the schedule was regenerated, not just shifted.

If no roadmap exists yet, behaviour is unchanged: `generateRoadmapForOperator` runs (creates or defers based on `ROADMAP_AUTOGEN_MAX_WEEKS`).

### Implementation

1. **`src/lib/roadmap.ts`** — add `rebuildRoadmapForOperator(operatorId, passageDate)`:
   - Fetch existing items, collect titles where `completed = true`.
   - `delete from roadmap_items where operator_id = ...`.
   - Call `loadDefaultTemplate(operatorId, passageDate)`.
   - Re-fetch new items, update `completed = true, completed_at = now()` for any whose `title` matches the captured set.
   - Returns `"rebuilt"` so the caller can toast appropriately.

2. **`src/pages/CommandDashboard.tsx`** — in `passageDateMutation.mutationFn`, replace the `reanchorRoadmapDates` branch with `rebuildRoadmapForOperator`. Update the success toast for the new `"rebuilt"` result. Also invalidate the `roadmap_items` query so any open OperatorDetail/Roadmap view refreshes.

### Notes
- Title-based completion preservation is intentionally simple. Identical titles (e.g. multiple "Submit SITREP" entries) match by title only, so completion may collapse onto the first matching slot. That is acceptable — the alternative (matching by phase + target_week) would lose completions whenever the week shifts.
- Custom items added by Command via `addRoadmapItem` will be **lost** in the rebuild because they aren't part of the template. If you've been adding bespoke items, tell me and we'll preserve them by re-inserting non-standard items after the rebuild.
- Weekly focus rows (`weekly_focus`) reference `week_number` directly. If `totalWeeks` changes, week numbers in those rows may now point to weeks that don't exist or have shifted meaning. Out of scope for this fix; flag if you want them cleared on rebuild too.
