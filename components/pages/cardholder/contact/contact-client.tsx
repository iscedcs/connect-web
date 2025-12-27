"use client";

import { useEffect, useState } from "react";
import ContactCard from "./contact-card";
import ContactViewModal from "./contact-modal";
import {
  fetchReceivedContactStats,
  fetchRecentReceivedContacts,
  searchReceivedContacts,
} from "@/lib/services/contact";
import { Input } from "@/components/ui/input";

export default function ContactsClient({
  data,
  profileId,
  accessToken,
}: {
  data: any;
  profileId: string;
  accessToken: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contacts, setContacts] = useState(data.contacts);
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<"all" | "recent">("all");

  /**  📊 Load stats once */
  useEffect(() => {
    fetchReceivedContactStats({ profileId, accessToken })
      .then(setStats)
      .catch(() => {});
  }, []);

  /**  🔍 Search */
  useEffect(() => {
    if (!query.trim()) {
      setContacts(data.contacts);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await searchReceivedContacts({
        profileId,
        accessToken,
        query,
      });
      setContacts(res.contacts);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  /**🕘 Recent */
  async function loadRecent() {
    const recent = await fetchRecentReceivedContacts({
      profileId,
      accessToken,
    });
    setContacts(recent);
  }

  return (
    <>
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="Total" value={stats.totalContacts} />
          <Stat label="Today" value={stats.todayContacts} />
          <Stat label="This Week" value={stats.thisWeekContacts} />
          <Stat label="With Notes" value={stats.contactsWithNotes} />
        </div>
      )}

      <Input
        placeholder="Search contacts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-neutral-900 text-white border-white/10 mb-3"
      />

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            setTab("all");
            setContacts(data.contacts);
          }}
          className={tab === "all" ? "font-bold" : "opacity-50"}>
          All
        </button>

        <button
          onClick={() => {
            setTab("recent");
            loadRecent();
          }}
          className={tab === "recent" ? "font-bold" : "opacity-50"}>
          Recent
        </button>
      </div>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-white/40">No contacts found</p>
        ) : (
          contacts.map((contact: any) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => setActiveId(contact.id)}
            />
          ))
        )}
      </div>

      {activeId && (
        <ContactViewModal
          open
          contactId={activeId}
          profileId={profileId}
          accessToken={accessToken}
          onClose={() => setActiveId(null)}
          onDeleted={() => setActiveId(null)}
        />
      )}
    </>
  );
}
/* Small stat card */
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
