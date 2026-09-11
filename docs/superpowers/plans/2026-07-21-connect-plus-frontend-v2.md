# Connect Plus Frontend v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete frontend surface for Connect Plus v2 from scratch inside the new `app/(connect-plus)` route group based on the updated PRD v2.0 (`connect_plus_frontend_prd_v2.md`). Ensure full flat API path alignment (`/api/cp/*` endpoints with `x-workspace-id` header), complete all workspace and org features (Jobs, Talent, Audit Logs, Subscriptions, Invites, Company Profile, Staff Acceptance Flow, Shop UI shell), and align responsive desktop/mobile shells.

**Architecture:** Next.js PWA within the existing Connect ecosystem (`connect-web`). Clean separation in `app/(connect-plus)` with `(connect-plus)/cp` for authenticated routes and `(connect-plus)/public` for unauthenticated routes. Workspace context stored in Zustand (`useCpWorkspaceStore`), API calls routed through Axios (`cpApi` with `x-workspace-id` header injection), and responsive UI using `CpSidebar` / `CpBottomNav` / `Dialog`.

**Tech Stack:** Next.js 14+ (App Router), React 18, Zustand, Axios, Tailwind CSS, shadcn/ui, Lucide Icons.

---

## Phase 1: Core Layout Shell & Shared Components Infrastructure

### Task 1: API Constants & Client Infrastructure

**Files:**

- Modify: `lib/const.tsx` (already updated by user for flat endpoints & typos)
- Create: `lib/cp-api.ts`
- Create: `stores/cp-workspace.store.ts`
- Create: `hooks/cp/useCpRole.ts`

- [ ] **Step 1: Create Axios API Interceptor (`lib/cp-api.ts`)** to automatically attach `x-workspace-id` header on all `/api/cp/*` requests.
- [ ] **Step 2: Create Zustand Workspace Store (`stores/cp-workspace.store.ts`)** for tracking active workspace ID, slug, org ID, member ID, and role.
- [ ] **Step 3: Create Role Hook (`hooks/cp/useCpRole.ts`)** for conditional UI RBAC checks.

### Task 2: Root Route Group & Responsive Layout Shell

**Files:**

- Create: `app/(connect-plus)/layout.tsx`
- Create: `app/(connect-plus)/cp/layout.tsx`
- Create: `app/(connect-plus)/cp/[workspaceSlug]/layout.tsx`
- Create: `components/cp/layout/CpShell.tsx`
- Create: `components/cp/layout/CpSidebar.tsx`
- Create: `components/cp/layout/CpBottomNav.tsx`
- Create: `components/cp/shared/Dialog.tsx`

- [ ] **Step 1: Build `app/(connect-plus)/layout.tsx`** as the root CP provider shell.
- [ ] **Step 2: Build `app/(connect-plus)/cp/[workspaceSlug]/layout.tsx`** to resolve workspace slug via `GET /api/cp/my-workspaces` and populate Zustand store before rendering children.
- [ ] **Step 3: Implement `CpSidebar` & `CpBottomNav`** featuring Workspace Switcher, role chip, and pinned "← Back to Connect" escape hatch (PRD §5.2, §5.4).
- [ ] **Step 4: Implement responsive `Dialog` component** (PRD §13.3) switching between Bottom Sheet (<1024px) and Centered Modal (≥1024px).

---

## Phase 2: Organization-Level Dashboard, Subscriptions & Security

### Task 3: Creator Org Dashboard (`/cp/org`)

**Files:**

- Create: `app/(connect-plus)/cp/org/page.tsx`

- [ ] **Step 1: Build Creator Org Dashboard** displaying workspace cards grid (`GET /api/cp/my-workspaces`) and workspace creation modal (`POST /api/cp/workspaces`).

### Task 4: SaaS Billing & Subscription Management (`/cp/org/subscription`)

**Files:**

- Create: `app/(connect-plus)/cp/org/subscription/page.tsx`

- [ ] **Step 1: Build Subscriptions Page** (PRD §10.11) displaying current SaaS plan details (`GET /api/cp/organizations/me/subscription`) and upgrade plan modal (`POST /api/cp/organizations/me/subscription/upgrade`).

### Task 5: Organization Audit Logs & Verification (`/cp/org/audit-logs`)

**Files:**

- Create: `app/(connect-plus)/cp/org/audit-logs/page.tsx`

- [ ] **Step 1: Build Audit Logs Page** (PRD §10.10) with filterable log table (`GET /api/cp/audit-logs`), verification badge (`GET /api/cp/audit-logs/verify`), and CSV export action (`GET /api/cp/audit-logs/export`).

---

## Phase 3: Workspace Core Operations (Dashboard, Team, Invoices, Appointments)

### Task 6: Workspace Summary Dashboard

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/dashboard/page.tsx`

- [ ] **Step 1: Build Dashboard Page** (PRD §7.1, §11.1) featuring stat cards (Profile views, Taps, Leads, Active devices) via `GET /api/cp/organizations/me/analytics` and business profile summary.

### Task 7: Team Directory & Role Management

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/team/page.tsx`

- [ ] **Step 1: Build Staff Directory** (PRD §7.2, §7.3, §11.2) with search, filter, staff list table (`GET /api/cp/staff`), staff invite drawer (`POST /api/cp/staff/invite`), and inline role modification (`PATCH /api/cp/staff/{id}/role`).

### Task 8: Complete Invoicing System

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/invoices/page.tsx`
- Create: `app/(connect-plus)/cp/[workspaceSlug]/invoices/create/page.tsx`
- Create: `app/(connect-plus)/cp/[workspaceSlug]/invoices/[invoiceId]/page.tsx`
  etc

- [ ] **Step 1: Build Invoices List** (PRD §7.5, §11.3) displaying status stat cards, searchable table (`GET /api/cp/invoices`), and CSV export button.
- [ ] **Step 2: Build Create Invoice Page** (PRD §7.6) with line-item calculations, VAT toggle, and draft/send actions (`POST /api/cp/invoices`).
- [ ] **Step 3: Build Invoice Detail Page** (PRD §7.7) displaying status banner, line items breakdown, payment timeline, and actions (Send, Mark Paid, Cancel, Download PDF).

### Task 9: Appointments Calendar & Booking Management

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/appointments/page.tsx`
- Create: `app/(connect-plus)/cp/[workspaceSlug]/appointments/[appointmentId]/page.tsx`

- [ ] **Step 1: Build Appointments Calendar Page** (PRD §7.9) with month grid, date indicators, and upcoming appointment list (`GET /api/cp/appointments`).
- [ ] **Step 2: Build Appointment Detail Page** (PRD §7.10) with map embed for onsite visits, Zoom/Meet links for remote visits, attendees list, and status update actions.

---

## Phase 4: Customer Pipeline (Leads, Clients, Attendance & Chat)

### Task 10: Leads Pipeline & Reject Flow

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/leads/page.tsx`

- [ ] **Step 1: Build Leads Pipeline Page** (PRD §10.1, §11.6) with lead status list (`GET /api/cp/leads`), assign staff modal (`POST /api/cp/leads/{id}/assign`), validate action (`POST /api/cp/leads/{id}/validate`), and reject modal (`POST /api/cp/leads/{id}/reject`).

### Task 11: Client Management & Portal Invites

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/clients/page.tsx`

- [ ] **Step 1: Build Client Directory** (PRD §10.2, §11.7) displaying client list (`GET /api/cp/clients`), assigned staff filter, reassign modal, and client account invitation modal (`POST /api/cp/clients/{id}/invite`).

### Task 12: Attendance Tracking & Supervisor Overrides

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/attendance/page.tsx`

- [ ] **Step 1: Build Attendance Page** (PRD §10.3, §11.8) featuring clock check-in/check-out widget (`POST /api/cp/attendance/check-in`), staff attendance logs, and supervisor override modal (`PATCH /api/cp/attendance/{id}/override`).

### Task 13: Team & Client Realtime Chat

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/chat/page.tsx`
- Create: `lib/cp-socket.ts`

- [ ] **Step 1: Build Chat Page** (PRD §7.11, §7.12, §11.5) supporting conversation list (`GET /api/cp/conversations`), message thread with text/voice-note/image attachments, reading indicators, and Socket.IO client connection (`lib/cp-socket.ts`).

---

## Phase 5: Recruitment, Talent Search & Workspace Invites

### Task 14: Job Postings & Applications Management

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/jobs/page.tsx`
- Create: `app/(connect-plus)/cp/[workspaceSlug]/jobs/[jobId]/page.tsx`

- [ ] **Step 1: Build Jobs Directory & Create Job Modal** (PRD §10.8) using `GET /api/cp/jobs` and `POST /api/cp/jobs`.
- [ ] **Step 2: Build Job Applications Detail Page** displaying applicant profiles and status controls (`GET /api/cp/jobs/{id}/applications`).

### Task 15: Artisan Talent Search & Bookmarks

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/talent/page.tsx`

- [ ] **Step 1: Build Talent Directory** (PRD §10.9) with artisan search (`GET /api/cp/talent/search`), job invitation modal (`POST /api/cp/talent/{id}/invite/{jobId}`), and saved bookmarks manager (`GET/POST/DELETE /api/cp/talent/saved`).

### Task 16: Workspace Invites Management

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/invites/page.tsx`

- [ ] **Step 1: Build Generic Workspace Invites Page** (PRD §10.12) to list active pending invitations (`GET /api/cp/invites`), resend invites (`POST /api/cp/invites/{id}/resend`), and revoke invites (`DELETE /api/cp/invites/{id}`).

---

## Phase 6: Auth, Public Surfaces & Settings

### Task 17: Staff Invite Acceptance Flow

**Files:**

- Create: `app/(connect-plus)/cp/invites/accept/page.tsx`

- [ ] **Step 1: Build 4-Step Onboarding Wizard** (PRD §7.4):
  - Step 1: Email entry & invite verification
  - Step 2: Setup password with real-time strength validation
  - Step 3: 6-digit OTP verification code
  - Step 4: Staff profile photo & cover photo setup

### Task 18: Workspace Settings & Company Profile

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/settings/page.tsx`
- Create: `app/(connect-plus)/cp/[workspaceSlug]/settings/company/page.tsx`

- [ ] **Step 1: Build Workspace Settings Page** with general preferences and member permissions.
- [ ] **Step 2: Build Authenticated Company Profile Edit Page** (PRD §10.13, §11.10) using `GET /api/cp/company-profile` and `PATCH /api/cp/company-profile`.

### Task 19: Unauthenticated Public Business Profile & Booking Wizard

**Files:**

- Create: `app/(connect-plus)/public/[workspaceSlug]/page.tsx`
- Create: `app/(connect-plus)/public/[workspaceSlug]/book/page.tsx`

- [ ] **Step 1: Build Public Business Profile Page** (PRD §8.1, §12.1) displaying company branding, category, location, address, contact links, and booking entry point (`GET /api/cp/public/{workspaceSlug}`).
- [ ] **Step 2: Build 4-Step Appointment Booking Wizard** (PRD §8.2, §12.2): Location (Onsite/Remote) → Connection Method (Zoom/Meet) → Date & Time slot picker → Customer contact details & confirmation (`POST /api/cp/public/{workspaceSlug}/appointments`).

---

## Phase 7: E-Commerce Shop Module & NFC Tap Landing

### Task 20: Shop / Inventory Module UI Shell & Backend Gap Banner

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/shop/page.tsx`

- [ ] **Step 1: Build Shop Management UI** (PRD §7.13–7.16) covering Inventory list, Add/Edit product modal, Transaction history, and Order delivery timeline.
- [ ] **Step 2: Add Backend Dependency Banner** acknowledging PRD §17.2 open question until `/api/cp/products` and `/api/cp/orders` endpoints are made available by the backend team.

### Task 21: Connect Cards & NFC Tap Landing Shell

**Files:**

- Create: `app/(connect-plus)/cp/[workspaceSlug]/cards/page.tsx`
- Create: `app/(connect-plus)/public/cards/[cardCode]/page.tsx`

- [ ] **Step 1: Build Connect Cards Management View & Public NFC Tap Landing Page** (PRD §10.4, §10.5, §17.3) with placeholder API integration points ready for backend route confirmation.

---

## Verification Plan

### Automated Build Verification

- Execute TypeScript check:
  ```bash
  pnpm tsc --noEmit
  ```
- Execute Next.js build:
  ```bash
  pnpm build
  ```

### Manual Verification Flow

1. Verify routing in `app/(connect-plus)`:
   - Public profile: `/public/[workspaceSlug]`
   - Public booking: `/public/[workspaceSlug]/book`
   - Org Dashboard: `/cp/org`
   - Workspace Dashboard: `/cp/[workspaceSlug]/dashboard`
2. Test `x-workspace-id` header injection on API calls.
3. Test responsive layout adaptations (desktop sidebar vs mobile bottom tab bar).
