"use client";

import FileListSkeleton from "@/components/shared/skeleton/FileListSkeleton";
import FileCard from "./connect-files-card";

export default function FileList({
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
  if (loading) return <FileListSkeleton />;

  if (!items?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No files uploaded yet.
      </div>
    );

  return (
    <div className="space-y-3 animate-fadeIn">
      {items.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          showRestore={showRestore}
          selected={selectedIds.includes(file.id)}
          selectionMode={selectionMode}
          toggleSelect={toggleSelect}
        />
      ))}
    </div>
  );
}
