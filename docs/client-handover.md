# BhoteKoshi Relief Hub
## Client Handover and Review Report

| Field | Value |
| --- | --- |
| Submission type | Product review / demonstration |
| Prepared | 2 October 2026 |
| Submitted to | `[Client or company name]` |
| Prepared by | `[Name / team]` |
| Release status | Review-ready prototype; production activation pending |

## Executive summary

BhoteKoshi Relief Hub is an independent, responsive web portal prototype for
community information and relief coordination across Rasuwa, Nuwakot, and
Dhading. It brings public guidance, missing-person reporting, shelter
information, volunteer offers, and a restricted staff console into one
interface.

The current delivery is suitable for stakeholder review and a controlled
demonstration. It is **not ready for live operational use**: the online
submission backend and abuse protection have not been connected and tested.
The portal is not affiliated with government agencies and is not an emergency
dispatch service.

## Scope delivered

| Area | Delivered behavior | Current availability |
| --- | --- | --- |
| Operations overview | Regional service overview, readiness indicators, emergency contacts, service navigation, and a transparent review workflow | Available |
| Missing-person support | Safety guidance, consent-aware report form, and a public-notice area designed for administrator verification | Form disabled pending backend setup |
| Shelter information | Interface for displaying recently verified shelter records and their verification timestamps | Live records unavailable pending backend setup |
| Volunteer and supply offers | Private offer form design with guidance against unverified deployments and payments | Form disabled pending backend setup |
| Staff console | Restricted sign-in and tools for reviewing reports and offers, managing shelter records, and publishing eligible notices | Sign-in unavailable pending backend setup |

The interface does not include payment processing, emergency dispatch, field
team tracking, or an operational case-management service.

The public missing-person registry uses a restricted database view over
administrator-published notices; it does not expose private reports. The
existing `relief_camps` table is reused rather than duplicated. Production
records are intentionally empty until authorized staff enter verified
information; no fabricated person, shelter, occupancy, or availability records
are included.

## Technical delivery

- Front end: React 18, Vite 6, JavaScript, and responsive CSS.
- Data and staff authentication: Supabase project configuration, migrations,
  row-level security, and Edge Functions are prepared in the repository.
- Submission abuse protection: Cloudflare Turnstile integration is prepared.
- Public hosting: GitHub Pages.
- Source repository:
  [aayukc7824-lab/relief-hub](https://github.com/aayukc7824-lab/relief-hub)
- Public site:
  [aayukc7824-lab.github.io/relief-hub](https://aayukc7824-lab.github.io/relief-hub/)

The local production build completed successfully with `npm run build`. The
overview, case-reporting entry point, and unconfigured staff-console state were
checked in a local browser. This verifies the front-end build and navigation;
it does not verify a live database, Edge Functions, authentication, or report
delivery.

The GitHub Pages URL is published, but the current local changes still need to
be released to that site. Do not treat the hosted page as the latest approved
handover build until the updated deployment has been published and checked.

## Privacy, safety, and operational controls

- Personally identifying information is not collected by the current
  unconfigured form.
- Report and offer submissions must remain disabled until the backend, abuse
  protection, access controls, and end-to-end workflow have passed testing.
- Public case notices require separate consent, administrator verification,
  and limited public details; private reporter contact details are not for
  publication.
- Shelter information is intended to appear only after administrator
  verification and must be checked with local authorities before travel.
- Public sign-ups should remain disabled. Staff accounts must be individually
  approved and granted the required role.
- Emergency contacts, local procedures, privacy notices, and data retention
  rules must be reviewed by the client and relevant local authorities before
  operational use.

## Items required before production handover

1. Provision a client-owned Supabase project and Cloudflare Turnstile site.
2. Apply the database migrations in filename order and verify row-level
   security policies, including the public-safe `missing_persons` view.
3. Deploy both submission Edge Functions and configure their server-side
   secrets in Supabase. Never put service-role, Turnstile secret, or
   rate-limit secret values in the browser or repository.
4. Set the frontend environment variables in the deployment workflow. Set
   `VITE_BACKEND_READY=true` only after all integrations and acceptance tests
   pass.
5. Invite named staff accounts, disable public sign-ups, and grant the
   administrator role to authorized users only.
6. Run end-to-end tests for report intake, volunteer offers, administrator
   review, status changes, consent checks, public notice publication, shelter
   verification, and expired/unpublished records.
7. Have the client approve emergency contacts, data ownership, privacy and
   retention wording, incident escalation procedures, and operational
   responsibility.
8. Publish the approved build and complete production smoke tests on the
   client-approved domain.

## Review and acceptance checklist

- [ ] Client/organization name and authorized service owner are confirmed.
- [ ] Content, geography, emergency contacts, and operational language are
      approved by the client.
- [ ] Desktop and mobile layouts and keyboard navigation are reviewed.
- [ ] Backend and abuse protection are configured in client-controlled
      accounts.
- [ ] Private submissions reach only authorized staff; public data is
      consented, minimized, verified, and time-limited.
- [ ] Failure states, rate limits, access revocation, backup, and data
      retention procedures are tested.
- [ ] Production deployment URL and monitoring owner are agreed.
- [ ] Client acceptance and operational go-live approval are recorded.

## Sign-off

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Client reviewer | `[Name]` | `[Pending]` | `[Date]` |
| Technical owner | `[Name]` | `[Pending]` | `[Date]` |
| Operations owner | `[Name]` | `[Pending]` | `[Date]` |

**Current recommendation:** submit this package for review or demonstration
only. Production use requires completion of the pending integration,
acceptance, and release checklist above.
