"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function LinkListSkeleton() {
  return (
    <div className="space-y-3 py-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex justify-between items-center animate-pulse">
          {/* Left side: icon + link text */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>

          {/* Right side: toggle + delete */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-10 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
