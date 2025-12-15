"use client";

import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";

export default function InstagramInline({ url }: { url: string }) {
  return (
    <div className="mt-4 rounded-xl bg-[#0f0f0f] border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <img
          src={getFaviconFromUrl(url, 64)}
          className="w-8 h-8 rounded-full"
        />

        <div className="flex-1">
          <p className="text-sm font-medium">Instagram Post</p>
          <p className="text-xs text-white/50 truncate">{url}</p>
        </div>
      </div>

      <a
        href={url}
        target="_blank"
        className="mt-4 inline-block text-sm text-white underline">
        View on Instagram
      </a>
    </div>
  );
}
