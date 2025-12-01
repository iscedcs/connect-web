"use client";

import SubmissionCard from "./submission-card";
import LinkListSkeleton from "@/components/shared/skeleton/link-list-skeleton";

export default function SubmissionList({
  items,
  loading,
  onView,
  onDelete,
}: any) {
  if (loading) return <LinkListSkeleton />;

  if (!items?.length)
    return (
      <div className="text-center text-white/50 py-20">No submissions yet.</div>
    );

  return (
    <div className="space-y-3 animate-fadeIn">
      {items.map((submission: any) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
