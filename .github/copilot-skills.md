# Skill: ISCE Connect Web — Security & Frontend Practices

## Description

This skill defines the mandatory security patterns, architectural rules, and coding practices for the **connect-web** Next.js frontend — the ISCE Connect digital business card platform UI.

---

## Security Rules

### CSRF Protection (Double Submit Cookie)

- **Middleware** (`middleware.ts`) validates CSRF on state-changing requests and sets cookies on all responses.
- **Server-side** (`lib/csrf.ts`):
    - `setCsrfCookie(response)` — 32-byte hex token, `httpOnly: false`, `sameSite: lax`, 24h expiry.
    - `validateCsrf(request)` — compares `X-CSRF-Token` header with `csrf_token` cookie on POST/PUT/PATCH/DELETE to `/api/*` routes.
    - **Exempt paths:** `/auth/callback`, `/api/auth/refresh`
- **Client-side** (`lib/csrf-client.ts`):
    - `csrfFetch(input, init)` — drop-in replacement for `fetch()` that auto-includes `X-CSRF-Token`.

#### Rules:

1. **All `"use client"` components** making POST/PUT/PATCH/DELETE calls **must** use `csrfFetch()`.
2. **Never use raw `fetch()`** for state-changing requests in client components.
3. **Server-side API routes** and **server components** do not need `csrfFetch` — they make server-to-server calls.
4. When adding a new **CSRF-exempt path**, add it to `csrfExemptPaths` in `lib/csrf.ts`.

### Authentication — Middleware JWT Flow

The middleware (`middleware.ts`) handles the full auth lifecycle:

1. **Token verification** — checks `accessToken` cookie using `verifyToken()` from `lib/verify-jwt.ts`.
2. **Token refresh** — if expired, calls `isce-auth` backend `/auth/refresh` with refresh token cookie.
3. **Redirect** — if unauthenticated, redirects to `isce-auth-mobile` via `buildAuthLoginUrl()`.

#### Rules:

- **Tokens are httpOnly cookies only** — never in localStorage, sessionStorage, or non-httpOnly cookies.
- The middleware sets `maxAge` from JWT expiry for the access token cookie, and 7 days for the refresh token.
- Protected routes are defined in `routes.ts` under `protectedRoutes`.
- Public routes (`/`, `/customer`, `/terms`, etc.) do not require authentication.

### Auth Code Exchange (SSO)

The `/auth/callback` route implements the OAuth-style auth code flow:

1. Receives `code` parameter from `isce-auth-mobile` redirect.
2. Exchanges code for tokens via server-to-server POST to `isce-auth`'s `/auth/token` endpoint.
3. Stores tokens in httpOnly cookies.
4. Redirects to the original page (validated for same-origin).

#### Rules:

- **Never expose the auth code or tokens in client-side JavaScript.**
- The callback route validates redirect URLs against the app's origin.
- Legacy `token` parameter flow is still supported but the auth code flow is preferred.

### Safe Redirects

- `lib/auth-urls.ts` (`buildAuthLoginUrl()`) constructs SSO login URLs with:
    - Callback URL pointing to `/auth/callback` on this app's origin.
    - `redirect` parameter validated via origin checking.
- Never construct redirect URLs by concatenating user input without validation.

### File Upload Security

- `lib/client-upload.ts` handles client-side file uploads.
- Validate file types and sizes before upload.
- File storage uses DigitalOcean Spaces (`lib/spaces/`).
- Never serve user-uploaded files without proper Content-Type headers.
- The `/api/pdf-proxy` route must validate URLs and sanitise responses.

---

## Architecture Rules

### Component Structure

```
components/
├── cardholder/          # Authenticated cardholder views
├── customer/            # Public profile viewer (no auth required)
├── forms/               # Profile editing, settings forms
├── landing/             # Landing/marketing page components
├── legal/               # Terms, privacy policy
├── pages/               # Page-level view components
├── settings/            # Settings management
├── shared/              # Reusable components
├── taporscantoconnect/  # NFC/QR connection flow
└── ui/                  # shadcn/ui base components
```

### Feature Libraries

```
lib/
├── connect-appointments/  # Appointment link utilities
├── connect-files/         # File management
├── connect-links/         # Custom link utilities
├── connect-meetings/      # Meeting link utilities
├── connect-social/        # Social platform utilities
├── connect-spotify/       # Spotify integration
├── services/              # API service clients for connect-nest
├── server/                # Server-only utilities
└── spaces/                # DigitalOcean Spaces file storage
```

- Each `connect-*` module encapsulates logic for a specific profile feature.
- `services/` contains typed API client functions for the `connect-nest` backend.

### Routes Configuration

```ts
// routes.ts
publicRoutes: [
	'/',
	'/customer',
	'/terms',
	'/privacy',
	'/support',
	'/card/connect',
];
protectedRoutes: [
	'/dashboard',
	'/bvn',
	'/home',
	'/connect',
	'/devices',
	'/otp',
	'/profile',
	'/device',
	'/settings',
	'/wallet',
	'/wearables',
];
```

---

## Coding Standards

1. **"use client"** directive — required on all interactive components.
2. **csrfFetch()** — mandatory for all client POST/PUT/PATCH/DELETE calls. Import from `@/lib/csrf-client`.
3. **Zod schemas** — form validation.
4. **Sonner toast** — `toast.success()`, `toast.error()` for user feedback.
5. **No `any` types** — use proper TypeScript types.
6. **Feature isolation** — use `lib/connect-*` modules; don't mix feature logic.
7. **Loading states** — all forms must show loading states during async operations.
8. **DND Kit** — drag-and-drop reordering uses `@dnd-kit` library.
9. **NFC/QR** — `lib/web-nfc.utils.ts` handles NFC operations; `taporscantoconnect/` handles the connect flow.

---

## Testing Checklist

Before merging any PR:

- [ ] Client components use `csrfFetch()` for all state-changing requests
- [ ] No tokens stored in localStorage/sessionStorage
- [ ] Redirect URLs are validated for same-origin
- [ ] Forms have zod validation schemas
- [ ] File uploads validate type and size
- [ ] Loading states prevent duplicate submissions
- [ ] Protected routes are listed in `routes.ts`
- [ ] New API routes handle errors gracefully
- [ ] NFC operations have proper error handling
