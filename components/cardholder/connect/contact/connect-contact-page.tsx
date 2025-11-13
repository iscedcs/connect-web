"use client";

import { Button } from "@/components/ui/button";
import { URLS } from "@/lib/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ContactList from "./connect-contact-list";
import ContactModal from "./connect-contact-modal";

interface Contact {
  id: string;
  type: string;
  value: string;
  isPrimary?: boolean;
}

export default function ContactPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  const [contacts, setContacts] = useState<{
    active: Contact[];
    deleted: Contact[];
  }>({
    active: [],
    deleted: [],
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchContacts = async () => {
    if (!profileId || !accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.profile_contact.all.replace(
          "{profileId}",
          profileId
        )}?page=1&per_page=25&include_deleted=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const json = await res.json();
      const all = json?.data?.contacts ?? [];

      const formatted = all.map((c: any) => ({
        id: c.id,
        type: "PHONE",
        value: c.phone_number,
        label: c.label,
        isPrimary: c.is_primary,
        isVisible: c.is_visible,
        deletedAt: c.deletedAt,
      }));

      const activeContacts = formatted.filter((c: any) => !c.deletedAt);
      const deletedContacts = formatted.filter((c: any) => c.deletedAt);
      setContacts({ active: activeContacts, deleted: deletedContacts });
    } catch (err) {
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) fetchContacts();
  }, [isAuthed]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Your Contacts</h2>
        <Button
          className="rounded-full"
          variant="secondary"
          onClick={() => setModalOpen(true)}>
          Add new
        </Button>
      </div>

      <ContactList
        contacts={contacts.active}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchContacts}
      />

      {contacts.deleted.length > 0 && (
        <div className="mt-10 border-t border-white/10 pt-5">
          <h3 className="text-sm font-semibold mb-3 text-white/70">
            Deleted Contacts
          </h3>
          <ContactList
            contacts={contacts.deleted}
            loading={false}
            profileId={profileId!}
            accessToken={accessToken!}
            onUpdated={fetchContacts}
            showRestore
          />
        </div>
      )}

      {modalOpen && (
        <ContactModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchContacts}
        />
      )}
    </div>
  );
}
