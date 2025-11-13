// lib/connect-link-categories.ts
import {
  LinkIcon,
  VideoIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  WalletIcon,
  Music2Icon,
  FolderOpenIcon,
  AtSignIcon,
} from "lucide-react";

export type LinkCategory =
  | "contact"
  | "links"
  | "video"
  | "socials"
  | "meetings"
  | "appointments"
  | "spotify"
  | "files"
  | "form"
  | "crypto";

export const LINK_CATEGORIES: {
  key: LinkCategory;
  title: string;
  href: string; // target route (sub-page)
  icon: React.ElementType;
  hint?: string;
}[] = [
  {
    key: "contact",
    title: "Contact",
    href: "/connect/links/contact",
    icon: AtSignIcon,
  },
  {
    key: "links",
    title: "Links",
    href: "/connect/links/links",
    icon: LinkIcon,
  },
  {
    key: "video",
    title: "Video",
    href: "/connect/links/video",
    icon: VideoIcon,
  },
  {
    key: "socials",
    title: "Socials",
    href: "/connect/links/socials",
    icon: UsersIcon,
  },
  {
    key: "meetings",
    title: "Meetings",
    href: "/connect/links/meetings",
    icon: CalendarIcon,
    hint: "Calendly/Google",
  },
  {
    key: "appointments",
    title: "Appointments",
    href: "/connect/links/appointments",
    icon: CalendarIcon,
  },
  {
    key: "spotify",
    title: "Spotify",
    href: "/connect/links/spotify",
    icon: Music2Icon,
  },
  {
    key: "files",
    title: "Files",
    href: "/connect/links/files",
    icon: FolderOpenIcon,
  },
  {
    key: "form",
    title: "Form",
    href: "/connect/links/form",
    icon: FileTextIcon,
  },
  {
    key: "crypto",
    title: "Crypto Wallet",
    href: "/connect/links/crypto",
    icon: WalletIcon,
  },
];

// (Later) you’ll map each key to its backend endpoints.
// e.g. socials -> POST /api/social/add, meetings -> POST /api/meeting/add, etc.
