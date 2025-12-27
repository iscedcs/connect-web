"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ContactViewModalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-3 w-48 rounded-md" />
      </div>

      {/* Contact fields */}
      <Skeleton className="h-4 w-56 rounded-md" />
      <Skeleton className="h-4 w-44 rounded-md" />

      {/* Note */}
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-5/6 rounded-md" />

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
