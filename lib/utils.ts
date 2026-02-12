import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEVICE_TYPE } from "./const";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Scale center slide to 1.25, neighbors to 1.1, others to 0.9 (and adjust opacity) */
export function scaleSlides(slider: any) {
  const rel = slider.track.details.rel;
  const slides = slider.slides as HTMLElement[];
  slides.forEach((slide: HTMLElement, idx: number) => {
    const bubble = slide.querySelector(".icon-bubble") as HTMLElement | null;
    if (!bubble) return;
    const dist = distanceMod(rel, idx, slides.length);

    let scale = 0.9;
    let opacity = 0.55;

    if (dist === 0) {
      scale = 1.25;
      opacity = 1;
    } else if (dist === 1) {
      scale = 1.1;
      opacity = 0.9;
    }

    bubble.style.transform = `scale(${scale})`;
    bubble.style.opacity = String(opacity);
    bubble.style.boxShadow =
      dist === 0 ? "0 0 0.75rem rgba(255,255,255,0.15)" : "none";
  });
}

/**
 * minimal distance on circular ring
 * */
export function distanceMod(a: number, b: number, n: number) {
  const d = Math.abs(a - b) % n;
  return Math.min(d, n - d);
}

export function normalizeDeviceType(type?: unknown, productId?: unknown) {
  const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();
  const fromType = normalize(
    typeof type === "object" && type !== null
      ? (type as Record<string, unknown>).id ??
          (type as Record<string, unknown>)._id ??
          (type as Record<string, unknown>).type
      : type,
  );
  const fromProduct = normalize(productId);

  const resolve = (value: string) => {
    switch (value) {
      case DEVICE_TYPE.CARD:
      case "card":
        return DEVICE_TYPE.CARD;
      case DEVICE_TYPE.STICKER:
      case "sticker":
        return DEVICE_TYPE.STICKER;
      case DEVICE_TYPE.WRISTBAND:
      case "wristband":
        return DEVICE_TYPE.WRISTBAND;
      case DEVICE_TYPE.KEYCHAIN:
      case "keychain":
        return DEVICE_TYPE.KEYCHAIN;
      default:
        return null;
    }
  };

  return resolve(fromType) ?? resolve(fromProduct);
}

export function getDeviceName(type: unknown, productId?: unknown) {
  switch (normalizeDeviceType(type, productId)) {
    case DEVICE_TYPE.CARD:
      return "Card";
    case DEVICE_TYPE.STICKER:
      return "Sticker";
    case DEVICE_TYPE.WRISTBAND:
      return "Wristband";
    case DEVICE_TYPE.KEYCHAIN:
      return "Keychain";
    default:
      return "Unknown Device";
  }
}

export function generatePassword() {
  return (
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).toUpperCase().slice(-4)
  );
}

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarInitials(name?: string | null) {
  const safeName = (name ?? "").trim();
  if (!safeName) return "CU";

  const initials = safeName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "CU";
}

export function getDeterministicAvatarDataUri(seed?: string | null, name?: string | null) {
  const key = `${seed ?? ""}::${name ?? ""}`.trim() || "connect-user";
  const hash = hashSeed(key);
  const accentX = 28 + (hash % 44);
  const accentY = 24 + ((hash >> 4) % 52);
  const accentOpacity = 0.12 + ((hash % 10) / 100);
  const initials = getAvatarInitials(name);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0B0E" />
      <stop offset="100%" stop-color="#17171C" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#D1D5DB" />
    </linearGradient>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <rect width="256" height="256" fill="url(#bg)" />
  <circle cx="${accentX}%" cy="${accentY}%" r="82" fill="#FFFFFF" opacity="${accentOpacity}" />
  <circle cx="${100 - accentX}%" cy="${100 - accentY}%" r="64" fill="#FFFFFF" opacity="0.05" />

  <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle"
    fill="url(#textGrad)" stroke="#F9FAFB" stroke-opacity="0.35" stroke-width="1"
    filter="url(#textGlow)" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="92" letter-spacing="1">${initials}</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
