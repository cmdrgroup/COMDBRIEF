## Add Commander's Passage date per operator

### 1. Database migration
Add a nullable `passage_date` (DATE) column to the `operators` table.

```sql
ALTER TABLE public.operators ADD COLUMN passage_date DATE;
```

(No default — set manually per operator. Existing RLS policies already cover updates by command/admin users, so no policy changes needed.)

### 2. Data layer (`src/lib/operators.ts`)
Add a helper:

```ts
export async function updateOperatorPassageDate(operatorId: string, date: string | null) {
  const { error } = await supabase
    .from("operators")
    .update({ passage_date: date })
    .eq("id", operatorId);
  if (error) throw error;
}
```

### 3. Admin dashboard UI (`src/pages/CommandDashboard.tsx`)
- Add a new column **"Passage Date"** to the operators table (between Status and Progress).
- Render a shadcn date picker (Popover + Calendar) in each row showing the current `passage_date` or "Set date".
- On select → call `updateOperatorPassageDate` via a `useMutation`, then invalidate the `["operators"]` query so the table refreshes.
- Allow clearing the date (small × button next to the picker when a date is set).
- Format displayed dates as `en-AU` short (e.g. `12 Jun 2026`).

### 4. Surface the date elsewhere (optional but useful)
- Show "Passage: {date}" in the `OperatorDetail` modal header so it's visible when drilling in.
- Show it on the operator's own dashboard (`OperatorDashboard.tsx`) as a "T-minus X days to Passage" countdown banner if `passage_date` is set in the future.

If you'd rather keep this minimal, I can skip step 4 and just do the admin-side date picker.

### Technical notes
- shadcn `Calendar` + `Popover` are already in the project (`src/components/ui/calendar.tsx`, `popover.tsx`).
- The Supabase types file regenerates automatically after the migration so `passage_date` becomes a typed field on `Operator`.
- Mutation uses optimistic invalidation — same pattern as the existing `createMutation`.

**Confirm:** include the operator-facing countdown (step 4), or admin-only for now?