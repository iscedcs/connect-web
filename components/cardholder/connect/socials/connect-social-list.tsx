"use client";

import SocialListSkeleton from "@/components/shared/skeleton/link-list-skeleton";
import SocialCard from "./connect-social-card";

export default function SocialList({
  socials,
  loading,
  profileId,
  accessToken,
  onUpdated,
  showRestore = false,
  selectionMode = false,
  selectedIds = [],
  toggleSelect,
}: {
  socials: any[];
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectionMode?: boolean;
  selectedIds?: string[];
  toggleSelect?: (id: string) => void;
}) {
  if (loading) return <SocialListSkeleton />;

  if (!socials?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No social links yet. Click <strong>Add new</strong> to get started.
      </div>
    );

  return (
    <div className="space-y-3">
      {socials.map((s) => (
        <SocialCard
          key={s.id}
          social={s}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          showRestore={showRestore}
          selectionMode={selectionMode}
          selected={selectedIds.includes(s.id)}
          toggleSelect={toggleSelect}
        />
      ))}
    </div>
  );
}
