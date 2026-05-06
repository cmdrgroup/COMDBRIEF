## Lock admin down to curtis.tofa@gmail.com only

**Problem:** The seed SQL I gave you did two over-broad things:
1. Backfilled `admin` for every row in `auth.users` (not just you).
2. Installed a trigger (`on_auth_user_created_grant_admin`) that auto-grants `admin` to every future signup.

This means anyone who ever signs up — including operators if they ever get auth accounts — becomes an admin. We need to revoke everything and re-grant only to you.

### Steps

1. Run a cleanup SQL block in the Supabase SQL Editor that:
   - Drops the `on_auth_user_created_grant_admin` trigger on `auth.users`.
   - Drops the `public.grant_admin_on_signup()` function.
   - Deletes every row from `public.user_roles` where `role = 'admin'`.
   - Re-inserts a single admin row for `curtis.tofa@gmail.com` (looked up by email from `auth.users`).

2. Verify with:
   ```sql
   SELECT u.email, ur.role
   FROM auth.users u
   LEFT JOIN public.user_roles ur ON ur.user_id = u.id;
   ```
   Only `curtis.tofa@gmail.com` should show `admin`. Everyone else should show `NULL`.

3. You log out of `/command` and back in so the JWT refreshes, then set Ryan's passage date to confirm it still works for you.

### Future operator grants
When you need to add another admin, run a one-line `INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = '...'` manually. No trigger, no auto-grant.

### Out of scope
No app code changes. RLS policies and `src/lib/operators.ts` are correct — we're just fixing the role data.

### The SQL to run

```sql
-- 1. Remove the auto-grant trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
DROP FUNCTION IF EXISTS public.grant_admin_on_signup();

-- 2. Revoke admin from everyone
DELETE FROM public.user_roles WHERE role = 'admin';

-- 3. Grant admin to Curtis only
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'curtis.tofa@gmail.com'
ON CONFLICT DO NOTHING;
```
