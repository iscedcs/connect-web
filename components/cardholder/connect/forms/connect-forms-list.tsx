"use client";

import LinkListSkeleton from "@/components/shared/skeleton/link-list-skeleton";
import FormCard from "./connect-forms-card";

export default function FormList({
  items,
  loading,
  profileId,
  accessToken,
  onUpdated,
  selected = [],
  showRestore = false,
  selectionMode = false,
  toggleSelect,
  setFormToEdit,
  openModal,
}: {
  items: any;
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selected?: string[];
  setFormToEdit?: any;
  openModal?: any;
  toggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}) {
  if (loading) return <LinkListSkeleton />;

  if (!items?.length)
    return <div className="text-center text-white/50 py-20">No forms yet.</div>;

  return (
    <div className="space-y-3 animate-fadeIn">
      {items.map((form: any) => (
        <FormCard
          key={form.id}
          form={form}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          showRestore={showRestore}
          selected={selected.includes(form.id)}
          selectionMode={selectionMode}
          toggleSelect={toggleSelect}
          setFormToEdit={setFormToEdit}
          openModal={openModal}
        />
      ))}
    </div>
  );
}
