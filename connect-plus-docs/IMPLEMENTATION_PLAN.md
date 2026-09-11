# Connect Plus — Frontend Implementation Plan
> Derived from `connect_plus_frontend_prd.md` v1.0 · May 2026  
> Status key: ✅ Complete · 🔲 Not started · 🔜 Blocked on backend

---

## Phase 1 — Infrastructure & Design System ✅

| Item | Status | Notes |
|------|--------|-------|
| CP design tokens in `app/globals.css` | ✅ | `--cp-bg`, `--cp-surface`, `--cp-primary`, etc. in `:root` |
| Zustand workspace store (`stores/cp-workspace.store.ts`) | ✅ | `workspaceId`, `role`, `memberId`, `setContext()`, `clear()` |
| Axios instance (`lib/cp-api.ts`) | ✅ | `x-workspace-id` interceptor, 403 error handling |
| Socket.IO singleton (`lib/cp-socket.ts`) | ✅ | `/cp` namespace, lazy connect on Chat mount |
| TypeScript types (`lib/types/cp.ts`) | ✅ | All CP interfaces: `CpInvoice`, `CpClient`, `CpConnectCard`, etc. |
| `useCpRole` hook (`hooks/cp/useCpRole.ts`) | ✅ | `isCreator`, `canManageStaff`, `canManageInvoices`, etc. |
| `useMediaQuery` hook (`hooks/cp/useMediaQuery.ts`) | ✅ | Responsive breakpoint detection |
| `/cp` added to `protectedRoutes` in `routes.ts` | ✅ | |

---

## Phase 2 — Layout Shell ✅

| Item | Status | File |
|------|--------|------|
| `CpShell` — root layout wrapper | ✅ | `components/cp/layout/CpShell.tsx` |
| `CpSidebar` — desktop fixed left nav (240px) | ✅ | `components/cp/layout/CpSidebar.tsx` |
| `CpBottomNav` — mobile 4-tab + More sheet | ✅ | `components/cp/layout/CpBottomNav.tsx` |
| `CpTopbar` — desktop topbar (60px) | ✅ | `components/cp/layout/CpTopbar.tsx` |
| "Back to Connect" escape hatch | ✅ | Pinned in sidebar bottom; in More sheet on mobile |
| `app/(cp)/layout.tsx` — wraps in `<CpShell>` | ✅ | |
| `app/(cp)/[slug]/layout.tsx` — resolves workspace context | ✅ | Calls `setContext()` on Zustand |

---

## Phase 3 — Shared Components ✅ / 🔲

| Item | Status | File |
|------|--------|------|
| `CpStatusBadge` | ✅ | `components/cp/shared/CpStatusBadge.tsx` |
| `CpStatCard` | ✅ | `components/cp/shared/CpStatCard.tsx` — prop: `accentColor` |
| `CpSkeletonCard` + `CpSkeletonRow` | ✅ | `components/cp/shared/CpSkeletonCard.tsx` |
| `CpEmptyState` | ✅ | `components/cp/shared/CpEmptyState.tsx` — `action` is `ReactNode` |
| `CpFAB` | ✅ | `components/cp/shared/CpFAB.tsx` |
| `CpPageHeader` | ✅ | `components/cp/shared/CpPageHeader.tsx` — prop: `rightAction` |
| **`CpDialog`** — adaptive bottom sheet / modal | 🔲 | PRD §13.3 — single component, detects viewport, renders bottom sheet on mobile and centered modal on desktop |
| **`CpContextPanel`** — 360px right slide-in panel | 🔲 | PRD §11 — reusable desktop context panel; currently inline per-page |
| **`CpDataTable`** — reusable data table | 🔲 | PRD §15.1 — currently inline per-page tables |

---

## Phase 4 — Workspace Screens ✅

All screens pass TypeScript build. All include loading skeleton, empty state, error handling.

| Screen | Route | Status |
|--------|-------|--------|
| Dashboard | `/cp/[slug]/dashboard` | ✅ |
| Team list | `/cp/[slug]/team` | ✅ |
| Staff detail | `/cp/[slug]/team/[staffId]` | ✅ |
| Invoice list | `/cp/[slug]/invoices` | ✅ |
| Create invoice | `/cp/[slug]/invoices/create` | ✅ |
| Invoice detail | `/cp/[slug]/invoices/[invoiceId]` | ✅ |
| Appointments calendar | `/cp/[slug]/appointments` | ✅ |
| Appointment detail | `/cp/[slug]/appointments/[appointmentId]` | ✅ |
| Chat list | `/cp/[slug]/chat` | ✅ |
| Chat conversation | `/cp/[slug]/chat/[conversationId]` | ✅ |
| Leads pipeline | `/cp/[slug]/leads` | ✅ |
| Clients list | `/cp/[slug]/clients` | ✅ |
| Attendance | `/cp/[slug]/attendance` | ✅ |
| Connect Cards | `/cp/[slug]/cards` | ✅ |
| Settings | `/cp/[slug]/settings` | ✅ |
| Notifications | `/cp/[slug]/notifications` | ✅ |

---

## Phase 5 — Org & Onboarding Screens ✅

| Screen | Route | Status |
|--------|-------|--------|
| Creator org dashboard | `/cp/org` | ✅ |
| Onboarding wizard | `/cp/onboarding` | ✅ |

---

## Phase 6 — Public / Unauthenticated Screens ✅ / 🔲

| Screen | Route | Status | PRD §|
|--------|-------|--------|-------|
| Business profile (NFC tap + shareable link) | `/cp/public/[slug]` | ✅ | §8.1 |
| Appointment booking wizard | `/cp/public/[slug]/book` | ✅ | §8.2 |
| NFC tap card landing | `/cp/public/cards/[cardCode]` | ✅ | §10.5 |
| **Save Contact Gate** — auth gate for unauthenticated save | `/cp/public/[slug]/save` | 🔲 | §8.3 |

---

## Phase 7 — Invite Flow ✅

| Screen | Route | Status | PRD §|
|--------|-------|--------|-------|
| Invite acceptance (join → password → OTP → profile → done) | `/invite/[token]` | ✅ | §7.4 |

---

## Phase 8 — PWA Configuration 🔲

Per PRD §2.3, `public/manifest.json` needs CP-specific fields for home screen installability:

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

> **Note:** The existing `manifest.json` is for the main Connect product. A separate `/cp/manifest.json` served via `app/(cp)/manifest.json/route.ts` avoids conflict.

---

## Phase 9 — API Proxy Route 🔜 (blocked on backend)

When `connect-nest` CP module is ready, create a single catch-all proxy:

```
app/api/cp/[...path]/route.ts
```

This forwards all `/api/cp/**` requests to `NEXT_PUBLIC_CONNECT_API_URL/api/cp/**`, attaching:
- `Authorization: Bearer <accessToken>` from the httpOnly cookie
- `x-workspace-id` from the request header (already attached by `cpApi`)

All CP pages already call the correct paths — no page changes needed.

---

## Phase 10 — Share Workspace Screens 🔲

PRD §7.8 specifies 3 sharing variants triggered from within workspace settings:

| Variant | Description |
|---------|-------------|
| Staff invite link | Shareable URL for inviting staff via link (rather than email) |
| Client link | Public-facing link for clients to book / connect |
| Private workspace link | Direct deep-link to workspace for known contacts |

Implementation: a `ShareModal` component within the settings page (or accessible from the topbar), rendering 3 tabs with copyable links + QR codes.

---

## Summary — Remaining Work

| Priority | Item | Effort |
|----------|------|--------|
| P1 | `CpDialog` component (§13.3) — adaptive bottom sheet / modal | Small |
| P1 | Save Contact Gate page (§8.3) | Small |
| P1 | PWA manifest route (§2.3) | Trivial |
| P2 | `CpContextPanel` shared component (§11) | Medium — refactor inline panels |
| P2 | Share Workspace screens (§7.8) | Medium |
| P2 | `CpDataTable` shared component (§15.1) | Medium — refactor inline tables |
| P3 | API proxy `app/api/cp/[...path]/route.ts` | Small — **blocked on connect-nest CP module** |
| P3 | Wire real Socket.IO events in chat | Small — **blocked on backend** |

---

## Out of Scope (per PRD §16.4)

- Light / dark mode toggle (dark only)
- PDF generation (frontend calls `/download` endpoint when ready)
- Push notification service worker subscription UI
- Analytics charts / dashboards
- Payment flows / Paystack integration
- RTL language support
- Print stylesheets
