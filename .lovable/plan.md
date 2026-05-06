## Fix: passage date silently fails to save

### Root cause
- `operators` table RLS requires `has_role(auth.uid(), 'admin')` for `UPDATE`.
- `user_roles` table is empty → every Command-side update is silently rejected (0 rows changed, no error).
- The mutation reports success because Supabase returns `204` with no error.

### Changes

**1. Migration: seed admin role for existing Command users**

Add a migration that:
- Inserts an `admin` row into `public.user_roles` for every existing user in `auth.users` (your current Command logins). This is a one-time backfill so today's Command accounts immediately work.
- Adds a trigger on `auth.users` so any **future** signup through `/command/login` also gets the `admin` role automatically. (If you'd rather restrict this — e.g. only specific email domains, or manual promotion only — say so and I'll gate it. Default behaviour: anyone who can sign up at the Command login becomes admin, which matches how the app behaves today since Command is the only auth surface.)

**2. Make silent RLS rejections visible**

In `src/lib/operators.ts`, change `updateOperatorPassageDate` to:
- Use `.select()` after the update and check the returned row count.
- Throw a clear error ("Update blocked — your account does not have admin permissions") if 0 rows came back.

This means any future RLS regression will show an error toast instead of a fake "success".

**3. Same hardening for `updateOperatorStep` and other operator writes** (small follow-up in the same file) so the dashboard can't silently no-op again.

### Out of scope
- No changes to the Calendar component or popover — they're working correctly; the click does fire and the mutation does run.
- No changes to roadmap generation logic.

### After applying
You'll need to log out and log back in once so the session picks up the new role claim, then setting Ryan's passage date will save and the button will turn gold.
