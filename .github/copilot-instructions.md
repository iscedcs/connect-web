# ISCE Connect Web — Project Instructions

## Overview

**connect-web** is the frontend for ISCE Connect — a digital business card platform that lets users create and share professional profiles, social links, contact cards, meeting links, files, and more. Users authenticate via the `isce-auth-mobile` (isce-auth-web) SSO frontend and manage their profiles through the `connect-nest` backend.

- **Framework:** Next.js (App Router, TypeScript)
- **Default branch:** `main` | **Working branch:** `release`
- **Port:** 3154 (dev)
- **Auth model:** JWT tokens stored in httpOnly cookies, validated in proxy
- **Package manager:** pnpm

---

## Architecture

```
app/
├── page.tsx                     # Landing page
├── layout.tsx                   # Root layout
├── auth/
│   └── callback/route.ts        # SSO callback — auth code exchange + token storage
├── api/
│   ├── auth/
│   │   └── refresh/route.ts     # Token refresh endpoint
│   ├── connect/                 # Connect-specific API routes
│   ├── device/                  # Device management
│   ├── pdf-proxy/               # PDF proxy service
│   └── upload/                  # File upload handler
components/
├── cardholder/                  # Cardholder-specific views
├── customer/                    # Public profile viewer
├── forms/                       # Profile, settings, NFC forms
├── landing/                     # Landing page components
├── legal/                       # Legal/terms components
├── pages/                       # Page-level components
├── settings/                    # Settings views
├── shared/                      # Shared components
├── taporscantoconnect/          # NFC/QR connect flow
└── ui/                          # shadcn/ui base components
lib/
├── auth-urls.ts                 # SSO login URL builder
├── csrf.ts                      # Server-side CSRF utilities
├── csrf-client.ts               # Client-side csrfFetch() wrapper
├── verify-jwt.ts                # JWT verification & decode
├── client-upload.ts             # Client file upload utility
├── connect-*/                   # Feature-specific libraries
├── server/                      # Server-only utilities
├── services/                    # API service clients
├── spaces/                      # DigitalOcean Spaces integration
└── storage.ts                   # Storage utilities
proxy.ts                         # CSRF + auth + token refresh (Next.js 16 — replaces middleware.ts)
routes.ts                        # Route definitions
```

---

## Security Practices (MANDATORY)

### 1. CSRF Protection

- **Proxy** (`proxy.ts`) validates CSRF on state-changing requests and sets CSRF cookies on all responses.
- **Server-side** (`lib/csrf.ts`): `validateCsrf()` checks `X-CSRF-Token` header matches `csrf_token` cookie on POST/PUT/PATCH/DELETE to `/api/*` routes.
- **Client-side** (`lib/csrf-client.ts`): `csrfFetch()` auto-attaches `X-CSRF-Token` header.
- **Exempt paths:** `/auth/callback`, `/api/auth/refresh`
- **Rule:** All `"use client"` components making POST/PUT/PATCH/DELETE calls must use `csrfFetch()` from `@/lib/csrf-client`, never raw `fetch()`.

### 2. Authentication (Middleware JWT Flow)

- The proxy intercepts all requests to protected routes (`/dashboard`, `/home`, `/profile`, `/settings`, etc.).
- It verifies the `accessToken` cookie using `verifyToken()` from `lib/verify-jwt.ts`.
- If the access token is expired but a `refreshToken` exists, it calls `isce-auth`'s `/auth/refresh` endpoint.
- If refresh fails, the user is redirected to `isce-auth-mobile` (isce-auth-web) login via `buildAuthLoginUrl()`.
- **Tokens are only stored in httpOnly cookies** — never in localStorage or sessionStorage.

### 3. SSO Login (Auth Code Flow)

- `/auth/callback` route handles SSO: receives an auth code, exchanges it server-to-server for tokens via `isce-auth`'s `/auth/token` endpoint.
- Redirect URLs are validated against the app's origin to prevent open redirects.
- Legacy `token` parameter flow still supported as fallback.

### 4. Safe Redirects

- `lib/auth-urls.ts` (`buildAuthLoginUrl()`) constructs SSO URLs with proper origin validation.
- Callback route validates redirect parameters before use.
- Only same-origin redirects are permitted.

### 5. Input Validation

- Forms use `react-hook-form` with `zod` schemas.
- Server-side validation in API routes and server components.

---

## Auth Flow

### SSO Login
1. User accesses a protected page → proxy redirects to `isce-auth-mobile`
2. User authenticates → redirected to `/auth/callback?code=...&redirect=...`
3. Callback exchanges code for tokens server-to-server → stores in httpOnly cookies → redirects

### Token Refresh
1. Proxy detects expired access token
2. Calls `/auth/refresh` on `isce-auth` backend with refresh token
3. Receives new tokens → sets new cookies → continues request

---

## Coding Conventions

1. **"use client"** — mark all interactive components. Server components are the default.
2. **csrfFetch()** — use for all client-side API calls (POST/PUT/PATCH/DELETE). Import from `@/lib/csrf-client`.
3. **Zod schemas** — all form validation uses zod.
4. **No raw fetch()** in client components — use `csrfFetch()` for state-changing requests.
5. **Toast notifications** — use `sonner` for user feedback.
6. **shadcn/ui** — use the `components/ui/` library for base components.
7. **Feature libraries** — use `lib/connect-*` modules for feature-specific logic.

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `AUTH_API_URL` | Base URL of the isce-auth backend (server-side) |
| `NEXT_PUBLIC_AUTH_WEB_URL` | Base URL of isce-auth-web (repo: isce-auth-mobile) frontend |
| `AUTH_LOGIN_PATH` | Login path on auth frontend (default `/sign-in`) |
| `JWT_SECRET` | Shared secret for local JWT verification |
| `NEXT_PUBLIC_URL` | This app's public URL (also used for metadata/SEO) |
| `NEXT_PUBLIC_AUTH_API_URL` | Base URL of the isce-auth backend (client) |
| `NEXT_PUBLIC_CONNECT_API_URL` | Base URL of the connect-nest backend |
| `NEXT_PUBLIC_EVENTS_API_URL` | Base URL of the isce-events_api backend |
| `NEXT_PUBLIC_EVENTS_WEB_URL` | Base URL of the events-web frontend |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `NODE_ENV` | `development` / `production` |
| `DO_SPACES_KEY` | DigitalOcean Spaces access key |
| `DO_SPACES_SECRET` | DigitalOcean Spaces secret |
| `DO_SPACES_ENDPOINT` | DigitalOcean Spaces endpoint URL |
| `DO_SPACES_BUCKET` | DigitalOcean Spaces bucket name |
| `DO_SPACES_REGION` | DigitalOcean Spaces region |
| `DO_SPACES_DOCS_PREFIX` | Spaces prefix for document uploads |

---

## Commands

```bash
pnpm install            # Install dependencies
pnpm run dev            # Start dev server (port 3154)
pnpm run build          # Production build
pnpm run lint           # Run ESLint
```
