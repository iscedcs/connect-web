# Connect Plus
Frontend Product Requirements Document
Mobile + Desktop  ·  Grounded in Figma: ISCE (Copy)


Figma Source: https://www.figma.com/design/gpPkBMWVxtmIHIyyPc6N8u/ISCE--Copy-
Backend API:  ISCE Connect (connect-nest)  ·  /api/cp/** namespace
Version:  1.0  ·  May 2026

1. Executive Summary
This document is the complete frontend specification for Connect Plus — the enterprise CRM and workspace operations layer built on top of ISCE Connect. It covers the full product across both mobile and desktop, derived from the Figma design file 'ISCE (Copy)' for mobile screens and designed from first principles for desktop.

The Figma contains three pages: 27 admin/staff frames (Business Dashboard, Employees, Invoices, Appointments, Chat, Shop), 9 public customer-facing frames (Business Profile, Appointment Booking Wizard), and 10 notification and settings frames. All mobile screens follow a dark/light-theme mobile app design with bottom tab navigation.

Desktop screens do not exist in the Figma and are specified here, designed by adapting the mobile patterns: bottom tabs become a fixed left sidebar, mobile card lists become data tables, bottom sheets become centered modals, and detail views open in right context panels rather than full-screen pages.



2. Platform & Technology Stack
## 2.1  Platform Decision
The Figma is designed as a mobile app — all frames are phone-sized (~390×844px). The recommended implementation is a Next.js 14+ PWA (Progressive Web App) rather than a native React Native application. This allows Connect Plus to share the same domain, authentication cookies, and codebase as the existing ISCE Connect web platform, while still being installable on iOS and Android home screens.

Alternative: If a true native app is required in a future phase, the screen specs in this document translate directly to React Native / Expo with NativeWind styling. The design tokens, component descriptions, and screen logic are platform-agnostic.

## 2.2  Tech Stack

## 2.3  PWA Configuration
Add the following to manifest.json to make Connect Plus installable:
{ "name": "ISCE Connect Plus", "short_name": "CP",
"display": "standalone", "orientation": "portrait",
"theme_color": "#0D0D0D", "background_color": "#0D0D0D",
"start_url": "/cp/" }


3. Design System
All design tokens are extracted directly from the Figma file. Every value in this section must be set in tailwind.config.ts under extend.colors.cp — no hardcoded hex values anywhere in component code.

## 3.1  Color Tokens

## 3.2  Typography
Font family: Inter (confirm exact family and weights from Figma inspect panel). Load via next/font/google.

## 3.3  Spacing
The Figma uses an 8pt grid. All spacing is in multiples of 4px.

## 3.4  Border Radius

## 3.5  Core Component Patterns


4. Codebase Architecture
## 4.1  Directory Structure
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
│   │   │   │   └── workspaces/
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
│   │   │       ├── cards/           # Connect Cards
│   │   │       └── settings/        # Workspace settings
│   │   └── public/                  # Unauthenticated CP pages
│   │       ├── [workspaceSlug]/     # Business profile + booking
│   │       └── cards/[cardCode]/    # NFC tap landing
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

RULE: Never import from components/cp/ inside components/connect/ or vice versa. These two product areas share nothing except the auth cookie and design tokens in tailwind.config.ts.

## 4.2  Workspace Zustand Store
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

## 4.3  API Layer — Axios Instance
// src/lib/cp-api.ts
export const cpApi = axios.create({
baseURL: process.env.NEXT_PUBLIC_API_URL,
withCredentials: true,   // sends HttpOnly auth cookie
});

// Attach x-workspace-id on every CP request
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

### 4.4  Socket.IO Client
// src/lib/cp-socket.ts
export function getCpSocket(token: string): Socket {
return io(API_URL + '/cp', {
auth: { token },          // JWT for handleConnection validation
transports: ['websocket'],
autoConnect: false,       // connect explicitly on chat page mount
});
}
The socket connects only when the user opens the Chat screen, not on every page load.


5. Navigation Architecture
## 5.1  Mobile — Bottom Tab Bar
Derived from the Figma Business Dashboard frame. Four primary tabs visible; all other sections are accessed through a fifth 'More' tab.


More overflow bottom sheet contains: Chat, Leads, Clients, Attendance, Connect Cards, Settings, and the escape hatch '← Back to Connect'.


## 5.2  Desktop — Left Sidebar
Replaces the bottom tab bar at viewport width ≥ 1024px. All navigation items are visible without overflow.


Workspace Switcher at top of sidebar (64px): workspace logo (32px) + name + chevron. Dropdown lists all workspaces plus 'Create workspace'.
Bottom of sidebar (always pinned): Settings item, divider, '← Back to Connect' (muted), User avatar + name + role chip.

## 5.3  Desktop Topbar

## 5.4  Escape Hatch — Back to Connect
This is the single most important UX element for navigation clarity. A user who accidentally lands in Connect Plus must always be able to return to Connect in one tap/click. It must be visible on every authenticated screen — in the bottom tab 'More' sheet on mobile, and pinned to the sidebar bottom on desktop.


6. Authentication & Routing
## 6.1  Middleware
Extend the existing Connect middleware (src/middleware.ts). Add Connect Plus rules without removing existing Connect rules.

// For /cp/** routes (excluding /cp/public/**)
if (pathname.startsWith('/cp/') && !pathname.startsWith('/cp/public')) {
const token = request.cookies.get('isce_auth_token');
if (!token) redirect to /login?redirect=:pathname
// Context resolved in [workspaceSlug]/layout.tsx
}

## 6.2  Post-Login Redirect Logic

## 6.3  Workspace Context Resolution
The [workspaceSlug]/layout.tsx is responsible for resolving and storing the workspace context. It runs before any child page renders.
// app/(connect-plus)/cp/[workspaceSlug]/layout.tsx
1. Read workspaceSlug from params
2. Call GET /api/cp/workspaces?slug=:slug to resolve workspaceId
3. Call GET /api/cp/workspaces/:wsId/members/me to get role + memberId
4. Store context in Zustand: setContext({ workspaceId, role, memberId, ... })
5. Render <CpShell>{children}</CpShell>

## 6.4  useCpRole Hook — Frontend RBAC
Used for conditional rendering only. Never use for security — that is the backend's responsibility.
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


7. Mobile Screen Specifications
All screens in this section are grounded in the Figma file 'ISCE (Copy)'. Frame names are referenced in parentheses.
Design fidelity rule: every mobile screen must match the Figma frame exactly for layout, typography, colors, spacing, and icon choices. Every screen must also implement loading (skeleton), empty state, and error state — even if not shown in every Figma frame.

## 7.1  Summary / Business Dashboard
Figma frame: 'Business da...' — The main landing screen after login.
API: GET /api/cp/workspaces/:wsId  |  GET /api/cp/workspaces/:wsId/analytics

## 7.2  Team / Employees
Figma frame: 'Employees' — Staff directory with invite capability.
API: GET /api/cp/workspaces/:wsId/staff  |  POST /api/cp/workspaces/:wsId/staff/invite

## 7.3  Employee Detail
Figma frames: 'Employees' card (Jesse Leos) + 'Employee f...' profile screens.
API: GET /api/cp/workspaces/:wsId/staff/:staffId  |  PATCH .../staff/:staffId/status

## 7.4  Staff Invite Acceptance Flow (4 screens)
Figma frames: 'Employee in...', 'Employee p...', 'OTP', 'Edit profile' — Standalone unauthenticated pages accessible via invite link.

## 7.5  Invoices List
Figma frame: 'Invoices' — Invoice management with summary statistics.
API: GET /api/cp/workspaces/:wsId/invoices?status=&page=&limit=

## 7.6  Create Invoice
Figma frame: 'Create invoi...' — Multi-section invoice creation form.
API: POST /api/cp/workspaces/:wsId/invoices

## 7.7  Invoice Detail
Figma frame: 'Invoice single' — Single invoice view with status-sensitive actions.
API: GET .../invoices/:id  |  POST .../invoices/:id/send  |  POST .../invoices/:id/pay

## 7.8  Share Workspace (3 variants)
Figma frames: 'Receiver inv...', 'Employee f...', 'Private link...' — Invite link sharing screens.

## 7.9  Appointments Calendar
Figma frame: 'Appointmen...' — Calendar view with appointment list.
API: GET /api/cp/workspaces/:wsId/appointments?scheduledAt_gte=&staffId=me

## 7.10  Appointment Detail
Figma frames: 'Offline meet...' and 'Offline setti...' — Onsite appointment with map.
API: GET/PATCH /api/cp/workspaces/:wsId/appointments/:id  |  PATCH .../appointments/:id/status

## 7.11  Chat List
Figma frame: 'Chat' (list view) — Conversation directory.

## 7.12  Chat Conversation
Figma frame: 'Chat' (active conversation with Jese Leos) — Real-time messaging.
Socket events: cp:message, cp:message-received, cp:typing


8. Public Screens — Mobile
Figma page: 'Customer view connect+ pages / Appointment booking UI'. These screens require no authentication.

## 8.1  Business Profile Page
Figma frame: 'Business page' — Public-facing company profile (NFC tap destination and shareable link).
API: GET /api/cp/public/:workspaceSlug

## 8.2  Appointment Booking Wizard
Figma: 7 step frames collapsed into 3 logical steps. Single page with step state. Progress indicator: 'Step X of 3'.
API: POST /api/cp/public/:workspaceSlug/appointments  { name, email, phone, title, scheduledAt, type, locationData }

## 8.3  Save Contact Gate
Figma frame: 'Save contact pro...' — Auth gate when unauthenticated user tries to save contact.
API: POST /api/cp/public/:workspaceSlug/contacts/save


9. Notifications & Settings — Mobile
Figma page: 'Notification and Account settings' — 10 frames across notification management, notification settings, account settings, password change, and account deletion.

## 9.1  Notifications List
Figma frames: 'Notification' (2 variants — default and with swipe-delete action visible).
API: GET .../notifications  |  PATCH .../notifications/:id/read  |  PATCH .../notifications/read-all

## 9.2  Notification Settings
Figma frame: 'Notification settings' — Two sections with toggle rows.

## 9.3  Account Settings — Password Change Flow (3 screens)

## 9.4  Account Settings — Delete Account Flow (2 screens)


10. Missing Screens — Not in Figma
The following screens are required by the Connect Plus backend but have no Figma counterpart. Build them to match the established dark-theme design language — they should be visually indistinguishable in quality from the Figma screens.

## 10.1  Lead Pipeline  /[slug]/leads
API: GET/PATCH /api/cp/workspaces/:wsId/leads

## 10.2  Client List  /[slug]/clients
API: GET /api/cp/workspaces/:wsId/clients  |  GET .../clients/:clientId

## 10.3  Attendance  /[slug]/attendance
API: POST /check-in  |  POST /check-out  |  GET /attendance  |  PATCH /:id/override

## 10.4  Connect Cards  /[slug]/cards
API: GET/PATCH /api/cp/workspaces/:wsId/staff/cards

## 10.5  NFC Tap Landing  /cp/public/cards/[cardCode]
API: POST /api/cp/public/cards/:cardCode/tap

## 10.6  Onboarding Wizard  /cp/onboarding

## 10.7  Creator Org Dashboard  /cp/org
API: GET /api/cp/organizations/me  |  GET /api/cp/organizations/me/workspaces


11. Desktop Screen Specifications
Desktop screens do not exist in the Figma. Every screen in this section is designed by adapting the mobile screens using consistent desktop patterns: data tables replace card lists, context panels replace full-screen detail pages, modals replace bottom sheets, and the full calendar replaces the mini strip.
Layout rule: sidebar is 240px fixed left. Content area = full width minus sidebar. Max content width: 1400px (centered). Horizontal padding: 32px. All context panels are 360px, fixed right, with independent scroll.

## 11.1  Dashboard — Desktop

## 11.2  Team — Desktop
Row click → Right context panel: photo + name + role + stats + today's appointments + assigned clients count + action buttons.

## 11.3  Invoices — Desktop
Create Invoice layout: centered 2-column form (max-width 720px). Left: client search + line items table. Right (280px sticky): Order Summary card + Pay to + action buttons.

## 11.4  Appointments — Desktop (Split View)

## 11.5  Chat — Desktop (Permanent Split)

## 11.6  Leads — Desktop (Kanban + Table Toggle)
Validate → Client modal: max-width 480px. Confirms name, email, assigned staff. Warning text. Confirm green + Cancel.

## 11.7  Clients — Desktop
Context panel: profile + assigned staff (reassign) + appointments section + invoices section + 'Message [name]' button.

## 11.8  Attendance — Desktop
Staff self-view: large clock + check-in/out button + live duration + calendar heatmap + own attendance table.

## 11.9  Connect Cards — Desktop
Context panel: card code + QR code (128px) + action checkboxes + status actions.

## 11.10  Settings — Desktop
2-column layout: left nav (240px) with settings sections listed as text links. Right content (flex-1, max 720px) shows the form for the selected section.


12. Public Screens — Desktop
## 12.1  Business Profile — Desktop
Max-width: 900px, centered. Same dark theme. No sidebar, no topbar — standalone branding.

## 12.2  Booking Wizard — Desktop
Centered card (max-width 640px). Step indicator as a left vertical list rather than a top progress bar.

## 12.3  NFC Tap Landing — Desktop
Keep the tap landing page as a centered mobile-card even on desktop (max-width 420px, vertically centered). The design intentionally preserves the phone-screen feel appropriate to an NFC interaction.


13. Responsive Breakpoints
## 13.1  Three-Tier System

## 13.2  Per-Element Responsive Rules

## 13.3  Dialog Component — Single Implementation
The Dialog component powers both bottom sheets and modals. It detects the viewport and renders accordingly — ensuring a single form is written once and works correctly on both platforms.
function Dialog({ variant = 'auto', title, children }) {
const isDesktop = useMediaQuery('(min-width: 1024px)');
const isModal   = variant === 'modal' || (variant === 'auto' && isDesktop);
return isModal
? <CenteredModal title={title}>{children}</CenteredModal>
: <BottomSheet title={title}>{children}</BottomSheet>;
}


14. Screen-to-API Mapping
Every screen's data requirements and corresponding backend endpoints.



15. Component Library — Build Order
Build shared components before any page-level work. All page components compose from these shared pieces.

## 15.1  Shared CP Components — Build First

## 15.2  Layout Components


16. Done Criteria
## 16.1  Design Fidelity — Mobile (Figma-grounded)

## 16.2  Missing Screens Quality Check

## 16.3  Technical Checklist

## 16.4  Not In Scope
Light mode / dark mode toggle — dark only, matches Figma
PDF generation — backend responsibility, frontend calls /download endpoint
Push notification service worker subscription UI — Phase 5
Analytics charts / dashboards — Phase 4
Payment flows / Paystack integration UI — Phase 5
RTL language support
Print stylesheets

Document Status:  Complete v1.0 — Mobile spec grounded in Figma 'ISCE (Copy)'. Desktop spec derived from mobile design. All Figma screens covered plus 7 missing screens specified.