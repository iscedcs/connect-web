"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SpotifyListSkeleton() {
  return (
    <div className="space-y-3 py-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="
            bg-neutral-900/60 border border-white/10 rounded-xl p-4
            grid justify-between items-center
            animate-pulse
          ">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">
            {/* Spotify icon */}
            <Skeleton className="w-10 h-10 rounded-full" />

            <div className="flex flex-col gap-2 min-w-0">
              {/* Title + badge */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>

              {/* URL */}
              <Skeleton className="h-3 w-56" />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 pt-3 md:pt-0">
            {/* Toggle */}
            <Skeleton className="w-8 h-8 rounded-full" />

            {/* Edit */}
            <Skeleton className="w-8 h-8 rounded-md" />

            {/* Delete */}
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
