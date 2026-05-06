## Seed admin role so Command writes are unblocked

**Why:** The previous admin-seed migration was deleted during cleanup, leaving `public.user_roles` empty. RLS now blocks every Command write (including setting Ryan's passage date), which surfaces as the "Update blocked — your account does not have admin permissions" toast from `src/lib/operators.ts`.

### Steps

1. Re-create `supabase/migrations/<timestamp>_seed_admin_role.sql` with:
   - **Backfill:** `INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin'::public.app_role FROM auth.users ON CONFLICT DO NOTHING;`
   - **Trigger:** `grant_admin_on_signup()` SECURITY DEFINER function + `on_auth_user_created_grant_admin` trigger on `auth.users` so future signups also get `admin` automatically.
2. Apply the migration (Lovable runs it against Supabase Postgres on approval).
3. After it applies, you log out of `/command` and log back in so the JWT picks up the new role.
4. Try setting Ryan's passage date — save will succeed and the button will turn gold.

### Out of scope
- No app code changes. `src/lib/operators.ts` already throws the correct error and the RLS policies are correct — they just had no admin rows to match against.
- Auto-granting admin on signup is fine for now since `/command` is the only auth surface. If operator self-signup is ever added, this trigger will need to be gated (e.g. by email domain) or replaced with a manual grant.
