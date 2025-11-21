"use client";

import SpotifyCard from "./connect-spotify-card";
import LinkListSkeleton from "@/components/shared/skeleton/link-list-skeleton";

export default function SpotifyList({
  items,
  loading,
  profileId,
  accessToken,
  onUpdated,
  showRestore = false,
  selectionMode = false,
  selectedIds = [],
  toggleSelect,
}: {
  items: any[];
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectedIds?: string[];
  toggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}) {
  if (loading) return <LinkListSkeleton />;

  if (!items?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No Spotify items yet.
      </div>
    );

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <SpotifyCard
          key={item.id}
          spotify={item}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          showRestore={showRestore}
          selected={selectedIds.includes(item.id)}
          selectionMode={selectionMode}
          toggleSelect={toggleSelect}
        />
      ))}
    </div>
  );
}
