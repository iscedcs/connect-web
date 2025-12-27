"use client";

import SpotifyListSkeleton from "@/components/shared/skeleton/SpotifyListSkeleton";
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
  onEdit,
}: {
  items: any[];
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectedIds?: string[];
  toggleSelect?: (id: string) => void;
  onEdit?: (spotify: any) => void;
  selectionMode?: boolean;
}) {
  if (loading) return <SpotifyListSkeleton />;

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
          onEdit={() => onEdit?.(item)}
        />
      ))}
    </div>
  );
}
