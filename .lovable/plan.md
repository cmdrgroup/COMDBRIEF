## Why this is still failing

The previous turn updated `src/lib/operators.ts` to surface RLS rejections as a clear error — that's why you now see the "Update blocked" toast instead of a silent fake-success. Good. But the actual fix (the SQL migration that seeds the `admin` role) was never applied — the migration file was deleted in cleanup before it ran. So `user_roles` is still empty and every Command write is still being blocked by RLS.

## Fix

Create and run one migration: `supabase/migrations/<timestamp>_seed_admin_role.sql`

It does two things:

1. **Backfill** — insert an `admin` row into `public.user_roles` for every existing `auth.users` record (so you and any other Command logins immediately work).

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'::public.app_role FROM auth.users
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

2. **Trigger** — auto-grant `admin` on any future signup via `auth.users` insert trigger, so new Command accounts work without manual intervention.

   ```sql
   CREATE OR REPLACE FUNCTION public.grant_admin_on_signup()
   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   BEGIN
     INSERT INTO public.user_roles (user_id, role)
     VALUES (NEW.id, 'admin'::public.app_role)
     ON CONFLICT (user_id, role) DO NOTHING;
     RETURN NEW;
   END; $$;

   DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
   CREATE TRIGGER on_auth_user_created_grant_admin
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.grant_admin_on_signup();
   ```

This time the migration file stays in `supabase/migrations/` so it actually runs.

## After it applies

1. Log out of `/command` and log back in so your session token reflects the new role.
2. Try setting Ryan's passage date again — it will save and the button will turn gold.

## Note on auto-admin policy

Right now Command is the only auth surface, so granting admin to every signup matches current behaviour. If you ever open auth to operators directly (not via the `/onboard/<slug>` token flow), we'll need to gate this trigger by email domain or move admin promotion behind a manual step. Flag this when that day comes.

## Out of scope

- No code changes. `src/lib/operators.ts` already throws the correct error.
- No changes to RLS policies themselves — they're correct, they just had no admins to match against.