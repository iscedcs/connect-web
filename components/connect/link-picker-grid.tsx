"use client";
import Link from "next/link";
import { ArrowLeft, Link2 } from "lucide-react";

type LinkItem = { key: string; icon: string; label: string };
const DEFAULT_ITEMS: LinkItem[] = [
  // {
  //   key: "custom",
  //   icon: "/assets/socials/ic_round-plus.svg",
  //   label: "Custom",
  // },
  {
    key: "cal",
    icon: "/assets/Ellipse9.svg",
    label: "Calendly",
  },
  {
    key: "btc",
    icon: "/assets/logos_bitcoin.svg",
    label: "Bitcoin",
  },
  {
    key: "tiktok",
    icon: "/assets/socials/logos_tiktok-icon.svg",
    label: "TikTok",
  },
  {
    key: "yt",
    icon: "/assets/logos_youtube-icon.svg",
    label: "YouTube",
  },
  {
    key: "x",
    icon: "/assets/socials/prime_twitter.svg",
    label: "X",
  },
  {
    key: "gdrive",
    icon: "/assets/socials/logos_google-drive.svg",
    label: "Drive",
  },
  {
    key: "ig",
    icon: "/assets/socials/skill-icons_instagram.svg",
    label: "Instagram",
  },
  {
    key: "meet",
    icon: "/assets/socials/logos_google-meet.svg",
    label: "Meet",
  },
  {
    key: "spotify",
    icon: "/assets/logos_spotify-icon.svg",
    label: "Spotify",
  },
  {
    key: "wa",
    icon: "/assets/socials/logos_whatsapp-icon.svg",
    label: "WhatsApp",
  },
  {
    key: "li",
    icon: "/assets/socials/devicon_linkedin.svg",
    label: "LinkedIn",
  },
];

export default function LinkPickerGrid({
  items = DEFAULT_ITEMS,
  onPick,
  backHref = "/",
}: {
  items?: LinkItem[];
  onPick: (key: string) => void;
  backHref?: string;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-screen-sm px-4 pt-4">
        <Link href={backHref} className="text-white/90">
          <ArrowLeft />
        </Link>

        <div className="mt-3 flex items-center justify-center">
          <Link2 className="w-5 h-5" />
        </div>
        <h1 className="mt-3 text-center text-2xl font-semibold">
          Which link would you love to add?
        </h1>

        <div className="mt-6 grid grid-cols-3 gap-y-6 gap-x-8 place-items-center">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => onPick(it.key)}
              className="active:scale-95"
              aria-label={it.label}>
              <img
                src={it.icon}
                alt={it.label}
                className="w-16 h-16 object-contain rounded-xl"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
