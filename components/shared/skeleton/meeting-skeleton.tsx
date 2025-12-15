"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingListSkeleton() {
  return (
    <div className="space-y-3 py-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="
            bg-neutral-900/60 border border-white/10 rounded-xl p-4
            flex justify-between items-center
            animate-pulse
          ">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Provider icon */}
            <Skeleton className="w-10 h-10 rounded-full" />

            <div className="flex flex-col gap-2 min-w-0">
              {/* Meeting label */}
              <Skeleton className="h-4 w-36 rounded-md" />

              {/* Meeting URL */}
              <Skeleton className="h-3 w-48 rounded-md" />

              {/* Default badge placeholder */}
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {/* Visibility toggle */}
            <Skeleton className="w-8 h-8 rounded-full" />

            {/* Default star */}
            <Skeleton className="w-8 h-8 rounded-md" />

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
