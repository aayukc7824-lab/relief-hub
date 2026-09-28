# BhoteKoshi Relief Hub

A student-built information portal for Rasuwa, Nuwakot, and Dhading. The app
provides emergency contacts, a moderated missing-person workflow, recently
verified relief-camp information, and private volunteer and supply offers.

## Emergency services

For urgent help, call Nepal Police on **100** or the Armed Police Force on
**1114**. This site is not an emergency dispatch service and must not replace
instructions from local authorities.

## Local development

Requirements: Node.js 18+ and npm.

```sh
npm install
npm run dev
```

On Windows, create the local environment file with:

```powershell
Copy-Item .env.example .env
```

Fill `.env` with the project values described below. Without a configured
backend, submission fields remain disabled and no personal information is
collected. To create a production build:

```sh
npm run build
npm run preview
```

## Supabase setup

The app uses Supabase Auth, Postgres row-level security, and two Edge Functions.
It does not include fake report, shelter, or volunteer records.

1. Create a Supabase project and a Cloudflare Turnstile widget. Allow the
   production hostname `aayukc7824-lab.github.io` and `localhost` for local
   development.
2. Apply the SQL in
   [`supabase/migrations/20260928000000_initial.sql`](./supabase/migrations/20260928000000_initial.sql)
   using the Supabase SQL editor or `supabase db push`.
3. Deploy the functions:

   ```sh
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy submit-missing-report
   supabase functions deploy submit-volunteer-offer
   supabase secrets set TURNSTILE_SECRET_KEY=YOUR_TURNSTILE_SECRET_KEY
   supabase secrets set RATE_LIMIT_HASH_SECRET=YOUR_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
   supabase secrets set ALLOWED_ORIGINS=https://aayukc7824-lab.github.io,http://localhost:5173
   ```

   Never put the Turnstile secret or Supabase service-role key in the frontend,
   `.env`, or GitHub Pages variables. Supabase supplies the service-role key to
   Edge Functions at runtime.
4. In Supabase Auth, disable public sign-ups and invite staff accounts
   individually. Grant administrator access to each approved account in the SQL
   editor:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'approved-admin@example.com';
   ```

   Run this only for an account you trust with private reports and contact
   details.
5. For local development, copy `.env.example` to `.env` and fill:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (the public/publishable key; RLS must remain on)
   - `VITE_TURNSTILE_SITE_KEY`
   - `VITE_BACKEND_READY=true` only after migrations, Edge Functions, Turnstile,
     and administrator access have all been configured and tested.

   Do not add `.env` to Git.
6. For GitHub Pages, add those four frontend values under **Settings → Secrets
   and variables → Actions → Variables**. Set `VITE_BACKEND_READY` to `true`
   only after the backend is working. The workflow rebuilds the site on the
   next push or manual workflow run. Keep service-role, Turnstile secret, and
   rate-limit hash keys in Supabase Edge Function secrets only.

## Data handling

- Missing-person submissions are private and visible only to approved admins.
  A separate consent is required for a public notice; admins must verify it,
  and only adults can be listed. Public notices expire from the public view
  after 72 hours without re-verification. Contact details and full descriptions
  are never included in public notices.
- Volunteer and supply offers are private to approved admins. The form does not
  collect payment details or process donations.
- Public relief-camp information is written by approved admins and appears only
  while marked published and verified within the previous 24 hours.
- Admins can delete reports and offers when they are no longer needed. Review
  personal records regularly and remove them promptly.
- Public submissions require server-side Cloudflare Turnstile verification.
  Direct anonymous database writes are not allowed. A per-form hourly limit
  uses an HMAC of the request IP; the raw IP address is not stored.

Until Supabase, Turnstile, and the GitHub Pages variables are configured, the
public website shows the safe information-only state and keeps forms disabled.
Verify all operational information with local authorities before acting on it.
