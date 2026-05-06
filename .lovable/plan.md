## Move roadmap generation to passage-date trigger + anchor to real dates

### 1. Database migration (run in Supabase SQL Editor)
```sql
ALTER TABLE public.roadmap_items ADD COLUMN IF NOT EXISTS target_date DATE;
```

### 2. Remove roadmap auto-load from GHL webhook
`supabase/functions/ghl-webhook/index.ts` — delete the entire roadmap-loading block (~lines 156–235) and drop `roadmap_loaded` from the response. Charges still generate on signup.

### 3. Add date-anchoring helpers to `src/lib/roadmap.ts`

```ts
// Variable totalWeeks — final week lands on passage date, earlier weeks step back 7 days each.
export function computeTargetDate(passageDate: string, targetWeek: number, totalWeeks: number): string {
  const passage = new Date(`${passageDate}T00:00:00Z`);
  const offsetDays = (totalWeeks - targetWeek) * 7;
  return new Date(passage.getTime() - offsetDays * 86400000).toISOString().slice(0, 10);
}
```

Update `loadDefaultTemplate(operatorId, passageDate?)` to compute `target_date` per item using `totalWeeks = max(target_week)` from the template (so it adapts when the template length changes — no hardcoded 12).

Add:
- `generateRoadmapForOperator(operatorId, passageDate)` — checks if items exist; if not, inserts the default template anchored to the passage date. Returns `true` if generated, `false` if skipped.
- `reanchorRoadmapDates(operatorId, passageDate)` — fetches existing items, derives `totalWeeks` from the max `target_week` present, recalculates and updates `target_date` on each item. Preserves all item content, completion state, and custom additions.

### 4. Wire into `passageDateMutation` in `src/pages/CommandDashboard.tsx`

```ts
mutationFn: async ({ id, date }) => {
  await updateOperatorPassageDate(id, date);
  if (date) {
    const created = await generateRoadmapForOperator(id, date);
    if (!created) await reanchorRoadmapDates(id, date);
  }
  // Clearing the date: leave roadmap items intact (per your direction)
}
```

Add a toast: "Roadmap generated" on first set, "Roadmap dates updated" on re-anchor, "Passage date cleared" when nulled.

### 5. Surface real dates in the roadmap UI (`src/components/roadmap/RoadmapView.tsx`)
Where items currently show "Week N", show `format(target_date, "Week of d MMM yyyy")` when `target_date` is set, falling back to "Week N" otherwise. Quick scan + minimal edit — the bulk of the file is unchanged.

### Behaviour summary
| Action | Effect |
|---|---|
| Set passage date (no roadmap yet) | Generate full roadmap, anchored |
| Set passage date (roadmap exists) | Re-anchor existing items, no regeneration |
| Change passage date | Re-anchor existing items |
| Clear passage date | Roadmap untouched (dates remain from previous setting) |

### Forward-compatibility for Message 3
`computeTargetDate` and `loadDefaultTemplate` already accept variable `totalWeeks` derived at runtime from `max(target_week)`. When you switch to a dynamic-window template (different length per operator based on their available time), no changes to the anchoring math are needed — it adapts automatically.