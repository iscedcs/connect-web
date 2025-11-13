"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ContactListSkeleton() {
  return (
    <div className="space-y-3 py-6">
      {/* Repeat 3–5 cards to simulate loading contacts */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 space-y-3 animate-pulse">
          {/* Top section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="w-6 h-6 rounded-md" />
          </div>

          {/* Bottom toggle section */}
          <div className="flex justify-between items-center border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
