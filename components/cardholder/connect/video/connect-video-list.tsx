"use client";

import { Loader2 } from "lucide-react";
import VideoCard from "./connect-video-card";
import VideoListSkeleton from "@/components/shared/skeleton/video-list-skeleton";

export default function VideoList({
  videos,
  loading,
  profileId,
  accessToken,
  onUpdated,
  showRestore = false,

  selected = [],
  toggleSelect,
  selectionMode = false,
}: {
  videos: any[];
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selected?: string[];
  toggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}) {
  if (loading) return <VideoListSkeleton />;

  if (!videos?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No videos yet. Click <strong>Add new</strong> to get started.
      </div>
    );

  return (
    <div className="space-y-3">
      {videos.map((v) => (
        <VideoCard
          key={v.id}
          video={v}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          showRestore={showRestore}
          selected={selected.includes(v.id)}
          toggleSelect={toggleSelect}
          selectionMode={selectionMode}
        />
      ))}
    </div>
  );
}
