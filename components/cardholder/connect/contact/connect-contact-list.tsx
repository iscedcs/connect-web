"use client";

import ContactListSkeleton from "@/components/shared/skeleton/contact-list-skeleton";
import ContactCard from "./connect-contact-card";

export default function ContactList({
  contacts,
  loading,
  profileId,
  accessToken,
  onUpdated,
  showRestore = false,
}: {
  contacts: any[];
  loading: boolean;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
}) {
  if (loading)
    if (loading) {
      return <ContactListSkeleton />;
    }

  if (!contacts?.length)
    return (
      <div className="text-center text-white/50 py-20">
        No contacts yet. Click <strong>Add new</strong> to get started.
      </div>
    );

  return (
    <div className="space-y-3">
      {contacts.map((c) => (
        <ContactCard
          key={c.id}
          contact={c}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          showRestore={showRestore}
        />
      ))}
    </div>
  );
}
