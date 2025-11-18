"use client";

import MeetingListSkeleton from "@/components/shared/skeleton/link-list-skeleton";
import MeetingCard from "./connect-meeting-card";

export default function MeetingList({
  meetings,
  loading,
  profileId,
  accessToken,
  onUpdated,
  showRestore = false,
  selectionMode = false,
  selectedIds = [],
  toggleSelect,
  setDefaultMeeting,
}: {
  meetings: any[];
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectionMode?: boolean;
  selectedIds?: string[];
  toggleSelect?: (id: string) => void;
  setDefaultMeeting?: (id: string) => Promise<void>;
}) {
  if (loading) return <MeetingListSkeleton />;

  if (!meetings?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No meeting links yet. Click <strong>Add Meeting</strong> to get started.
      </div>
    );

  return (
    <div className="space-y-3">
      {meetings.map((m) => (
        <MeetingCard
          key={m.id}
          meeting={m}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          showRestore={showRestore}
          selectionMode={selectionMode}
          selected={selectedIds.includes(m.id)}
          toggleSelect={toggleSelect}
          setDefaultMeeting={setDefaultMeeting}
        />
      ))}
    </div>
  );
}
