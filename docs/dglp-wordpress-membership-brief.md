# DGLP Website — Membership & Content Submission System

**Developer Implementation Brief**

| | |
|---|---|
| Project | DGLP membership-controlled content submission & moderation system |
| Platform | WordPress (self-hosted) — **no headless/decoupled front-end** |
| Status | Draft brief for developer scoping & estimate |
| Target | Core functionality testable mid-June; operational ahead of **1 July** launch |
| Note | This is a **separate project** from the Results You Can Measure (Astro) site. This document lives in that repo only as a working artefact. |

---

## 1. Summary

DGLP needs a WordPress-based system where **verified member organisations** can log in, submit content (news, events, training, funding/grants), and track the status of their submissions through a **branded front-end dashboard**. Submissions are created as drafts, reviewed internally by DGLP admins, and published to the live website on approval.

This is **not a CRM**. It is a membership-controlled submission and moderation workflow integrated into the website.

### Critical non-functional requirement

Members **must never see or use the WordPress admin (`/wp-admin`)**. All member-facing interaction — registration, login, submission forms, submission history — happens through **custom, branded front-end pages/templates** styled to the site. `/wp-admin` is hard-blocked for the member role. Admin reviewers continue to use `/wp-admin` for the moderation step (this is intentional — the native editorial workflow is the moderation engine).

---

## 2. Architecture Decision (fixed — do not re-litigate)

- **Build entirely in WordPress.** WordPress is the single system of record for users, organisations, submissions and content.
- **No headless / Astro / decoupled front-end.** The workload is auth-heavy and back-office-heavy (per-user login, per-org submission history, internal moderation). A static front-end would require hand-building auth, sessions, and a sync pipeline for zero functional gain and significant schedule risk.
- The "slick dashboard" requirement is met with **custom WordPress theme templates**, not a separate stack.
- The moderation loop is implemented using WordPress's **native post-status editorial workflow** (`pending` → `publish`), not a custom-coded approval engine.

---

## 3. Roles & Membership Model

### 3.1 Organisation-based membership

Members register and exist as **organisations**, with **potentially multiple individual users per organisation**.

| Concept | Implementation guidance |
|---|---|
| Organisation | A first-class entity — recommended as a CPT `organisation` (or a dedicated table/term if preferred), holding org profile + verification status. |
| User → Org link | User meta `dglp_org_id` linking each user account to one organisation. |
| Org admin | One user per org flagged as **org admin** (user meta `dglp_org_role = admin\|member`). Can invite/manage colleagues (see open decision 9.2 re: Phase). |
| Verification | Status held at the **organisation** level (`dglp_org_status = pending\|verified\|rejected`). Individual users inherit the ability to submit only if their org is `verified` **and** their own account is active. |

### 3.2 WordPress roles

- New custom role `dglp_member` — capabilities: front-end dashboard + submit only. **No `/wp-admin` access**; admin bar hidden; any request to `/wp-admin` (non-AJAX) redirected to the front-end dashboard.
- Existing `Editor`/`Administrator` roles handle moderation. Optionally a dedicated `dglp_reviewer` role scoped to reviewing/publishing the submission CPTs only.

---

## 4. Content Model

### 4.1 Submission types

Recommended: **one Custom Post Type per submission type** (cleaner admin filtering and cleaner public archives). Alternative acceptable approach: a single `submission` CPT + a `submission_type` taxonomy — developer's call, document whichever is chosen.

| Type | CPT (suggested) | Phase |
|---|---|---|
| News | `dglp_news` | Phase 1 |
| Events | `dglp_event` | Phase 1 |
| Training opportunities | `dglp_training` | Phase 1 |
| Funding / Grants | `dglp_grant` | Phase 1 |
| Jobs / Volunteering | `dglp_job` | **Phase 2 (future)** |

### 4.2 Status model

Use native `post_status` plus one custom status:

| State | post_status | Visible to member as |
|---|---|---|
| Submitted, awaiting review | `pending` | Pending |
| Approved & live | `publish` | Approved / Published |
| Rejected by admin | custom status `dglp_rejected` (registered, excluded from public queries) | Not approved (with optional reason) |

Members **cannot edit a submission once submitted** (confirmed descoped — do not build edit UI). All member-facing views of submissions are read-only.

### 4.3 Fields (starting point — confirm with client during build)

**Common to all types:** title, short summary, full description/body, optional image, optional attachment/link, submitting organisation (auto from user's org), submitting user (auto), date submitted, contact for enquiries.

| Type | Type-specific fields |
|---|---|
| News | Publish/relevant date, category/tag |
| Events | Start date/time, end date/time, venue/location, online link, cost, booking URL |
| Training | Provider, date(s), delivery mode (online/in-person), cost, eligibility, link |
| Funding/Grants | Funder, amount or range, **deadline date**, eligibility, application link |
| Jobs/Volunteering (P2) | Role title, employer, location, salary/expenses, closing date, application link |

Use **ACF Pro** (or equivalent) for type-specific fields and the user↔org relationship.

---

## 5. Functional Requirements (mapped to the user-journey diagram)

### Stage 1 — Join & Verify
- Branded **front-end organisation registration form**: org details + primary contact (the org admin user).
- On submit: create `organisation` (status `pending`) + WP user (role `dglp_member`, linked to org, cannot yet submit).
- Notification to DGLP admins that a registration awaits verification.
- Admin reviews registration in `/wp-admin`, sets org to `verified` (or `rejected`).
- On verification: confirmation email to the org admin; account can now log in and submit.
- Spam protection on the registration form (captcha + Akismet).

### Stage 2 — Submit Content
- Front-end login (branded; **not** `wp-login.php`).
- Authenticated member selects a submission type and completes the relevant branded form.
- Only available to users whose org is `verified`. Unverified/pending users see an appropriate "awaiting verification" state, not the form.
- On submit: post created with status `pending`, author = user, org = user's org.
- Confirmation screen + confirmation email to the submitter.

### Stage 3 — Review & Approval (internal, `/wp-admin`)
- Admins see pending submissions in the native admin list, filterable by type/org/status, with submitter + org context surfaced.
- **Approve** → publish (content goes live on the relevant public section).
- **Reject** → set `dglp_rejected`, with an optional internal reason; optional notification email to the submitter (see open decision 9.5).

### Stage 4 — Publish
- Approved content appears in the correct public-facing area of the live site (news listing, events listing/calendar, training listing, funding listing) with appropriate single + archive templates.
- Page caching must exclude logged-in/dashboard pages so member views stay live.

### Stage 5 — View Submissions (member dashboard)
- Custom branded dashboard listing the **organisation's** submissions (org-level visibility assumed — see open decision 9.3) with clear status badges (Pending / Approved / Not approved).
- Filter by type and status; read-only; sensible empty states; "Submit new" entry point.

---

## 6. Email & Notifications

Two distinct channels — **do not conflate**:

| Channel | Purpose | Implementation |
|---|---|---|
| **Transactional** | Registration received, verification approved/rejected, submission received, submission approved/rejected | Must be reliable. WP Mail SMTP / FluentSMTP wired to a transactional provider (Amazon SES, Postmark, or SendGrid). **Not Mailchimp.** |
| **Marketing** | Newsletter / member mailing list | **Mailchimp.** On org verification (with explicit consent), sync the contact to a designated Mailchimp audience via MC4WP or the Mailchimp API. |

Mailchimp scope is intentionally narrow for Phase 1: consented sync of verified contacts to one audience. Anything beyond (segmentation, automations) is a later phase and a separate client conversation.

---

## 7. Recommended Plugin / Technical Stack

The developer may substitute equivalents, but must document choices and licence costs.

| Need | Recommended | Notes / licence |
|---|---|---|
| Front-end forms → create posts as `pending` | **Gravity Forms + Advanced Post Creation add-on** | Robust, well-supported. Paid licence. Alternatives: Fluent Forms Pro, Formidable Forms Pro. |
| Custom fields & user↔org relationships | **ACF Pro** | Paid licence. |
| Membership / front-end accounts | Lightweight: custom role + custom registration/login templates. Org/multi-user-per-org layer likely needs **custom development** regardless of plugin. | Evaluate Paid Memberships Pro / Ultimate Member only if they reduce custom work for the org/teams model — otherwise avoid plugin bloat. |
| Events (if a real calendar is required) | **The Events Calendar** (free) + **Community Events** add-on for front-end submission | Confirm requirement first (open decision 9.4). Paid add-on if needed. |
| Transactional email | WP Mail SMTP / FluentSMTP + SES/Postmark/SendGrid | Provider account required. |
| Marketing sync | Mailchimp for WordPress (MC4WP) | Free core; Mailchimp account required. |
| Spam | Akismet + captcha (Cloudflare Turnstile / hCaptcha / reCAPTCHA) | On registration & all submission forms. |
| Security | Limit-login, 2FA for admin accounts, security headers | See section 8. |

> The two genuine **cost/effort drivers** are: (1) the branded member dashboard + front-end forms (design + template development), and (2) the organisation / multi-user-per-org layer (data model + invite/role management). The moderation loop itself is effectively free (native WP).

---

## 8. Security & Hardening

- `/wp-admin` blocked + admin bar hidden for `dglp_member`; redirect to dashboard.
- 2FA on all Administrator/reviewer accounts; strong password policy; limit login attempts.
- Captcha + Akismet on all public-facing forms (registration + submissions).
- File-upload restrictions (allowed MIME types, size limits, sanitised filenames) if attachments are enabled.
- Keep core/plugins/themes updated; staging environment for updates.
- Daily automated backups with tested restore.
- Principle of least privilege on the member role (no unfiltered HTML, no file management beyond their own submission uploads).
- All custom code: nonces on every form, capability checks server-side, sanitised input / escaped output, parameterised queries — no trusting client-side gating.

---

## 9. Open Decisions — Client Must Confirm Before Build/Costing

These materially affect data model, scope and price:

1. **Verification granularity** — verified per **organisation** (assumed) or per individual user? Any eligibility evidence required, or admin flag-flip only?
2. **Colleague management & phase** — can the org admin invite/manage additional users, and is that **Phase 1 or Phase 2**? If invited users auto-inherit the org's verified status or need individual approval.
3. **Submission visibility** — does the dashboard show the **whole organisation's** submissions to all its users (assumed), or only the individual's own?
4. **Events depth** — full calendar (dates, venues, recurring, public calendar view → The Events Calendar + Community Events) or simple dated posts?
5. **Rejection notification** — is a rejection email to the submitter required, and should it include a reason?
6. **Mailchimp** — confirm the target audience, the consent wording, and that Phase 1 scope is "sync verified contacts only".
7. **Existing site & hosting** — is DGLP already on WordPress (bolt-on to existing theme) or a new build? Who hosts? Is there a staging environment?
8. **Design assets** — brand guidelines / designs for the member dashboard, forms and login (this is the main visual surface).
9. **Reviewers** — who are the internal admin reviewers, and do they need a restricted reviewer role rather than full Administrator?
10. **Volume** — expected number of member orgs and submissions/month (informs hosting + moderation tooling).

Where a decision is unanswered at build start, the developer should implement the **assumed** option noted above and flag it.

---

## 10. Phasing

**Phase 1 — required for 1 July launch**
- Organisation registration + admin verification
- Member front-end login (branded)
- Custom branded member dashboard with submission history + statuses (read-only)
- Submission forms + CPTs for **News, Events, Training, Funding/Grants**
- Native moderation → publish workflow; rejection handling
- Public display of approved content
- Transactional email; Mailchimp sync on verification (consented)
- Security hardening; `/wp-admin` blocked for members

**Phase 2 — post-launch (sensible to defer)**
- Jobs / Volunteering submission type
- Org-admin self-service colleague invitation & management (if not in P1)
- Richer events calendar / public calendar view
- Admin reporting / CSV export of submissions
- Automated reminders (e.g. funding-deadline nudges), deeper Mailchimp automation

---

## 11. Acceptance Criteria (Definition of Done — Phase 1)

- [ ] An organisation can register via a branded front-end form; admins are notified.
- [ ] An admin can verify/reject an organisation in `/wp-admin`; the org admin is emailed on the outcome.
- [ ] A verified member can log in via a branded page and reach the dashboard without ever seeing `/wp-admin` or the admin bar.
- [ ] An unverified user cannot access submission forms and sees a clear "awaiting verification" state.
- [ ] A verified member can submit News, Event, Training and Funding/Grant items; each is created as `pending` and attributed to the user + org.
- [ ] Submitter receives a confirmation; the item appears in the dashboard as "Pending".
- [ ] An admin can approve (→ live on the correct public section) or reject (→ "Not approved" in dashboard, optional reason/email).
- [ ] The dashboard lists the organisation's submissions with correct, real-time statuses and is read-only (no edit path exists).
- [ ] Verified contacts sync to the designated Mailchimp audience with recorded consent.
- [ ] All forms have working spam protection; security hardening items in section 8 are in place.
- [ ] No member-accessible route exposes WordPress admin UI.

---

## 12. Deliverables & Handover

- Working system on a **staging** environment for mid-June client testing, promoted to **production** ahead of 1 July.
- Plugin/licence inventory with costs.
- Brief admin/reviewer guide for the moderation workflow.
- Documentation of architectural choices made against the open decisions in section 9.
