"use client";

import AppointmentListSkeleton from "@/components/shared/skeleton/link-list-skeleton";
import AppointmentCard from "./connect-appointment-card";

export default function AppointmentList({
  appointments,
  loading,
  profileId,
  accessToken,
  onUpdated,
  showRestore = false,
  selectionMode = false,
  selectedIds = [],
  toggleSelect,
}: {
  appointments: any;
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectedIds?: string[];
  toggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}) {
  if (loading) return <AppointmentListSkeleton />;

  if (!appointments?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No appointments added yet.
      </div>
    );

  return (
    <div className="space-y-3">
      {appointments.map((a: any) => (
        <AppointmentCard
          key={a.id}
          appointment={a}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          showRestore={showRestore}
          selected={selectedIds.includes(a.id)}
          selectionMode={selectionMode}
          toggleSelect={toggleSelect}
        />
      ))}
    </div>
  );
}
