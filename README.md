# BhoteKoshi Relief Hub

An independent, client-facing operations portal prototype for the Bhote Koshi
region, designed for community support coordination, structured reporting, and
information updates across Rasuwa, Nuwakot, and Dhading.

- **Live site:** [aayukc7824-lab.github.io/relief-hub](https://aayukc7824-lab.github.io/relief-hub/)
- **Source code:** [github.com/aayukc7824-lab/relief-hub](https://github.com/aayukc7824-lab/relief-hub)

## What it does

- Presents operational information, emergency contacts, and reporting flows for
  missing-person cases, shelter status, and volunteer support.
- Provides a responsive React interface for client-facing dashboards, private
  review submissions, and field updates.
- Includes a professional workflow for private submissions, staff review,
  administrator-managed relief-camp updates, and report/offer status tracking.

## Current status and safety

The live GitHub Pages site is an information-and-reporting prototype. Supabase
and Cloudflare Turnstile are configured, but end-to-end submission testing has
not passed, so online missing-person reports and volunteer offers remain
**disabled**. The GitHub Pages workflow explicitly builds with intake disabled.
No demo reports, shelter availability, or volunteer offers are presented as
real operational data.

This is a professional-style operations portal and reporting project, not an
emergency dispatch service. Verify urgent information with local authorities and
call the listed emergency services directly.

## Client review package

The [client handover and review report](./docs/client-handover.md) summarizes
the delivered scope, current validation, known limitations, and the steps that
must be completed before any production launch. The current build is for review
and demonstration; live reporting remains disabled pending backend setup and
end-to-end testing.

## Built with

- React 18
- Vite 6
- JavaScript and CSS
- Supabase (backend scaffolding for Auth, Postgres, and Edge Functions)
- Cloudflare Turnstile (submission-abuse protection when configured)

## Run locally

Requirements: Node.js 18+ and npm.

```sh
npm install
npm run dev
```

For a production build and local preview:

```sh
npm run build
npm run preview
```

## Personal portfolio

A separate static developer portfolio is available in [`portfolio/`](./portfolio/).
While the Vite development server is running, open
`http://localhost:5173/portfolio/` to preview it. The production build includes
it at `/relief-hub/portfolio/` on GitHub Pages. The private editor is at
`/relief-hub/portfolio/admin/`; only accounts explicitly added to
`public.portfolio_admin_users` can publish edits. When Supabase is configured,
visitors receive portfolio updates in real time. Without it, the portfolio
continues to show its built-in version.

## Emergency services

For urgent help, call Nepal Police on **100** or the Armed Police Force on
**1114**. This site is not an emergency dispatch service and must not replace
instructions from local authorities.

## Configure the backend

The backend is optional for local frontend development. Without configuration,
submission fields stay disabled and the app does not collect personal
information. To work on the backend features:

1. Create a Supabase project and a Cloudflare Turnstile widget. Allow the
   production hostname `aayukc7824-lab.github.io` and `localhost` for local
   development.
2. For local backend development, create `.env` from the example file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Apply the migrations in filename order using the Supabase SQL editor or
   `supabase db push`:
   - [`20260928000000_initial.sql`](./supabase/migrations/20260928000000_initial.sql)
   - [`20260929000000_portfolio_realtime.sql`](./supabase/migrations/20260929000000_portfolio_realtime.sql)
   - [`20261001000000_public_missing_persons_registry.sql`](./supabase/migrations/20261001000000_public_missing_persons_registry.sql)

   The app already has a private `missing_reports` table, a restricted
   `missing_public_notices` table, and a `relief_camps` table. The new
   `missing_persons` view exposes only active, verified, time-limited public
   notices; do not create a second public table with private report details.
   Production data starts empty. Do not seed invented people, shelters,
   occupancy, or availability as if it were real.
4. Deploy the functions:

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
5. In Supabase Auth, disable public sign-ups and invite staff accounts
   individually. Grant administrator access to each approved account in the SQL
   editor:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'approved-admin@example.com';
   ```

   Run this only for an account you trust with private reports and contact
   details.
   To allow one account to edit the public portfolio, first create/invite that
   account in Supabase Auth, then assign it separately:

   ```sql
   insert into public.portfolio_admin_users (user_id)
   select id from auth.users where email = 'your-editor-email@example.com'
   on conflict (user_id) do nothing;
   ```

   Keep public sign-ups disabled; only grant this portfolio editor access to
   your own trusted account.
6. Fill `.env` with:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (the public/publishable key; RLS must remain on)
   - `VITE_TURNSTILE_SITE_KEY`
   - `VITE_BACKEND_READY=true` only after the Relief Hub migrations, Edge
     Functions, Turnstile, and administrator access have all been configured
     and tested. The portfolio editor and live updates use only the Supabase
     URL and public anon key, with database access restricted by RLS.

   Do not add `.env` to Git.
7. For GitHub Pages, add the Supabase URL, public anon key, and Turnstile site
   key under **Settings → Secrets and variables → Actions → Variables**. The
   deployment workflow currently forces `VITE_BACKEND_READY=false`, regardless
   of any repository variable, because end-to-end intake and staff-workflow
   testing is not complete. Only change that workflow gate after an authorized
   owner approves activation and the acceptance tests pass. Keep service-role,
   Turnstile secret, and rate-limit hash keys in Supabase Edge Function
   secrets only.

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

The public website keeps report and offer intake disabled until an authorized
owner approves activation after successful end-to-end and staff-workflow tests.
Verify all operational information with local authorities before acting on it.
