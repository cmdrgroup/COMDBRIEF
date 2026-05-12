## Goal

When an admin pastes a pre-formatted charge list (e.g. Garry's 84 statements with category headings and emojis), import every statement exactly as pasted into the correct category — no AI rewriting, no dropped lines.

## Behaviour

In `ChargeListManager.tsx`, the "Generate" button currently always calls the `generate-charges` edge function. We will make it route based on what was pasted:

1. **JSON intake** → existing AI flow (unchanged).
2. **Formatted charge list** (heading-based, see detector below) → new verbatim parser, skip AI entirely. Drafts open in the existing review panel so the admin can still toggle/keep/delete before approving.
3. **Free-text intake notes** (no recognisable headings) → existing AI flow (unchanged).

## Detector

Treat the paste as a formatted charge list when it contains 2+ category headings. A heading line matches one of the 10 categories from `CHARGE_CATEGORIES` (case-insensitive) optionally preceded by its emoji and/or extra words like "&", "and". Examples that must match:
- `😬 FEAR & ANXIETY`
- `FEAR AND ANXIETY`
- `Self Doubt`
- `💔 GRIEF & LOSS`

Mapping table (label → category key): Anger → `anger`, Resentment → `resentment`, Frustration → `frustration`, Fear & Anxiety / Fear and Anxiety → `fear_anxiety`, Self Doubt / Self-Doubt → `self_doubt`, Guilt & Shame → `guilt_shame`, Judgment → `judgment`, Infatuation → `infatuation`, Depression → `depression`, Grief & Loss → `grief_loss`.

## Verbatim parser

Walk the pasted text line by line:

1. Trim each line. Skip blank lines.
2. If the line matches a category heading → switch the "current category" to that key.
3. Otherwise, if there is a current category, treat the line as a charge statement:
   - Strip leading bullets/numbers (`- `, `* `, `• `, `1. `).
   - Keep the statement text exactly as pasted (no rewording, no prefix injection).
   - Default `chargeLevel` to `7` (mid-high; admin can adjust in review).
   - Default `domain` to `both`, `source` to `stated`.
   - Append to the drafts array.
4. Lines before the first heading are ignored (e.g. preamble).

No statement is dropped, merged, or summarised. The count of drafts must equal the count of non-heading, non-blank lines after the first heading.

## UI changes

- Same single "Generate" button. After parsing, show drafts in the existing review panel exactly like AI output.
- Add a small toast/info line above the review list when verbatim mode was used: `"Imported {N} charges verbatim from pasted list"` so the admin can sanity-check the count against their source.
- Update the textarea placeholder to mention the third supported format: a charge list with category headings.

## Files to change

- `src/components/dashboard/ChargeListManager.tsx`
  - Add `parseFormattedChargeList(text)` helper (pure function, returns `DraftCharge[]` or `null` if not a formatted list).
  - In `generateMutation.mutationFn`, try the parser first. If it returns a non-empty array, set drafts directly and return without calling the edge function. Otherwise fall through to the existing JSON / free-text AI path.
  - Track whether the last batch was verbatim (local state) to render the count notice in the review panel.
  - Update placeholder text.

No edge function, schema, or roadmap code changes.

## Out of scope

- Auto-detecting `priorityRank` / Big #1-#3 from pasted text (admin sets these in review as today).
- Parsing blind-spot questions from pasted text (rare in admin pastes; admin can add manually).
- Changing the AI prompt or its handling of free-text intake.
