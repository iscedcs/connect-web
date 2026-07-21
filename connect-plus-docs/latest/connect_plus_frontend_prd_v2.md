# Connect Plus
Frontend Product Requirements Document
Mobile + Desktop · Grounded in Figma: ISCE (Copy) + Ecosystem-Isce (web)

Figma sources:
- Mobile: https://www.figma.com/design/gpPkBMWVxtmIHIyyPc6N8u/ISCE--Copy- (node 681-12680)
- Web/Desktop: https://www.figma.com/design/yQnElDPbA4xGhBWL48Mkop/Ecosystem-Isce (node 2219-7601)

Backend API: ISCE Connect (connect-nest) · `/api/cp/**` namespace, endpoints per `const.ts`
Version: 2.0 · July 2026
Status: Revision of v1.0 — corrected against actual Figma exports and the real endpoint list. See §0 for a summary of what changed and why.

---

## 0. Revision Notes — Why This Version Exists

v1.0 was written against the endpoint names and a general sense of the product, but not against the actual Figma frames or the finalized `const.ts` endpoint list. Reconciling all three surfaced the following, which this version corrects:

1. **Desktop may not need to be invented.** v1.0 claimed "Desktop screens do not exist in the Figma" and specified §11–12 from first principles. The exports shared for this revision contain frames that are visibly wider than the ~390px mobile frames, with sidebar nav, data tables, and right-side context panels — the exact pattern §11 claimed was invented. **This needs a direct confirmation pass in Figma** (select the frame, check width in the Inspect panel) before anyone builds §11 as "designed here." If confirmed, §11 should be rewritten again as Figma-grounded, not adapted-from-mobile. This version flags every desktop section accordingly rather than silently keeping the old framing.
2. **A whole feature — Shop / Inventory / Order Tracking — was named but never specified.** The Executive Summary listed "Shop" as one of the 27 admin/staff frames, and one of the shared exports is explicitly titled "Shop management," but v1.0's section 7 never covered it. It's a full CRUD surface (add/edit product, inventory list, order tracking with delivery timeline) — added as new §7.13–7.16 below.
3. **Every "API:" line in v1.0 used the wrong URL shape.** v1.0 wrote endpoints as `/api/cp/workspaces/:wsId/staff`, `/invoices`, `/leads`, etc. The real `const.ts` list is flat — `/api/cp/staff`, `/api/cp/invoices`, `/api/cp/leads` — with workspace scoping done via the `x-workspace-id` header (which v1.0's own §4.3 correctly described). Every endpoint reference in this version has been corrected to match `const.ts` exactly.
4. **Four backend feature areas have endpoints but no PRD coverage at all**: Jobs/Recruiting, Talent Search, Audit Logs, and Organization Subscriptions/Billing. None of these appeared in any shared export either, so they're treated the same way v1.0 treated Leads/Clients/Attendance — as "build to match the design language" — in the expanded §10.
5. **Two features referenced in v1.0 have no matching endpoint in `const.ts` at all**: Connect Cards (§10.4/§11.9) and NFC Tap Landing (§10.5). Flagged as open questions in §17 rather than silently kept.
6. **Section 3 (Design System), 14 (Screen-to-API Mapping), and several others were empty headers with no content in v1.0.** §14 is filled in properly below. §3 is filled in qualitatively as far as a thumbnail-resolution export allows, with exact tokens flagged as still needing a Figma Inspect-panel pass — screenshots alone aren't reliable enough to hand-code hex values from.

Everything not called out above (staff directory, invoice list/create/detail, share-workspace, appointments, chat, public booking) matched the Figma closely and is carried forward with corrected endpoints only.

---

## 1. Executive Summary

Connect Plus is the business/enterprise layer on top of ISCE Connect (the consumer product at isce.app) — a CRM and workspace operations tool for business owners. It covers staff management, invoicing, appointments, client/lead pipeline, attendance, team chat, and a shop/inventory module, on both mobile and desktop.

The Figma mobile file ("ISCE (Copy)") contains three groups of frames: ~27 admin/staff screens (Business Dashboard, Employees, Invoices, Appointments, Chat, **Shop**), 9 public customer-facing frames (Business Profile, Appointment Booking Wizard), and 10 notification/settings frames. A separate web file ("Ecosystem-Isce") appears to contain the desktop equivalents of at least the dashboard, team, and invoicing screens — **pending confirmation, see §0.1**.

## 2. Platform & Technology Stack

### 2.1 Platform Decision

The mobile frames are phone-sized (~390×844px), dark theme, bottom tab navigation. Recommended implementation remains a Next.js 14+ PWA sharing auth cookies and codebase with the existing Connect web platform, installable on iOS/Android home screens.

**Desktop status — needs verification before build starts:** the shared exports include frames noticeably wider than the mobile frames, with a left sidebar (Overview/Team/Invoices/Appointments), full data tables, and a right context panel on invoice detail — i.e., the desktop pattern this document used to say was invented from scratch. Before anyone starts §11:
- Open the Ecosystem-Isce web file and confirm frame widths via the Inspect panel.
- If real desktop frames exist, re-derive §11 from them directly (spacing, breakpoint, exact component variants) rather than adapting mobile patterns.
- If they turn out to be just wider mobile-style mockups (not a true desktop IA), §11 as currently written (adapted-from-mobile) is a reasonable fallback — but that should be a deliberate decision, not an assumption.

Alternative: a native React Native/Expo app remains a valid future phase; screen specs here are platform-agnostic.

### 2.2 Tech Stack

*Not specified in either the original document or the shared Figma exports — needs input from engineering (state management, data fetching, and component library choices beyond what's implied in §4).*

### 2.3 PWA Configuration

```json
{
  "name": "ISCE Connect Plus",
  "short_name": "CP",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0D0D0D",
  "background_color": "#0D0D0D",
  "start_url": "/cp/"
}
```

## 3. Design System

All values below should be treated as **starting points inferred from compressed thumbnail exports, not final specs.** Screenshots at this resolution are good enough to confirm layout and screen inventory but not to hand-code exact hex/spacing values reliably. Before implementation, someone needs to open each token/swatch in Figma's Inspect panel and record exact values — this section should be the very first thing filled in properly, since every component depends on it.

### 3.1 Color Tokens

Qualitatively observable from the exports: a near-black background (`#0D0D0D`–`#111111` range, matching the PWA manifest values already set in §2.3), white/off-white primary text, a green accent used for primary buttons and "paid/active" status badges, red used for destructive actions and "overdue" status badges, amber/yellow for "unpaid/pending" status. A multi-color swatch picker (red, orange, yellow, green, blue, purple, pink, plus neutrals) appears in at least one invoice/tagging screen — likely a category or label color system worth its own token set. **Exact hex values: TBD via Figma Inspect.**

### 3.2 Typography

Font family: Inter (per v1.0; confirm exact family/weights via Figma Inspect panel). Load via `next/font/google`.

### 3.3 Spacing

Figma uses an 8pt grid; all spacing in multiples of 4px (per v1.0 note — consistent with what's visible in the exports).

### 3.4 Border Radius

Cards, buttons, and inputs in the exports consistently use a soft rounded-rectangle style (visually ~8–12px). **Exact values: TBD via Figma Inspect.**

### 3.5 Core Component Patterns

Observed and reusable across screens: stat cards (large number + label, used on Dashboard and Invoices), status badges (colored pill, used on invoices and audit-adjacent lists), searchable list with "Export CSV" action (Employees, Invoices), sticky order-summary card (Invoice detail/create), map-embed card (Appointment detail, onsite location picker), calendar month grid with colored date dots (Appointments), chat bubble list supporting text/voice-note/image attachments, and a delivery-timeline / order-tracking list (Shop).

## 4. Codebase Architecture

### 4.1 Directory Structure

```
src/
├── app/
│   ├── (auth)/                      # Login, register — minimal shell
│   ├── (connect)/                   # EXISTING Connect product — UNTOUCHED
│   │   └── layout.tsx               # Connect shell (top nav, profile)
│   ├── (connect-plus)/              # NEW — Connect Plus product
│   │   ├── layout.tsx               # CP root layout — WorkspaceProvider
│   │   ├── cp/
│   │   │   ├── layout.tsx           # CP authenticated shell
│   │   │   ├── onboarding/          # First-time org/workspace setup
│   │   │   ├── org/                 # Creator-level pages
│   │   │   │   ├── page.tsx         # Org dashboard (workspace grid)
│   │   │   │   ├── workspaces/
│   │   │   │   ├── subscription/    # NEW — billing/plan upgrade (§10.11)
│   │   │   │   └── audit-logs/      # NEW — org-wide audit trail (§10.10)
│   │   │   └── [workspaceSlug]/     # All workspace-scoped pages
│   │   │       ├── layout.tsx       # Resolves + stores workspace context
│   │   │       ├── dashboard/       # Summary tab
│   │   │       ├── team/            # Team tab + [staffId]
│   │   │       ├── invoices/        # Invoices tab + create + [invoiceId]
│   │   │       ├── appointments/    # Appointments tab + [appointmentId]
│   │   │       ├── chat/            # Chat + [conversationId]
│   │   │       ├── leads/           # Lead pipeline
│   │   │       ├── clients/         # Client list + [clientId]
│   │   │       ├── attendance/      # Attendance tracking
│   │   │       ├── shop/            # NEW — Inventory + orders (§7.13-7.16)
│   │   │       ├── jobs/            # NEW — Job postings + applications (§10.8)
│   │   │       ├── talent/          # NEW — Artisan search/directory (§10.9)
│   │   │       ├── invites/         # NEW — generic invite management (§10.12)
│   │   │       ├── cards/           # Connect Cards — endpoint unconfirmed, see §17
│   │   │       └── settings/        # Workspace settings + company profile edit
│   │   └── public/                  # Unauthenticated CP pages
│   │       ├── [workspaceSlug]/     # Business profile + booking
│   │       └── cards/[cardCode]/    # NFC tap landing — endpoint unconfirmed, see §17
│   ├── layout.tsx                   # Root layout (fonts, providers)
│   └── middleware.ts                # Auth + workspace routing guards
│
├── components/
│   ├── connect/                     # EXISTING Connect components — UNTOUCHED
│   ├── cp/                          # ALL new Connect Plus components
│   │   ├── layout/                  # Shell: CpBottomNav, CpSidebar, CpTopbar
│   │   ├── shared/                  # CpDataTable, CpStatusBadge, CpStatCard
│   │   │                            # CpEmptyState, CpPageHeader, CpSkeleton
│   │   │                            # CpContextPanel, CpFAB, Dialog
│   │   ├── dashboard/ team/ invoices/ appointments/
│   │   ├── chat/ leads/ clients/ attendance/ cards/
│   │   ├── shop/                    # NEW — ProductCard, InventoryTable,
│   │   │                            # OrderTimeline, ProductForm
│   │   └── public/                  # Business profile, booking wizard
│   └── ui/                          # shadcn/ui base components (shared)
│
├── lib/
│   ├── cp-api.ts                    # Axios instance + interceptors
│   ├── cp-socket.ts                 # Socket.IO /cp namespace client
│   └── cp-query-keys.ts             # TanStack Query key factories
│
├── hooks/cp/                        # useWorkspace, useCpRole, per-entity hooks
├── stores/cp-workspace.store.ts     # Zustand: workspace context
└── types/cp/                        # TypeScript types mirroring API responses
```

RULE: Never import from `components/cp/` inside `components/connect/` or vice versa. These two product areas share nothing except the auth cookie and design tokens in `tailwind.config.ts`.

### 4.2 Workspace Zustand Store

```ts
interface CpWorkspaceState {
  workspaceId:    string | null
  workspaceSlug:  string | null
  organizationId: string | null
  role:           CpRole | null     // CREATOR | WORKSPACE_ADMIN | STAFF | CLIENT
  memberId:       string | null     // CpWorkspaceMember.id
  staffProfileId: string | null     // CpStaffProfile.id (STAFF role)
  clientId:       string | null     // CpClient.id (CLIENT role)
  setContext:     (ctx: CpContext) => void
  clear:          () => void
}
```

### 4.3 API Layer — Axios Instance

```ts
// src/lib/cp-api.ts
export const cpApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,   // sends HttpOnly auth cookie
});

// Attach x-workspace-id on every CP request — this is how workspace scoping
// actually works. const.ts endpoints are flat (/api/cp/staff, /api/cp/invoices,
// /api/cp/leads, etc.) — there is NO /workspaces/:wsId/ path segment. Do not
// add one; the backend reads the workspace from this header.
cpApi.interceptors.request.use(config => {
  const wsId = useCpWorkspaceStore.getState().workspaceId;
  if (wsId) config.headers['x-workspace-id'] = wsId;
  return config;
});

// Handle auth errors globally
cpApi.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401)
    window.location.href = '/login?redirect=' + window.location.pathname;
  if (err.response?.status === 403)
    toast.error('You do not have permission to do this');
  return Promise.reject(err);
});
```

### 4.4 Socket.IO Client

```ts
// src/lib/cp-socket.ts
export function getCpSocket(token: string): Socket {
  return io(API_URL + '/cp', {
    auth: { token },          // JWT for handleConnection validation
    transports: ['websocket'],
    autoConnect: false,       // connect explicitly on chat page mount
  });
}
```

The socket connects only when the user opens the Chat screen, not on every page load. The exports show chat messages with text, voice-note (waveform + duration), and image/multi-image attachments — confirm with backend whether `cp:message` carries attachment metadata or whether attachments go through a separate upload endpoint (not present in `const.ts` — likely a gap, see §17).

## 5. Navigation Architecture

### 5.1 Mobile — Bottom Tab Bar

Confirmed from the exports: four primary tabs visible on nearly every authenticated screen — **Overview, Team, Invoices, Appointments** (labeled "Dashboard" on the landing screen). A fifth **More** tab/overflow sheet holds: Chat, Leads, Clients, Attendance, Shop, Connect Cards, Settings, and the escape hatch "← Back to Connect."

### 5.2 Desktop — Left Sidebar

Replaces the bottom tab bar at viewport width ≥1024px. All navigation items visible without overflow (Dashboard, Team, Invoices, Appointments, Chat, Leads, Clients, Attendance, Shop, Cards, Settings).

Workspace Switcher at top of sidebar (64px): workspace logo (32px) + name + chevron. Dropdown lists all workspaces plus "Create workspace." Bottom of sidebar (always pinned): Settings item, divider, "← Back to Connect" (muted), user avatar + name + role chip.

### 5.3 Desktop Topbar

*Not specified in the shared exports — confirm whether a topbar exists separately from the sidebar, or whether page title + actions live inline per page (as seen in the Team and Invoices desktop screens, which show search + action buttons directly under the tab row rather than in a separate topbar).*

### 5.4 Escape Hatch — Back to Connect

The single most important navigation element: a user who accidentally lands in Connect Plus must always be able to return to Connect in one tap/click. Visible on every authenticated screen — in the bottom tab "More" sheet on mobile, pinned to the sidebar bottom on desktop.

## 6. Authentication & Routing

### 6.1 Middleware

Extend the existing Connect middleware (`src/middleware.ts`). Add Connect Plus rules without removing existing Connect rules.

```ts
// For /cp/** routes (excluding /cp/public/**)
if (pathname.startsWith('/cp/') && !pathname.startsWith('/cp/public')) {
  const token = request.cookies.get('isce_auth_token');
  if (!token) redirect to /login?redirect=:pathname
  // Context resolved in [workspaceSlug]/layout.tsx
}
```

### 6.2 Post-Login Redirect Logic

*Not specified — needs a decision: does a user with exactly one workspace skip the org dashboard and land directly in `[workspaceSlug]/dashboard`? Does a CLIENT-role user land somewhere different from staff/admin? Not resolvable from the shared exports; flag for product decision.*

### 6.3 Workspace Context Resolution

The `[workspaceSlug]/layout.tsx` is responsible for resolving and storing the workspace context, before any child page renders.

```
1. Read workspaceSlug from params
2. Call GET /api/cp/my-workspaces (or GET /api/cp/workspaces, filtered client-side by slug —
   const.ts has no slug query param on the list endpoint; confirm with backend whether one
   should be added, or whether the frontend resolves slug → id from the my-workspaces list)
3. Call GET /api/cp/workspaces/{id} to load full workspace details
4. Role + memberId: const.ts has no dedicated "members/me" endpoint. Likely source is the
   staff/client record returned alongside the user's session, or GET /api/cp/staff/{staffId}
   for the logged-in user's own id — confirm with backend (see §17).
5. Store context in Zustand: setContext({ workspaceId, role, memberId, ... })
6. Render <CpShell>{children}</CpShell>
```

### 6.4 useCpRole Hook — Frontend RBAC

Used for conditional rendering only. Never use for security — that is the backend's responsibility.

```ts
export function useCpRole() {
  const role = useCpWorkspaceStore(s => s.role);
  return {
    isCreator:        role === 'CREATOR',
    isWorkspaceAdmin: role === 'WORKSPACE_ADMIN',
    isStaff:          role === 'STAFF',
    isClient:         role === 'CLIENT',
    canManageStaff:   ['CREATOR','WORKSPACE_ADMIN'].includes(role),
    canSeeAllClients: role === 'WORKSPACE_ADMIN',
    canManageInvoices:['WORKSPACE_ADMIN','STAFF'].includes(role),
  };
}
```

## 7. Mobile Screen Specifications

All screens in this section are grounded in the Figma file "ISCE (Copy)." Frame names are referenced where legible in the shared exports. Design fidelity rule: every mobile screen must match the Figma frame exactly for layout, typography, colors, spacing, and icon choices. Every screen must also implement loading (skeleton), empty state, and error state — even where not shown in the Figma frame itself.

### 7.1 Summary / Business Dashboard

Figma frame: "Business da..." — main landing screen after login. Shows business identity (logo, name, registered address, contact info, NAICS classification), four stat cards (Profile views, Taps, Leads captured, Active devices), an About/description block, and an Account Settings list (Edit profile, Account settings, Notification settings, Invite a friend, Contact support, Terms of service, Privacy policy, Sign out).

API: `GET /api/cp/organizations/me` · `GET /api/cp/organizations/me/analytics` (stat cards — "Taps" and "Active devices" suggest this may combine org analytics with device/card data; confirm the exact response shape with backend).

### 7.2 Team / Employees

Figma frame: "Employees" — staff directory with search, "Export CSV," a status filter (All / Active), and an "Add team members" action.

API: `GET /api/cp/staff` · `POST /api/cp/staff/invite`

### 7.3 Employee Detail

Figma frames: Employees list-item tap-through + profile screens. Shows name, role, and a message/chat shortcut icon per row.

API: `GET /api/cp/staff/{staffId}` · `PATCH /api/cp/staff/{staffId}/status` · `PATCH /api/cp/staff/{staffId}/role` (role change — present in `const.ts`, not covered in v1.0)

### 7.4 Staff Invite Acceptance Flow (4 screens)

Figma frames: "AMG invited you to join their workspace" (email entry, step 1 of 3/4) → "Setup your password" (step 2, with live validation: lowercase, uppercase, number, min length) → "Enter OTP code" (step 3, 6-digit code sent to email) → "Edit your profile" (name, role display, profile photo, cover photo). Standalone, unauthenticated, accessed via invite link.

API: underlying accept-invite call not itself listed in `const.ts` under a dedicated name — likely `webhooks.handle_invite_accepted` is backend-to-backend only, and the frontend flow submits through a different, currently-unlisted auth endpoint. Flag for backend confirmation (see §17).

### 7.5 Invoices List

Figma frame: "Invoices" — four stat cards (Paid total, Unpaid, Overdue, Draft — colors green/amber/red/gray matching status), "Create an invoice" button, search, "Export CSV," status filter, and a line-item-style list (product, quantity, status badge, date).

API: `GET /api/cp/invoices` (admin/all) · `GET /api/cp/invoices/assigned` (staff's assigned invoices) · `GET /api/cp/invoices/me` (self-service/client view) · `GET /api/cp/invoices/export`

### 7.6 Create Invoice

Figma frame: "Create invoi..." — recipient email, project/description, issued-on/due-date pickers, bill-from/bill-to, currency + VAT toggle, line items table (description, qty, price, discount, total), Cancel / Save as Draft / Send Invoice actions.

API: `POST /api/cp/invoices`

### 7.7 Invoice Detail

Figma frame: "Invoice single" — status banner ("Invoice paid"), amount, created-by/due-date/pay-by/currency metadata, a timeline (created → sent → paid, each with a timestamp), Pay To / Invoice To blocks, line items, order summary (subtotal/tax/shipping/total), and Edit/Download/Print actions.

API: `GET /api/cp/invoices/{invoiceId}` · `POST /api/cp/invoices/{invoiceId}/send` · `POST /api/cp/invoices/{invoiceId}/mark-paid` **(v1.0 said `/pay` — corrected)** · `POST /api/cp/invoices/{invoiceId}/cancel` · `PATCH /api/cp/invoices/{invoiceId}`

### 7.8 Share Workspace (3 variants)

Figma frames, all titled "Share your workspace": Public link (anyone with the link can join), Private link (invite-only, per-member role dropdown: Owner/Admin/Member), and a pending-invite variant showing "[Name] wishes to join the workspace" with Permit/Deny actions. Each has a copyable link, member search + "Send invite," and a member list with inline role editing.

API: `POST /api/cp/workspaces/{id}/invite-admin` · role changes likely via `PATCH /api/cp/staff/{staffId}/role`

### 7.9 Appointments Calendar

Figma frame: "Appointmen..." — month calendar with colored date-dots (appointment density/status), a "Today's appointments" count, Calendar/List view toggle, and a scrollable list of upcoming appointments per month (e.g., "3 Appointments" in September) each showing type, staff, timestamp, and a location thumbnail.

API: `GET /api/cp/appointments` (admin/all) · `GET /api/cp/appointments/assigned` (staff) · `GET /api/cp/appointments/me` (client self-service)

### 7.10 Appointment Detail

Figma frames: onsite variant with an embedded map, address, "Set time & date" (start/end + timezone), "Invite more attendees" search, attendees list, and locations list; a remote variant swapping the map for "Join with Google Meet" / Zoom connect options. Both have Yes/No "Will you be in attendance?" and a Save action.

API: `GET /api/cp/appointments/{id}` · `PATCH /api/cp/appointments/{id}` · `PATCH /api/cp/appointments/{id}/status` · self-service variants: `POST /api/cp/appointments/me` (create), `PATCH /api/cp/appointments/me/{id}` (reschedule), `DELETE /api/cp/appointments/me/{id}` (cancel)

### 7.11 Chat List

Figma frame: "Chat" (list view) — conversation directory with avatar, last message preview, timestamp, unread badge; a "Create a new group" action at top.

API: `GET /api/cp/conversations` · `POST /api/cp/conversations/direct`

### 7.12 Chat Conversation

Figma frame: "Chat" (active conversation) — supports text messages, voice notes (waveform + play button + duration), single and multi-image attachments (with a "Save all" action on image groups), delivery status ("Delivered"), and a group-admin system message style for group chats.

API: `POST /api/cp/conversations/{convId}/messages` · `GET /api/cp/conversations/{convId}/messages` · `PATCH /api/cp/conversations/{convId}/messages/read`
Socket events: `cp:message`, `cp:message-received`, `cp:typing`. **Attachment upload path is not in `const.ts`** — flag for backend (§17).

### 7.13 Shop — Inventory List *(new — was named in the Executive Summary but unspecified in v1.0)*

Figma frame: "Inventory management" — tabs for Shop / Transaction history / Track orders. Shop tab: expandable product rows (checkbox, thumbnail, name) grouped by category, each expanding to show product detail (spec description, product state, shipping info, seller, price) with Edit/Delete actions, plus "Post an Item."

API: **No endpoint exists in `const.ts` for products/inventory.** This entire screen group has zero backend coverage in the shared endpoint list — treat as a hard blocker until backend adds a `shop`/`products` resource, not just a frontend gap. See §17.

### 7.14 Shop — Add / Edit Product

Figma frames: "Add product" and "Edit product" — product name, category (searchable select), brand, price, weight/dimensions (length/breadth/width), description, nearest-color swatch picker, product state checkboxes, selling-type checkboxes, and multi-image upload (drag-and-drop, per-image upload progress, SVG/PNG/JPG/GIF, max 800×400px) with Add product/Update product + Discard/Delete actions.

API: same gap as §7.13 — none present in `const.ts`.

### 7.15 Shop — Transaction History

Figma frame under "Inventory management" → Transaction history tab: per-customer (e.g., "BONNIE GREEN," "JOHN DOE") collapsible sections listing product line items with price/qty/total.

API: none present in `const.ts` — same gap.

### 7.16 Shop — Track Orders

Figma frame under "Inventory management" → Track orders tab: order header (order number, status), a vertical delivery timeline (Order placed → Payment accepted → Delivered to courier → In courier's warehouse → Being delivered → Estimated/actual delivery, each with timestamp), full line-item breakdown with totals, and a Cancel Order action. A customer-facing variant shows the same timeline plus a live map and courier contact info.

API: none present in `const.ts` — same gap. This is also the one screen that plausibly ties to `webhooks.handle_paystack_payment` (payment-accepted step) — worth checking with backend whether order/shop data rides on a different service entirely.

## 8. Public Screens — Mobile

Figma page: "Customer view Connect+ pages / Appointment booking UI." These screens require no authentication.

### 8.1 Business Profile Page

Figma frame: "Business page" — public-facing company profile (NFC tap destination and shareable link): logo, name, category, location, Send Money / Save Contact actions, Overview/Book-an-appointment tabs, About text, registered address, phone numbers, email, NAICS classification, social icons.

API: `GET /api/cp/public/{workspaceSlug}`

### 8.2 Appointment Booking Wizard

More precise than v1.0's "7 frames collapsed into 3 steps." The actual step sequence observed:
1. **Location** — choose Onsite (pick from the business's listed addresses) or Remote.
2. **Connection method** (remote only) — Connect with Zoom or Connect with Google Meet.
3. **Date & Time** — month calendar + time-slot grid (e.g., 10:00 AM–5:00 PM in hourly increments).
4. **Name your appointment** — free-text field, present on every step as a persistent footer field.
5. **Booking Confirmed** — summary card (title, location, date, time).

Progress indicator: "Step X of 3" (steps 1, 3, 4 above map to the 3 shown; step 2 only appears conditionally for remote).

API: `POST /api/cp/public/{workspaceSlug}/appointments` — body should include name, email, phone, title, scheduledAt, type, locationData (per v1.0; not contradicted by the exports).

### 8.3 Save Contact Gate

Figma frame: "Save contact pro..." per v1.0 — not independently visible in the shared exports; carried forward unverified.

API: `POST /api/cp/public/{workspaceSlug}/contacts/save`

## 9. Notifications & Settings — Mobile

Figma page: "Notification and Account settings" — per v1.0, 10 frames across notification management, notification settings, account settings, password change, and account deletion. Only notifications and account-settings-adjacent screens (edit profile, leave workspace) were visible in the shared exports; password-change and delete-account flows are carried forward from v1.0 unverified.

### 9.1 Notifications List

API: `GET /api/cp/notifications` · `PATCH /api/cp/notifications/{id}/read` · `PATCH /api/cp/notifications/read-all`

### 9.2 Notification Settings

Figma frame: "Notification settings" — two sections with toggle rows (per v1.0; not independently visible in shared exports).

### 9.3 Account Settings — Password Change Flow (3 screens)

*Not visible in shared exports — carried forward from v1.0 as unverified. Confirm these frames exist and get exports before building.*

### 9.4 Account Settings — Delete Account Flow (2 screens)

*Same as above — unverified, needs its own export before building.*

### 9.5 Edit Profile / Leave Workspace *(confirmed present, was missing from v1.0)*

Name, role (read-only display), profile photo, cover photo upload — same component as the invite-acceptance flow (§7.4) — plus, on a second variant reached from within an active workspace, a destructive "Leave workspace" action.

API: profile update endpoint not listed under a dedicated name in `const.ts`'s business section — likely shares the general `profile.update` endpoint from the personal-Connect namespace, or needs a new `staff` self-update endpoint. Confirm with backend.

## 10. Screens & Features With No Figma Counterpart

The following are required by the backend endpoint list but have no matching Figma frame in anything shared for this review. Build them to match the established dark-theme design language — visually indistinguishable in quality from the Figma screens. Items 10.1–10.7 were already flagged this way in v1.0 and remain confirmed absent from the new exports too. Items 10.8–10.12 are new: they surfaced from cross-referencing `const.ts` against the PRD and were never mentioned in v1.0 at all.

### 10.1 Lead Pipeline `/[slug]/leads`
API: `GET /api/cp/leads` · `PATCH /api/cp/leads/{leadId}` · `POST /api/cp/leads/{leadId}/assign` · `POST /api/cp/leads/{leadId}/validate` · `POST /api/cp/leads/{leadId}/reject` **(reject was missing from v1.0's coverage)** · `DELETE /api/cp/leads/{leadId}`

### 10.2 Client List `/[slug]/clients`
API: `GET /api/cp/clients` · `GET /api/cp/clients/{clientId}` · `GET /api/cp/clients/assigned` · `POST /api/cp/clients/{clientId}/assign` (reassign) · `POST /api/cp/clients/{clientId}/invite` **(inviting a client to create an account — missing from v1.0)**

### 10.3 Attendance `/[slug]/attendance`
API: `POST /api/cp/attendance/check-in` · `POST /api/cp/attendance/check-out` · `GET /api/cp/attendance/me` · `GET /api/cp/attendance` · `GET /api/cp/attendance/{staffId}` · `PATCH /api/cp/attendance/{recordId}/override`

### 10.4 Connect Cards `/[slug]/cards`
API referenced in v1.0 (`GET/PATCH /api/cp/workspaces/:wsId/staff/cards`) **does not exist in `const.ts` under any name.** Do not build against that path. See §17.

### 10.5 NFC Tap Landing `/cp/public/cards/[cardCode]`
Same issue — `POST /api/cp/public/cards/:cardCode/tap` is not in `const.ts`. See §17.

### 10.6 Onboarding Wizard `/cp/onboarding`
No dedicated API section in v1.0 or `const.ts`; likely composed from `POST /api/cp/organizations` (create org) + `POST /api/cp/workspaces` (create first workspace).

### 10.7 Creator Org Dashboard `/cp/org`
API: `GET /api/cp/organizations/me` · workspace list via `GET /api/cp/my-workspaces` **(v1.0 guessed `/organizations/me/workspaces`, which doesn't exist — corrected)**

### 10.8 Jobs / Recruiting `/[slug]/jobs` *(new)*
Full job-posting and applications feature with no PRD coverage in v1.0 at all.
API: `POST /api/cp/jobs` · `GET /api/cp/jobs` · `GET /api/cp/jobs/{id}` · `GET /api/cp/jobs/{jobId}/applications` · `POST /api/cp/jobs/{id}/apply`

### 10.9 Talent Search `/[slug]/talent` *(new)*
An artisan/freelancer directory businesses can search and invite to jobs or save for later — no PRD coverage in v1.0.
API: `GET /api/cp/talent/search` · `POST /api/cp/talent/{artisanId}/invite/{jobId}` · `GET /api/cp/talent/saved` · `POST /api/cp/talent/saved/{artisanId}` · `DELETE /api/cp/talent/saved/{artisanId}`

### 10.10 Audit Logs `/cp/org/audit-logs` *(new)*
API: `GET /api/cp/audit-logs` · `GET /api/cp/audit-logs/me` · `GET /api/cp/audit-logs/org` · `GET /api/cp/audit-logs/export` · `GET /api/cp/audit-logs/verify`

### 10.11 Organization Subscription / Billing `/cp/org/subscription` *(new)*
This is the org's own SaaS plan, distinct from the "Payment flows / Paystack" item v1.0 excluded in §16.4 (which is about customers paying invoices, not the business paying Connect Plus).
API: `GET /api/cp/organizations/me/subscription` · `POST /api/cp/organizations/me/subscription/upgrade`

### 10.12 Invite Management `/[slug]/invites` *(new)*
A generic invites resource, distinct from `staffs.invite` (§7.2) — appears to be a management view over all pending invites (view/revoke/resend), not just the send action.
API: `POST /api/cp/invites` · `GET /api/cp/invites` · `GET /api/cp/invites/{inviteId}` · `DELETE /api/cp/invites/{inviteId}` (revoke) · `POST /api/cp/invites/{inviteId}/resend`

### 10.13 Authenticated Company Profile Edit `/[slug]/settings/company` *(new)*
§8.1 only specs the **public, read-only** profile page. There's a separate authenticated edit surface implied by `company_profile.update` that isn't the same as `organization.update` (workspace settings) — needs its own screen, likely part of Settings (§11.10).
API: `GET /api/cp/company-profile` · `PATCH /api/cp/company-profile`

## 11. Desktop Screen Specifications

**Read §2.1 first.** This entire section was written in v1.0 as "designed here, desktop doesn't exist in Figma." The shared exports contain frames that look like real desktop screens (sidebar + tabs + data table + right context panel), so before building any of the below, confirm in Figma whether these are real desktop frames. If confirmed, re-derive this section from them directly — what follows is the v1.0 adapted-from-mobile spec, corrected only where the exports gave enough detail to fix specific claims, kept as a fallback.

Layout rule (v1.0, unconfirmed): sidebar 240px fixed left. Content area = full width minus sidebar. Max content width: 1400px (centered). Horizontal padding: 32px. Context panels: 360px, fixed right, independent scroll.

### 11.1 Dashboard — Desktop
*Not detailed in v1.0. From the exports: stat cards (Profile views, Taps, Leads captured, Active devices) sit alongside an About block and a Recent Activity feed (invoice paid, team member added, product updated, appointment scheduled, invoice sent — each with a relative timestamp) in a two-column layout.*

### 11.2 Team — Desktop
Row click → right context panel: photo + name + role + stats + today's appointments + assigned clients count + action buttons. List view confirmed in exports: search bar, "Export CSV," status filter (All/Active/Inactive), and a table with inline role dropdowns (Owner/Admin/Member) and a message-shortcut icon per row.

### 11.3 Invoices — Desktop
Confirmed in exports: four stat cards at top (Paid/Unpaid/Overdue/Draft totals with counts), "Create an invoice," search, "Export CSV," status filter, and a full-width table (invoice #, product, qty, price, status badge, date). Create Invoice layout: centered 2-column form (max-width 720px). Left: client search + line items table. Right (280px sticky): Order Summary card + Pay To + action buttons — this matches the modal/panel seen in the exports closely.

### 11.4 Appointments — Desktop (Split View)
*Not independently confirmed in exports beyond what's inferable from the mobile calendar screen (§7.9). Recommend confirming a true desktop split-view frame exists before building; if not, adapt §7.9/§7.10 per the layout rule above.*

### 11.5 Chat — Desktop (Permanent Split)
*Not independently confirmed in exports. A desktop chat frame (conversation list + active thread) does appear to exist per the exports, sized similarly to the Team/Invoices desktop frames — supports the "permanent split, no navigation-away" pattern v1.0 assumed. Exact column widths TBD.*

### 11.6 Leads — Desktop (Kanban + Table Toggle)
Validate → Client modal: max-width 480px. Confirms name, email, assigned staff. Warning text. Confirm (green) + Cancel. **Add a parallel Reject action/modal** — `leads.reject` exists in `const.ts` and wasn't covered in v1.0's kanban spec.

### 11.7 Clients — Desktop
Context panel: profile + assigned staff (reassign) + appointments section + invoices section + "Message [name]" button.

### 11.8 Attendance — Desktop
Staff self-view: large clock + check-in/out button + live duration + calendar heatmap + own attendance table.

### 11.9 Connect Cards — Desktop
Context panel: card code + QR code (128px) + action checkboxes + status actions. **Endpoint unconfirmed — see §17 before building.**

### 11.10 Settings — Desktop
2-column layout: left nav (240px) with settings sections listed as text links. Right content (flex-1, max 720px) shows the form for the selected section. **Add a "Company Profile" section here** wired to `GET/PATCH /api/cp/company-profile` (§10.13).

### 11.11 Shop — Desktop *(new)*
Not independently confirmed as a desktop frame in the exports; the mobile Shop screens (§7.13–§7.16) should adapt to the same data-table + context-panel pattern as Team/Invoices once the backend gap in §7.13 is resolved.

## 12. Public Screens — Desktop

### 12.1 Business Profile — Desktop
Max-width: 900px, centered. Same dark theme. No sidebar, no topbar — standalone branding.

### 12.2 Booking Wizard — Desktop
Centered card (max-width 640px). Step indicator as a left vertical list rather than a top progress bar.

### 12.3 NFC Tap Landing — Desktop
Keep the tap landing page as a centered mobile-card even on desktop (max-width 420px, vertically centered) — preserves the phone-screen feel appropriate to an NFC interaction. **Endpoint unconfirmed — see §17.**

## 13. Responsive Breakpoints

### 13.1 Three-Tier System
*Not specified in v1.0 or resolvable from the shared exports — needs a decision (likely mobile <768px / tablet 768–1023px / desktop ≥1024px, matching the ≥1024px sidebar breakpoint already stated in §5.2, but tablet behavior is undefined).*

### 13.2 Per-Element Responsive Rules
*Not specified — needs to be filled in per-component once §3 tokens are finalized.*

### 13.3 Dialog Component — Single Implementation

The Dialog component powers both bottom sheets and modals. It detects the viewport and renders accordingly — ensuring a single form is written once and works correctly on both platforms.

```tsx
function Dialog({ variant = 'auto', title, children }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isModal   = variant === 'modal' || (variant === 'auto' && isDesktop);
  return isModal
    ? <CenteredModal title={title}>{children}</CenteredModal>
    : <BottomSheet title={title}>{children}</BottomSheet>;
}
```

## 14. Screen-to-API Mapping

Empty in v1.0. Filled in below from the confirmed screens in §7–§12 and the real `const.ts` paths.

| Screen | Primary Endpoint(s) |
|---|---|
| Dashboard (7.1) | `GET /organizations/me`, `GET /organizations/me/analytics` |
| Team list (7.2) | `GET /staff`, `POST /staff/invite` |
| Employee detail (7.3) | `GET /staff/{id}`, `PATCH /staff/{id}/status`, `PATCH /staff/{id}/role` |
| Invite acceptance (7.4) | unconfirmed — see §17 |
| Invoices list (7.5) | `GET /invoices`, `GET /invoices/assigned`, `GET /invoices/me` |
| Create invoice (7.6) | `POST /invoices` |
| Invoice detail (7.7) | `GET /invoices/{id}`, `POST /invoices/{id}/send`, `POST /invoices/{id}/mark-paid`, `POST /invoices/{id}/cancel`, `PATCH /invoices/{id}` |
| Share workspace (7.8) | `POST /workspaces/{id}/invite-admin`, `PATCH /staff/{id}/role` |
| Appointments calendar (7.9) | `GET /appointments`, `GET /appointments/assigned`, `GET /appointments/me` |
| Appointment detail (7.10) | `GET/PATCH /appointments/{id}`, `PATCH /appointments/{id}/status`, `POST/PATCH/DELETE /appointments/me[/{id}]` |
| Chat list (7.11) | `GET /conversations`, `POST /conversations/direct` |
| Chat conversation (7.12) | `POST/GET /conversations/{id}/messages`, `PATCH /conversations/{id}/messages/read` |
| Shop — inventory/add/edit/orders (7.13–7.16) | **none — backend gap, see §17** |
| Public business profile (8.1) | `GET /public/{slug}` |
| Booking wizard (8.2) | `POST /public/{slug}/appointments` |
| Save contact (8.3) | `POST /public/{slug}/contacts/save` |
| Notifications (9.1) | `GET /notifications`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all` |
| Company profile edit (10.13) | `GET/PATCH /company-profile` |
| Leads (10.1) | `GET/PATCH /leads`, `POST /leads/{id}/assign`, `/validate`, `/reject`, `DELETE /leads/{id}` |
| Clients (10.2) | `GET /clients`, `GET /clients/{id}`, `GET /clients/assigned`, `POST /clients/{id}/assign`, `/invite` |
| Attendance (10.3) | `POST /attendance/check-in`, `/check-out`, `GET /attendance/me`, `GET /attendance`, `GET /attendance/{staffId}`, `PATCH /attendance/{id}/override` |
| Connect Cards (10.4, 11.9) | **unconfirmed — see §17** |
| NFC Tap Landing (10.5) | **unconfirmed — see §17** |
| Onboarding (10.6) | `POST /organizations`, `POST /workspaces` |
| Org dashboard (10.7) | `GET /organizations/me`, `GET /my-workspaces` |
| Jobs (10.8) | `POST/GET /jobs`, `GET /jobs/{id}`, `GET /jobs/{id}/applications`, `POST /jobs/{id}/apply` |
| Talent search (10.9) | `GET /talent/search`, `POST /talent/{id}/invite/{jobId}`, `GET /talent/saved`, `POST/DELETE /talent/saved/{id}` |
| Audit logs (10.10) | `GET /audit-logs`, `/me`, `/org`, `/export`, `/verify` |
| Subscription (10.11) | `GET /organizations/me/subscription`, `POST .../upgrade` |
| Invite management (10.12) | `POST/GET /invites`, `GET/DELETE /invites/{id}`, `POST /invites/{id}/resend` |

*All paths above are relative to `/api/cp` and assume the `x-workspace-id` header per §4.3 — no path segment carries the workspace id.*

## 15. Component Library — Build Order

Build shared components before any page-level work. All page components compose from these shared pieces.

### 15.1 Shared CP Components — Build First

Based on patterns repeated across the confirmed screens: `CpStatCard` (Dashboard, Invoices), `CpStatusBadge` (Invoices, Leads), `CpDataTable` with search + export + filter row (Team, Invoices), `CpContextPanel` (right-side detail, desktop), `CpEmptyState`, `CpPageHeader`, `CpSkeleton`, `CpFAB`, `Dialog` (§13.3), `CpMapEmbed` (Appointment detail, Onsite location), `CpCalendarGrid` (Appointments), `CpChatBubble` (text/voice-note/image variants), `CpColorSwatchPicker` (seen in invoice/product screens), `CpDeliveryTimeline` (Shop order tracking).

### 15.2 Layout Components

`CpBottomNav` (mobile), `CpSidebar` (desktop, §5.2), `CpTopbar` (desktop — pending §5.3 confirmation), `CpShell` (wraps both per breakpoint).

## 16. Done Criteria

### 16.1 Design Fidelity — Mobile (Figma-grounded)
Every screen listed in §7–§9 as "confirmed" must pixel-match its Figma frame for layout, type, color, spacing, and iconography, per the fidelity rule in §7's intro.

### 16.2 Missing Screens Quality Check
Every screen in §10 must be visually indistinguishable in component quality from the Figma-grounded screens — same design tokens, same component library, no ad-hoc styling.

### 16.3 Technical Checklist
- All API calls corrected to the flat `const.ts` paths (§4.3) — no invented `/workspaces/:wsId/...` segments anywhere in the codebase.
- Every open item in §17 resolved with backend before its dependent screen ships.
- §3 design tokens finalized via Figma Inspect before any component is built against guessed values.

### 16.4 Not In Scope
- Light mode / dark mode toggle — dark only, matches Figma.
- PDF generation — backend responsibility, frontend calls `/download` endpoint.
- Push notification service worker subscription UI — Phase 5.
- Analytics charts / dashboards — Phase 4.
- Payment flows / Paystack integration UI (customer-paying-invoice flows) — Phase 5.
- RTL language support.
- Print stylesheets.

## 17. Open Questions — Needs Backend/Design Confirmation Before Build

1. **Desktop frames**: do real desktop frames exist in the Ecosystem-Isce web file, or are the wider frames seen in the export something else? Resolves the framing of the entire §11.
2. **Shop/Inventory/Orders**: `const.ts` has no product, inventory, or order endpoints at all, despite a fully designed CRUD flow (§7.13–§7.16). Needs a backend resource before frontend work starts.
3. **Connect Cards & NFC Tap Landing**: v1.0 cited `GET/PATCH /api/cp/workspaces/:wsId/staff/cards` and `POST /api/cp/public/cards/:cardCode/tap` — neither exists in `const.ts`. Confirm whether these routes exist under different names, or haven't been built yet.
4. **Workspace context resolution** (§6.3): no slug-filtered workspace lookup or "members/me" endpoint exists in `const.ts`. Confirm how the frontend is meant to resolve `slug → workspaceId → role/memberId`.
5. **Staff invite acceptance submit endpoint** (§7.4): the 4-screen flow's final submission (email → password → OTP → profile) doesn't correspond to a clearly-named endpoint in the business section of `const.ts`. Confirm which endpoint(s) back it.
6. **Chat attachment uploads** (§7.12): voice notes and images are clearly supported in the design; no upload endpoint is listed alongside `chat.send_message`. Confirm the upload path.
7. **Company/organization edit surfaces**: `organization.update`/`archive` and `company_profile.update` are two different resources with no corresponding screens found anywhere in the exports beyond the read-only public profile (§8.1) — confirm both need dedicated settings screens (§10.13 covers one).
8. **`const.ts` typos worth fixing at the source**: `company.public` has a stray trailing `}` in the path string (`.../appointments}`); the `appoinments` key is missing a "t". Neither breaks anything functionally but both are worth a quick cleanup pass so nobody copy-pastes the typo into new code.

---

**Document Status:** v2.0 — Mobile spec re-grounded in actual shared Figma exports; desktop spec flagged for re-verification rather than assumed invented; all endpoint references corrected against `const.ts`; four previously-undocumented feature areas (Shop, Jobs, Talent, Audit Logs, Subscriptions) added; open questions consolidated in §17 for a single backend/design confirmation pass before the next build cycle starts.
