"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function FileListSkeleton() {
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
          {/* LEFT SECTION */}
          <div className="flex items-center gap-3">
            {/* File Icon Box */}
            <Skeleton className="w-10 h-10 rounded-xl" />

            {/* Filename + size */}
            <div className="flex flex-col space-y-2 min-w-0">
              <Skeleton className="h-4 w-44 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3">
            {/* Download */}
            {/* <Skeleton className="w-8 h-8 rounded-md" /> */}

            {/* Visible Toggle (circular) */}
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
