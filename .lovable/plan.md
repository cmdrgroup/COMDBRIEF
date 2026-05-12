## Goal

Stop relying on heading detection. Give the admin a textarea per category, paste lines, hit one button, every line becomes a charge in that category — no AI, no parsing ambiguity, no dropped statements.

## Why

The current verbatim parser depends on detecting category headings in a single big paste. Garry's paste has emoji + extra wording that's slipping past the regex, so only ~59 of 84 lines land. A per-category input removes that guessing entirely: one line in = one charge out.

## UX

In `ChargeListManager.tsx`, replace the single "Generate from Intake" entry with two side-by-side buttons:

1. **Generate from Intake** — existing AI/JSON/free-text flow (unchanged).
2. **Paste by Category** — new flow described below.

When "Paste by Category" is open, render a stacked panel: 10 collapsible category cards (using `CHARGE_CATEGORIES`), each with:
- Category emoji + label header
- A textarea ("One charge per line")
- A live count: `N lines`

Below the cards:
- **Default level** number input (1–10, default 7) applied to every imported line
- **Import N charges** primary button (shows total non-blank lines across all 10 textareas)
- **Cancel** button

Behaviour on import:
- For each category, split textarea by `\r?\n`, trim, drop blank lines, strip leading bullets/numbers (`- `, `* `, `• `, `1. `).
- Build `DraftCharge[]` with `category`, `statement`, `chargeLevel = defaultLevel`, `inferred: false`, `accepted: true`.
- Push into existing `drafts` state and open the existing review panel (`showDraftReview = true`) so the admin can still toggle/edit before approving.
- Set `verbatimCount` to total imported so the existing "Imported N charges verbatim" notice shows.
- Toast: `"Loaded {N} charges across {M} categories"`.

No edge function call. No AI. Count of drafts must equal sum of non-blank lines across textareas.

## Files to change

- `src/components/dashboard/ChargeListManager.tsx`
  - Add state: `showCategoryPaste: boolean`, `categoryPastes: Record<string, string>` (keyed by category key, init to ""), `defaultPasteLevel: number` (default 7).
  - Add new button next to "Generate from Intake" that toggles `showCategoryPaste`.
  - Add new panel rendered when `showCategoryPaste && !showDraftReview`, with the 10 textareas described above.
  - Add `importByCategory()` handler that builds drafts and opens the review panel.
  - Reuse the existing draft review + approve flow as-is.

No changes to `parseFormattedChargeList` (kept for the legacy paste-everything case), no edge function changes, no schema changes.

## Out of scope

- Auto-detecting `priorityRank` / Big #1-#3 from pastes (admin still sets in review).
- Per-line level overrides (admin can adjust in review panel after import).
- Removing the existing single-paste verbatim parser.
