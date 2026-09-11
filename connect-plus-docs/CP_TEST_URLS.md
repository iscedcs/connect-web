# Connect Plus — Test URLs

**Dev server:** `http://localhost:3154`  
**Replace** `[slug]` with your workspace slug (e.g. `acme-corp`)  
**Replace** bracketed IDs with real values from your dev data

---

## 🔐 Org-Level (Authenticated)

| URL | Screen | Notes |
|-----|--------|-------|
| `http://localhost:3154/cp/onboarding` | Onboarding Wizard | First-time workspace setup — name, type, logo |
| `http://localhost:3154/cp/org` | Workspace Selector | Lists all workspaces the user belongs to |

---

## 🔐 Workspace-Scoped (Authenticated)

Replace `[slug]` with your workspace slug.

| URL | Screen | Notes |
|-----|--------|-------|
| `http://localhost:3154/cp/[slug]/dashboard` | Dashboard | Overview stats, quick actions |
| `http://localhost:3154/cp/[slug]/team` | Team | Staff list with roles and status |
| `http://localhost:3154/cp/[slug]/team/[staffId]` | Staff Profile | Individual staff detail view |
| `http://localhost:3154/cp/[slug]/invoices` | Invoices | Invoice list with status filters |
| `http://localhost:3154/cp/[slug]/invoices/create` | Create Invoice | New invoice form |
| `http://localhost:3154/cp/[slug]/invoices/[invoiceId]` | Invoice Detail | View/manage a specific invoice |
| `http://localhost:3154/cp/[slug]/appointments` | Appointments | Calendar + list of bookings |
| `http://localhost:3154/cp/[slug]/appointments/[appointmentId]` | Appointment Detail | View/manage a specific booking |
| `http://localhost:3154/cp/[slug]/chat` | Chat | Conversation list |
| `http://localhost:3154/cp/[slug]/chat/[conversationId]` | Chat Thread | Individual conversation |
| `http://localhost:3154/cp/[slug]/leads` | Leads | Lead pipeline (NEW → CONTACTED → VALIDATED → REJECTED) |
| `http://localhost:3154/cp/[slug]/clients` | Clients | Client list with appointment/invoice history |
| `http://localhost:3154/cp/[slug]/attendance` | Attendance | Staff clock-in/out records |
| `http://localhost:3154/cp/[slug]/cards` | NFC Cards | Connect card inventory and assignment |
| `http://localhost:3154/cp/[slug]/settings` | Settings | Workspace configuration |
| `http://localhost:3154/cp/[slug]/notifications` | Notifications | In-app notification centre |

---

## 🌐 Public (No Auth Required)

These routes are exempt from authentication and accessible by anyone.

| URL | Screen | Notes |
|-----|--------|-------|
| `http://localhost:3154/cp/public/[slug]` | Business Profile | Public-facing workspace profile page |
| `http://localhost:3154/cp/public/[slug]/book` | Booking Wizard | Public appointment booking flow |
| `http://localhost:3154/cp/public/cards/[cardCode]` | NFC Tap Landing | Page shown when an NFC card is tapped |

---

## 📧 Invite Flow (No Auth Required)

| URL | Screen | Notes |
|-----|--------|-------|
| `http://localhost:3154/invite/[token]` | Staff Invite Acceptance | Join workspace → set password → OTP → profile → done |

---

## Quick Copy — Dev Slugs

Replace this block with your actual test data:

```
Workspace slug:  acme-corp
Staff ID:        staff_abc123
Invoice ID:      inv_xyz789
Appointment ID:  appt_def456
Conversation ID: conv_ghi012
Card code:       CARD-JKL345
Invite token:    tok_mno678
```

### Example URLs (using the above)

```
http://localhost:3154/cp/org
http://localhost:3154/cp/acme-corp/dashboard
http://localhost:3154/cp/acme-corp/team/staff_abc123
http://localhost:3154/cp/acme-corp/invoices/inv_xyz789
http://localhost:3154/cp/acme-corp/appointments/appt_def456
http://localhost:3154/cp/acme-corp/chat/conv_ghi012
http://localhost:3154/cp/public/acme-corp
http://localhost:3154/cp/public/acme-corp/book
http://localhost:3154/cp/public/cards/CARD-JKL345
http://localhost:3154/invite/tok_mno678
```

---

## Auth Notes

- All `/cp/*` routes (except `/cp/public/*`) require a valid `accessToken` cookie
- Unauthenticated requests to protected routes → redirect to `isce-auth-web` login
- Public routes bypass the proxy auth check entirely
- Workspace-scoped routes load workspace context via `GET /api/cp/workspaces/slug/:slug` in `[slug]/layout.tsx`
