"use client";

import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";
import Link from "next/link";

export default function LinkInline({
  item,
  deviceId,
}: {
  item: any;
  deviceId: string;
}) {
  const isForm = item.url?.startsWith("/forms/");
  const resolvedUrl = isForm ? `/customer/${deviceId}${item.url}` : item.url;
  return (
    <div className="mt-4 rounded-xl bg-[#0f0f0f] border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <img
          src={
            getFaviconFromUrl(item.url, 64) || "/assets/forms_2020q4_48dp.png"
          }
          className="w-8 h-8 rounded-full"
        />

        <div className="flex-1">
          <p className="text-sm font-medium">{item.title}</p>
          {isForm && <p className="text-xs text-white/50">Public form</p>}
          {/* <p className="text-xs text-white/50 truncate">{item.url}</p> */}
        </div>
      </div>

      {isForm ? (
        <Link
          href={resolvedUrl}
          className="mt-3 inline-block rounded-lg bg-white text-black font-bold px-4 py-2 text-xs">
          Open form
        </Link>
      ) : (
        <Link
          href={resolvedUrl}
          className="mt-3 inline-block rounded-lg bg-white text-black font-bold px-4 py-2 text-xs">
          Open link
        </Link>
      )}
    </div>
  );
}
