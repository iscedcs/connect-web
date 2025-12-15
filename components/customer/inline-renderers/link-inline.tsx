"use client";

import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";

export default function LinkInline({ item }: { item: any }) {
  return (
    <div className="mt-4 rounded-xl bg-[#0f0f0f] border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <img
          src={getFaviconFromUrl(item.url, 64)}
          className="w-8 h-8 rounded-full"
        />

        <div className="flex-1">
          <p className="text-sm font-medium">{item.title}</p>
          {/* <p className="text-xs text-white/50 truncate">{item.url}</p> */}
        </div>
      </div>

      <a
        href={item.url}
        target="_blank"
        className="mt-3 inline-block text-xs text-white/60 underline">
        <button className="rounded-lg bg-white text-black font-bold px-4 py-2">
          Open link
        </button>
      </a>
    </div>
  );
}
