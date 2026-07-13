# Connect Plus — Remaining Work

This file captures the main items still left to complete for Connect Plus.

## High Priority

- Add the shared `CpDialog` component for adaptive bottom sheets and desktop modals.
- Build the Save Contact Gate page for unauthenticated save flow.
- Add the CP-specific PWA manifest route so Connect Plus is installable.

## Medium Priority

- Create a reusable `CpContextPanel` for right-side detail panels.
- Create a reusable `CpDataTable` to replace inline tables across CP screens.
- Implement Share Workspace screens for staff invite links, client links, and private workspace links.

## Blocked / Backend Dependent

- Add the catch-all CP API proxy route for `/api/cp/**` requests.
- Wire real Socket.IO events in chat once the backend CP module is ready.

## Nice to Have / Polish

- Add more QA and edge-case handling around loading, empty, and error states.
- Review mobile/desktop parity and refine responsive behavior.
- Validate analytics, notifications, and public-facing flows end to end.

## Suggested Order

1. `CpDialog`
2. Save Contact Gate
3. PWA manifest route
4. `CpContextPanel`
5. `CpDataTable`
6. Share Workspace screens
7. Backend-dependent API and chat work
