"use client";

import { Loader2 } from "lucide-react";
import LinkCard from "./connect-links-card";
import LinkListSkeleton from "@/components/shared/skeleton/link-list-skeleton";

export default function LinkList({
  links,
  loading,
  profileId,
  accessToken,
  onUpdated,
}: {
  links: any[];
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
}) {
  if (loading) return <LinkListSkeleton />;

  if (!links?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No links yet. Click <strong>Add new</strong> to get started.
      </div>
    );

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  );
}
