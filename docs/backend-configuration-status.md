# BhoteKoshi Relief Hub — Backend Configuration Status

**Last Updated:** 2026-10-01 22:54 UTC+5:45  
**Status:** ✅ Secure setup complete; **submissions remain disabled pending authorization**

---

## ✅ Configured Components

### Supabase Project
- **Project:** BhoteKoshi Relief Hub  
- **Reference:** `jqcwwpnlpmwxijahegia`  
- **Region:** ap-northeast-1 (Tokyo)  
- **Database:** PostgreSQL 17.11.0.002  
- **Status:** Active and healthy

### Authentication (Auth)
- **Public user sign-ups:** ❌ **Disabled**  
- **Staff authorization:** Ready (add trusted accounts to `public.admin_users` table)
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

**Note:** Turnstile secret was rotated and replaced after an initial rotation exposure; old secret valid for 2 hours during transition. Ensure new secret in Cloudflare matches the one configured here.

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
- **Local dev server:** Running and responsive
- **Production build:** ✅ Passed (dist/ ready for GitHub Pages)

---

## ⚠️ Disabled Until Authorized

### Online Submission Forms
✅ **Functions deployed** | ❌ **Forms disabled for end-users**

The web forms explicitly show:  
> "Online reports and volunteer offers are disabled until secure setup and testing are complete."

**Why:** To prevent accidental live intake before staff review processes are in place.

**To enable:** Set `VITE_BACKEND_READY=true` in the frontend after:
1. ✅ Staff authorization table is populated
2. ✅ Private staff review workflows are tested
3. ✅ Public notice publication policy is approved

---

## 📋 Pre-Launch Checklist

- [x] Supabase project created and linked
- [x] Database schema migrations prepared
- [x] Public sign-ups disabled
- [x] Both Edge Functions deployed and active
- [x] CORS correctly configured and tested
- [x] Turnstile widget created with site and secret keys
- [x] Server secrets configured in Supabase
- [x] Rate limiting function deployed
- [x] Frontend production build passes
- [x] Local `.env` configured with public keys only
- [ ] **Run end-to-end submission test** (synthetic submission with real Turnstile token)
- [ ] **Authorize staff in `admin_users` table** (at least one trusted account)
- [ ] **Set `VITE_BACKEND_READY=true`** in frontend config
- [ ] **Configure GitHub Actions deployment variables** (4 vars: URL, key, site key, flag)
- [ ] **Deploy to GitHub Pages** and smoke-test on live URL
- [ ] **Document staff procedures** for review and publication workflows

---

## 🔒 Security Notes

1. **Secrets are never in the repository.** Server-side secrets live only in Supabase; frontend receives no service-role keys.
2. **Public sign-ups are blocked.** Only explicitly authorized staff can use the review console.
3. **Submissions are rate-limited** by IP address using HMAC-SHA256 hashing (not stored).
4. **Turnstile verification is required** for every submission; failed verification returns 403.
5. **CORS is strict** and allows only configured origins.
6. **Production data is empty** until staff intentionally publish verified notices.

---

## 🚀 Next Steps

### 1. End-to-End Test (Local)
Run a synthetic missing-person report submission from `http://localhost:5173`:
- Fill the Missing Persons form with valid test data
- Turnstile challenge should appear and complete
- Submission should succeed (201) with private confirmation
- Check Supabase table `missing_reports` for the test entry

### 2. Populate Staff Authorization
In Supabase SQL Editor:
```sql
INSERT INTO public.admin_users (email, created_at)
VALUES ('your-trusted-email@example.com', now());
```
Commit this after verifying the user account exists in Supabase Auth.

### 3. Enable Frontend Submissions
Set `VITE_BACKEND_READY=true` in your local `.env` and in GitHub Actions variables.

### 4. Deploy to GitHub Pages
Push code and GitHub Actions will build and deploy to `https://aayukc7824-lab.github.io/relief-hub/`.

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

