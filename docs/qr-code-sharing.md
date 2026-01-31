# QR Code Sharing (Customer View)

This document explains how QR code sharing was implemented for the customer
profile view, including the offline vCard payload, the online profile link QR,
and the share options added under the cards.

## Overview

We added a share button to the customer profile actions that opens a dialog.
Inside the dialog:

- Users can **swipe** between two QR codes (offline and online).
- The **offline QR** encodes a **vCard (VCF)** with core contact details plus
  one link and one social URL.
- The **online QR** encodes the **public profile URL**.
- A share bar below the cards lets users copy or share the profile URL.
- Additional quick-share buttons are available for WhatsApp, X, LinkedIn, and Email.

The swipe UI is mobile-focused and mirrors the clean card layout from the design
inspiration while using the system color scheme.

## Files Added / Updated

- `components/customer/share-qr-dialog.tsx`
  - Main dialog UI and QR generation.
- `app/(root)/customer/[id]/page.tsx`
  - Wires the dialog into the customer profile view.

## Entry Point (Customer Profile)

The share dialog is attached to the action row in:

- `app/(root)/customer/[id]/page.tsx`

It passes the following to the dialog:

- `profileId` (customer id)
- `profile` (name, position, profile photo, etc.)
- `contact` (email/phone for vCard)
- `links` and `socials` (for offline QR URL entries)

## Dialog UI (Swipe Cards)

The dialog is implemented in:

- `components/customer/share-qr-dialog.tsx`

Key parts:

- **Dialog trigger**: a ghost icon button with a Share icon.
- **Profile header**: avatar + name + position at top.
- **Swipe carousel**: uses `embla-carousel-react` to show one QR at a time.
- **Pagination dots**: updates on swipe and can be tapped to jump slides.
- **Share bar**: copy/share actions, with quick-share buttons underneath.

### Embla Carousel

Embla is used for the swipe behavior:

- `useEmblaCarousel({ align: "center", containScroll: "trimSnaps" })`
- `onSelect` updates the active dot state.
- `scrollTo(index)` is used by dot buttons.

This keeps the UI mobile-friendly and avoids showing both QR cards at once.

## QR Code Generation

We use the `qrcode` package to generate Data URLs.

Generation happens only when the dialog opens:

- `QRCode.toDataURL(offlinePayload, { width: 240, margin: 1 })`
- `QRCode.toDataURL(profileUrl, { width: 240, margin: 1 })`

The dialog uses loading placeholders (animated blocks) until the QR image is ready.

## Offline QR Payload (vCard)

The offline QR contains a vCard (VCF) string.

We intentionally keep it **small** for scan reliability:

Included fields:

- `FN` (full name)
- `TITLE` (title/position)
- `ROLE`
- `EMAIL`
- `TEL`
- `URL` (public profile link)
- **One link URL** (first link, if any)
- **One social URL** (first social, if any)

We removed free-text `NOTE` fields to reduce QR complexity and improve scan success.

The vCard builder function is in `share-qr-dialog.tsx`:

- `buildVCard({ name, title, role, email, phone, profileUrl, links, socials })`

### Payload Limiting

To prevent oversized QR data:

- We **limit to 1 link** and **1 social** in the offline vCard.
- Each is added as a separate `URL:` entry.

If you need to include more, increase the slice limit, but note that larger
payloads reduce scan reliability on mobile cameras.

## Online QR Payload (Profile URL)

The online QR is simply the public profile URL:

- `${NEXT_PUBLIC_URL}/customer/${profileId}`
  - Fallback: `window.location.origin` when env is missing.

This QR opens the full profile in a browser when scanned.

## Share Options (Non‑QR)

Below the cards, we added an action row:

- **Share** (uses Web Share API when available)
- **Copy** (copies the profile URL)
- Quick share buttons:
  - WhatsApp
  - X (Twitter)
  - LinkedIn
  - Email

All URLs use a consistent share text:

`"Check out {name}'s profile"` (fallback: `"View this profile"`).

If Web Share is unavailable, the Share button falls back to Copy.

## Environment / URL Handling

The profile URL is built with:

- `process.env.NEXT_PUBLIC_URL`, if set.
- Otherwise `window.location.origin`.

This keeps QR codes valid across dev/staging/prod.

## Testing Checklist

- Open a customer profile, click the share icon.
- Swipe between cards.
- Scan offline QR: should import contact + include profile link.
- Scan online QR: should open profile URL.
- Copy button: clipboard should contain the correct URL.
- Share button: uses native share sheet on mobile.
- Quick share buttons open correct platforms.

## Notes / Future Enhancements

- Add branded platform icons in the quick-share row.
- Include a subtle swipe hint animation (optional).
- Add a “Download QR” button for saving images.
- Support iOS-specific vCard formatting if needed.

