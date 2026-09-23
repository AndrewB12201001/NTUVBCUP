# NTUVBCUP
This repository is the authenticated NTU Cup organizer application. It keeps the
existing scheduling engine and publishes the shared JSON tournament snapshot to
Supabase for the public results site.

## Documentation

- [LocalStorage Reference](./LOCAL_STORAGE_README.md)
- [Deployment guide and staged rollout](./DEPLOYMENT.md)

Build the static deployment with `npm run build`, then preview with
`python3 -m http.server 8000 --directory dist`.

## Backend setup

1. Create a Supabase project and run
   `supabase/migrations/202609220001_shared_tournament_snapshot.sql` in its SQL
   editor.
2. In Supabase, open **Authentication → Users** and create or invite the
   administrator using their email address. The administrator must be an Auth
   user before they can be allowlisted. Then run this in the SQL editor,
   replacing the example email with that Auth user's exact email:

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where lower(email) = lower('your-admin-email@example.com')
   on conflict (user_id) do nothing
   returning user_id;
   ```

   The returned value should look like
   `123e4567-e89b-12d3-a456-426614174000`. A username such as
   `ANDREW_IS_ALIVE` is not a UUID and cannot be used here. If the query returns
   no row, create the Auth user first or check that the email matches.

   Verify the allowlist with:

   ```sql
   select au.user_id, u.email
   from public.admin_users au
   join auth.users u on u.id = au.user_id;
   ```
3. In the admin Cloudflare Pages project, configure these build variables:
   `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and optionally
   `NTUCUP_TOURNAMENT_SLUG` (defaults to `ntu-cup`). Never use a Supabase
   `service_role` key in either frontend.
4. In Supabase Authentication URL Configuration, set the admin site's deployed
   URL as the Site URL and allow its `/login.html` URL as a redirect URL.
5. Build and deploy. Sign in, verify the local organizer data, and press
   **Publish now** once to create the shared cloud snapshot. After that first
   publish, normal save operations publish automatically.

The admin write endpoint is a Cloudflare Pages Function at `/api/publish`. It
validates the JSON snapshot, verifies the Supabase access token, and writes with
that same user token so the database RLS policies remain the final permission
check. Keep the root `functions/` directory in the Cloudflare project; it is not
part of `dist/`.

`python3 -m http.server` is sufficient for checking static pages, but it does
not run the publish Function. For an end-to-end local publish test, use
`npx wrangler pages dev dist` and supply the two Supabase variables through a
gitignored `.dev.vars` file.

The matching public frontend is developed in the `supabase-integration` branch
of `Andrew-is-alive/ntucup`. It uses the same Supabase URL, publishable key, and
tournament slug, but its database role has read-only access through RLS.
