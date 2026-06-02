"use client";

import {
  Share2,
  Link as LinkIcon,
  BarChart2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardQuickActionsProps {
  slug: string | null;
}

export default function DashboardQuickActions({
  slug,
}: DashboardQuickActionsProps) {
  const cardUrl = slug ? `${window?.location?.origin ?? ""}/p/${slug}` : null;

  async function handleShare() {
    if (!cardUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "My ISCE Connect Card",
          url: cardUrl,
        });
      } else {
        await navigator.clipboard.writeText(cardUrl);
        toast.success("Card link copied to clipboard");
      }
    } catch {
      // user cancelled share — do nothing
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Primary action */}
      <button
        onClick={handleShare}
        disabled={!slug}
        className="flex items-center gap-2 rounded-xl bg-white text-black font-medium disabled:opacity-35 disabled:cursor-not-allowed px-4 py-2.5 text-sm transition-all hover:bg-white/90 active:scale-95"
      >
        <Share2 className="size-3.5" />
        Share Card
      </button>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Secondary actions */}
      <Link
        href="/connect/links"
        className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 px-4 py-2.5 text-sm text-white/80 transition-all hover:text-white active:scale-95"
      >
        <LinkIcon className="size-3.5" />
        Add Link
      </Link>

      <Link
        href="/analytics"
        className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 px-4 py-2.5 text-sm text-white/80 transition-all hover:text-white active:scale-95"
      >
        <BarChart2 className="size-3.5" />
        Analytics
      </Link>

      {slug && (
        <Link
          href={`/p/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 px-4 py-2.5 text-sm text-white/80 transition-all hover:text-white active:scale-95"
        >
          <ExternalLink className="size-3.5" />
          View Card
        </Link>
      )}
    </div>
  );
}
