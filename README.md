# ISCE Connect Web

Web application for the ISCE Connect ecosystem, built with Next.js. It powers cardholder and customer experiences, including profile management, shared links, files, events, and QR-based sharing flows.

## Tech Stack

- Next.js App Router
- React 19, TypeScript
- Tailwind CSS + Radix UI
- PNPM for package management

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server (configured to use port 3154):

```bash
pnpm dev
```

Open `http://localhost:3154` in your browser.

## Scripts

- `pnpm dev` - start the dev server on port 3154
- `pnpm build` - build for production
- `pnpm start` - start the production server
- `pnpm lint` - run Next.js linting

## Environment Variables

Create a `.env` file with the required values. Common variables used by the app:

- `NEXT_PUBLIC_URL`
- `AUTH_BASE_URL`
- `AUTH_LOGIN_PATH`
- `NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL`
- `NEXT_PUBLIC_LIVE_ISCEAUTH_BACKEND_URL`
- `NEXT_PUBLIC_LIVE_EVENTS_BACKEND_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_EVENT_LIVE_URL`

## Project Structure

- `app/` - Next.js app router routes and layouts
- `components/` - UI components and feature modules
- `lib/` - utilities, services, and shared logic
- `schemas/` - zod schemas and validation
- `public/` - static assets

## Documentation

- `_Multi-Profile-Connect-API-Documentation.md`
- `NEW_API_IMPROVEMENTS_ON_CONNECT.md`
- `NEW_ENDPOINT_REQUEST_ON_CONNECT.md`
- `_CONNECT_UI_FUTURE_IMPROVEMENTS.md`
