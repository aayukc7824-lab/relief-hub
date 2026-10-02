# BhoteKoshi Relief Hub — Backend Configuration Status

**Last Updated:** 2026-10-02
**Status:** Backend infrastructure is configured; **submissions remain disabled pending successful acceptance testing and staff authorization**

---

## ✅ Configured Components

### Supabase Project
- **Project:** BhoteKoshi Relief Hub
- **Reference:** `jqcwwpnlpmwxijahegia`
- **Region:** ap-northeast-1 (Tokyo)
- **Database:** PostgreSQL 17.11.0.002
- **Status:** Active and healthy
- **Migration history:** All three repository migrations are recorded as applied. The remote schema already existed and was verified before its migration ledger was reconciled; no schema migration was re-executed.

### Authentication (Auth)
- **Public user sign-ups:** ❌ **Disabled**
- **Staff authorization:** No Relief Hub admin account has been authorized yet. Add an existing `auth.users.id` to `public.admin_users` only after confirming the person is trusted.
- **Automatic session management:** Configured

### Edge Functions (Deployed)
Both submission functions are **live and responsive** on the production network:

1. **`submit-missing-report`** → `https://jqcwwpnlpmwxijahegia.supabase.co/functions/v1/submit-missing-report`
   - Accepts private case reports
   - Rate-limited to 5 submissions per IP per hour
   - CORS configured for `https://aayukc7824-lab.github.io` and `http://localhost:5173`
   - Preflight test: ✅ 200 OK, correct origin allowed

2. **`submit-volunteer-offer`** → `https://jqcwwpnlpmwxijahegia.supabase.co/functions/v1/submit-volunteer-offer`
   - Accepts volunteer and supply offers
   - Rate-limited identically
   - Preflight test: ✅ 200 OK

### Secrets (Edge Functions)
All three required server-side secrets are configured and masked:

| Secret Name | Status | Last Updated |
|-------------|--------|--------------|
| `TURNSTILE_SECRET_KEY` | ✅ Configured | 2026-10-01 17:09 UTC |
| `RATE_LIMIT_HASH_SECRET` | ✅ Fresh | 2026-10-01 15:11 UTC |
| `ALLOWED_ORIGINS` | ✅ Set | 2026-10-01 15:10 UTC |

**Note:** The secret was rotated after an initial exposure. A local synthetic submission was rejected with HTTP 403 by Turnstile, and no test record was stored. The active secret was rechecked by the project owner; a successful end-to-end submission is still pending.

### Cloudflare Turnstile
- **Widget ID:** `0x4AAAAAAFLLuj7PAEecRMdd`
- **Hostnames configured:**
  - `aayukc7824-lab.github.io` (production)
  - `localhost` (local testing)
- **Site Key (public):** `0x4AAAAAAFLLuj7PAEecRMdd` ← safe to use in frontend
- **Secret Key:** Configured in Supabase (not stored locally or in repository)

### Frontend Configuration
- **`.env` file:** Git-ignored; contains public Supabase and Turnstile site keys
- **`VITE_BACKEND_READY`:** ❌ `false` — submissions intentionally disabled
- **Local dev server:** Stopped after local testing
- **Production build:** ✅ Passed and published through GitHub Actions
- **Live site state:** Setup required; public data reads and intake remain disabled

---

## ⚠️ Disabled Until Authorized

### Online Submission Forms
✅ **Functions deployed** | ❌ **Forms disabled for end-users**

The web forms explicitly show:
> "Online reports and volunteer offers are disabled until secure setup and testing are complete."

**Why:** To prevent accidental live intake before staff review processes are in place.

**To enable:** The GitHub Pages deployment workflow currently forces
`VITE_BACKEND_READY=false`. An authorized owner should change that workflow
gate only after:
1. ✅ Staff authorization table is populated
2. ✅ Private staff review workflows are tested
3. ✅ Public notice publication policy is approved

---

## 📋 Pre-Launch Checklist

- [x] Supabase project created and linked
- [x] Existing database schema verified; all three migration versions recorded as applied
- [x] Public sign-ups disabled
- [x] Both Edge Functions deployed and active
- [x] CORS correctly configured and tested
- [x] Turnstile widget created with site and secret keys
- [x] Server secrets configured in Supabase
- [x] Rate limiting function deployed
- [x] Frontend production build passes
- [x] Local `.env` configured with public keys only
- [ ] **Complete end-to-end submission test** (synthetic submission with a valid Turnstile token; a prior attempt was rejected with 403)
- [ ] **Authorize staff in `admin_users` table** (at least one trusted account)
- [x] **Keep `VITE_BACKEND_READY=false`** in the GitHub Pages workflow until acceptance checks pass
- [x] **Publish updated review build to GitHub Pages** with intake explicitly disabled
- [ ] **Enable public data reads** after confirming deployment variables and reviewing the public-read policy
- [ ] **Document staff procedures** for review and publication workflows

---

## 🔒 Security Notes

1. **Secrets are never in the repository.** Server-side secrets live only in Supabase; frontend receives no service-role keys.
2. **Public sign-ups are blocked.** Only explicitly authorized staff can use the review console.
3. **Submissions are rate-limited** by IP address using HMAC-SHA256 hashing (not stored).
4. **Turnstile verification is required** for every submission; failed verification returns 403.
5. **CORS is strict** and allows only configured origins.
6. No synthetic test report was found in the database after the rejected attempt. Verify operational records only through authorized staff review.

---

## 🚀 Next Steps

### 1. End-to-End Test (Local)
Run a synthetic missing-person report submission from `http://localhost:5173`:
- Fill the Missing Persons form with valid test data
- Turnstile challenge should appear and complete
- Submission should succeed (201) with private confirmation
- Check Supabase table `missing_reports` for the test entry

### 2. Populate Staff Authorization
After inviting the trusted staff member and verifying their account exists in Supabase Auth, run:
```sql
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users
WHERE email = 'trusted-staff@example.com'
ON CONFLICT (user_id) DO NOTHING;
```
Confirm exactly one authorized account is present before enabling staff workflows.

### 3. Enable Frontend Submissions
After end-to-end testing passes, staff access and review procedures are
approved, and the operations owner authorizes launch, change
`VITE_BACKEND_READY=false` in `.github/workflows/deploy-pages.yml`. Until then,
keep the GitHub Pages workflow forcing intake off.

### 4. Review the GitHub Pages build
The updated review build is published at
`https://aayukc7824-lab.github.io/relief-hub/`. The workflow explicitly forces
intake off. Re-run deployment only after reviewing the source changes.

### 5. Final Smoke Test
On the live URL:
- Verify dashboard shows service readiness
- Test a submission from the real domain
- Confirm it arrives in Supabase

---

## 📞 Support

- **Supabase Dashboard:** https://supabase.com/dashboard/project/jqcwwpnlpmwxijahegia
- **Cloudflare Turnstile:** https://dash.cloudflare.com/78e88a54bdc68364995ed20847be3cf2/turnstile
- **GitHub Repository:** aayukc7824-lab/relief-hub
- **Documentation:** See `README.md` and `docs/client-handover.md`

---

## Revision History

| Date | Status | Action |
|------|--------|--------|
| 2026-10-01 | ✅ Deployed | All functions online; secrets configured; frontend disabled |
| 2026-10-02 | ⚠️ Pending test | Verified existing schema and reconciled migration history; Turnstile rejected the local synthetic attempt; no test record stored |
