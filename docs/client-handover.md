# BhoteKoshi Relief Hub
## Client Handover and Review Report

| Field | Value |
| --- | --- |
| Submission type | Product review / demonstration |
| Prepared | 2 October 2026 |
| Submitted to | `[Client or company name]` |
| Prepared by | `[Name / team]` |
| Release status | Updated review build published; online intake disabled |

## Executive summary

BhoteKoshi Relief Hub is an independent, responsive web portal prototype for
community information and relief coordination across Rasuwa, Nuwakot, and
Dhading. It brings public guidance, missing-person reporting, shelter
information, volunteer offers, and a restricted staff console into one
interface.

The current delivery is suitable for stakeholder review and a controlled
demonstration. Supabase schema and submission functions are configured, but the
end-to-end Turnstile submission test has not passed and no Relief Hub admin
account has been authorized. Online report and volunteer intake therefore
remain **disabled**. The portal is not affiliated with government agencies and
is not an emergency dispatch service.

## Scope delivered

| Area | Delivered behavior | Current availability |
| --- | --- | --- |
| Operations overview | Regional service overview, readiness indicators, emergency contacts, service navigation, and a transparent review workflow | Available |
| Missing-person support | Safety guidance, consent-aware report form, and a public-notice area designed for administrator verification | Form disabled pending successful acceptance testing and staff authorization |
| Shelter information | Interface for displaying recently verified shelter records and their verification timestamps | No public records currently available |
| Volunteer and supply offers | Private offer form with guidance against unverified deployments and payments | Form disabled pending successful acceptance testing and staff authorization |
| Staff console | Restricted sign-in and tools for reviewing reports and offers, managing shelter records, and publishing eligible notices | No Relief Hub admin account authorized |

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
- Data and staff authentication: Supabase schema, migrations, row-level
  security, and Edge Functions are configured for the current project.
- Submission abuse protection: Cloudflare Turnstile is integrated, but its
  end-to-end verification has not yet passed.
- Public hosting: GitHub Pages.
- Source repository:
  [aayukc7824-lab/relief-hub](https://github.com/aayukc7824-lab/relief-hub)
- Public site:
  [aayukc7824-lab.github.io/relief-hub](https://aayukc7824-lab.github.io/relief-hub/)

The production build completed successfully with `npm run build`, and the
updated site is published through GitHub Actions. The live overview, case
reporting entry point, and disabled-intake state were checked in a browser.
This verifies the front-end build and deployment; it does not verify successful
Turnstile verification, authenticated staff access, or report delivery.

The live page currently shows **Setup required** and **Live updates are not
connected**. This is an intentional safe state while intake is disabled and
public database reads have not been enabled in the site build.

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

1. Decide whether to transfer the current configuration or provision a
   client-owned Supabase project and Cloudflare Turnstile site.
2. For a new project, apply the database migrations in filename order and
   verify row-level security policies, including the public-safe
   `missing_persons` view.
3. For a new project, deploy both submission Edge Functions and configure
   their server-side secrets in Supabase. Never put service-role, Turnstile
   secret, or rate-limit secret values in the browser or repository.
4. Complete successful missing-report and volunteer-offer tests, including
   Turnstile verification, database delivery, rate limiting, and staff review.
5. Invite named staff accounts, disable public sign-ups, and grant the
   administrator role to authorized users only.
6. Run acceptance tests for status changes, consent checks, public notice
   publication, shelter verification, and expired/unpublished records.
7. Have the client approve emergency contacts, data ownership, privacy and
   retention wording, incident escalation procedures, and operational
   responsibility.
8. Only after written approval, update the GitHub Pages workflow release gate
   and complete production smoke tests on the client-approved domain.

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
