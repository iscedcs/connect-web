import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEVICE_TYPE } from "./const";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Scale center slide to 1.25, neighbors to 1.1, others to 0.9 (and adjust opacity) */
export function scaleSlides(slider: any) {
  const rel = slider.track.details.rel; // current active (center) index
  const slides = slider.slides as HTMLElement[];
  slides.forEach((slide: HTMLElement, idx: number) => {
    const bubble = slide.querySelector(".icon-bubble") as HTMLElement | null;
    if (!bubble) return;
    const dist = distanceMod(rel, idx, slides.length); // 0 for center, 1 for next, etc.

    let scale = 0.9;
    let opacity = 0.55;

    if (dist === 0) {
      scale = 1.25; // active center
      opacity = 1;
    } else if (dist === 1) {
      scale = 1.1; // next/prev
      opacity = 0.9;
    }

    bubble.style.transform = `scale(${scale})`;
    bubble.style.opacity = String(opacity);
    // Optional: subtle glow on active
    bubble.style.boxShadow =
      dist === 0 ? "0 0 0.75rem rgba(255,255,255,0.15)" : "none";
  });
}

/** minimal distance on circular ring */
export function distanceMod(a: number, b: number, n: number) {
  const d = Math.abs(a - b) % n;
  return Math.min(d, n - d);
}

export function getDeviceName(
  type: "6214bdef7dbcb" | "6214bdef6dbcb" | "6214bdef5dbcb" | "6214bdef4dbcb"
) {
  switch (type) {
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
