## Problem

On the onboarding "Your Highest-Priority Charges" screen (`BigThreeScreen`), the operator sees the charges that have a `priority_rank` (1, 2, 3) assigned by Command. Right now there's no way for the operator to remove a duplicate or unwanted priority target — they just have to look at it. Same issue can show up on the Operator Dashboard's priority list.

## Plan

### 1. `src/components/onboarding/mind-clearing/BigThreeScreen.tsx`
- Add an `onRemovePriority: (id: string) => void` prop.
- Render a small "Remove" control (X icon from `lucide-react`) on each priority card, top-right corner near the "BIG #N" label.
- Clicking it calls `onRemovePriority(item.id)` — does not delete the charge, just clears its priority rank so it drops out of the Big Three list (still available in Full Inventory).
- After removal, the screen automatically shows the next highest charges (or fewer if none remain). Add an empty-state line if the list becomes empty: "No priority targets remaining. Continue to the Full Inventory to review all charges."
- The `Continue to Full Inventory` button stays enabled even when empty.

### 2. `src/components/onboarding/steps/MindClearingStep.tsx`
- Add a `removePriorityMutation` that calls `updateChargeItem(id, { priority_rank: null })` and invalidates the charge list query.
- Wire `handleRemovePriority` into the new prop on `<BigThreeScreen>`.

### 3. `src/components/operator/OperatorDashboard.tsx` (priority section)
- Apply the same affordance: a small X next to each `BIG #n` card that clears `priority_rank` via `updateChargeItem`. Same UX — does not delete the charge, just removes it from the priority list.
- Useful when Command has assigned more than 3 ranks or duplicated ranks.

## Out of scope
- We are NOT deleting the underlying charge_item records (the operator can still see them in the Full Inventory).
- We are NOT changing how Command assigns priorities in `ChargeListManager`.

## Technical notes
- `updateChargeItem` already supports `priority_rank: number | null` (see `src/lib/chargeItems.ts`).
- Realtime subscriptions in `MindClearingStep` and `OperatorDashboard` already invalidate on `charge_items` changes, so the UI will update automatically.
- Confirm-on-click is not added (single click removes); the action is reversible by Command from the dashboard, so a confirm dialog would just add friction.
