"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";

import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { DeleteIcon, EyesOpenIcon } from "@/lib/icons";
import { XSquare } from "lucide-react";
import {
  detectMeetingProvider,
  MeetingProvider,
} from "@/lib/connect-meetings/providers";
import MeetingList from "./connect-meeting-list";
import MeetingModal from "./connect-meeting-modal";

interface MeetingItem {
  id: string;
  url: string;
  label: string;
  provider: MeetingProvider;
  isVisible: boolean;
  isDefault: boolean;
  deletedAt?: string | null;
}

export default function MeetingPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  const [meetings, setMeetings] = useState<{
    active: MeetingItem[];
    deleted: MeetingItem[];
  }>({ active: [], deleted: [] });

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const selectionMode =
    CONNECT_DEV_FEATURES.meetings.enableLongPressSelection &&
    selected.length > 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelected([]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.meetings.all.replace(
          "{profileId}",
          profileId!
        )}?include_deleted=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const json = await res.json();

      const formatted = (json?.data?.meetings ?? []).map((m: any) => ({
        id: m.id,
        url: m.url,
        label: m.label,
        provider: detectMeetingProvider(m.url),
        isVisible: m.is_visible,
        isDefault: m.is_default,
        deletedAt: m.deletedAt,
      }));

      setMeetings({
        active: formatted.filter((x: any) => !x.deletedAt),
        deleted: formatted.filter((x: any) => x.deletedAt),
      });
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const setDefaultMeeting = async (id: string): Promise<void> => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.meetings.default
          .replace("{profileId}", profileId!)
          .replace("{id}", id)}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        toast.error("Failed");
        return;
      }

      // OPTION A — update UI instantly
      setMeetings((prev) => ({
        active: prev.active.map((m) => ({
          ...m,
          isDefault: m.id === id,
        })),
        deleted: prev.deleted,
      }));

      toast.success("Default meeting set");

      fetchMeetings();
    } catch {
      toast.error("Error setting default meeting");
    }
  };

  const bulkDelete = async () => {
    for (const id of selected) {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.meetings.delete
          .replace("{profileId}", profileId!)
          .replace("{id}", id)}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }
    toast.success("Deleted");
    clearSelection();
    fetchMeetings();
  };

  const restoreAll = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.meetings.restore_all.replace("{profileId}", profileId!)}`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    toast.success("Restored");
    fetchMeetings();
  };

  useEffect(() => {
    if (isAuthed) fetchMeetings();
  }, [isAuthed]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Your Meeting Links</h2>
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          Add Meeting
        </Button>
      </div>

      {selectionMode && (
        <div className="mb-4 flex gap-3 items-center bg-primary/10 p-3 rounded-xl">
          <span className="text-background">{selected.length} selected</span>

          {CONNECT_DEV_FEATURES.meetings.enableBulkActions && (
            <Button size="sm" variant="default" onClick={bulkDelete}>
              <DeleteIcon className="w-4 h-4 mr-1" /> Delete Selected
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <XSquare className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      )}

      <MeetingList
        meetings={meetings.active}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchMeetings}
        selectionMode={selectionMode}
        selectedIds={selected}
        toggleSelect={toggleSelect}
        setDefaultMeeting={setDefaultMeeting}
      />

      {meetings.deleted.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm text-white/60 uppercase">Deleted</h3>

            {CONNECT_DEV_FEATURES.meetings.enableAllRestoreActions && (
              <Button size="sm" variant="secondary" onClick={restoreAll}>
                Restore All
              </Button>
            )}
          </div>

          <MeetingList
            meetings={meetings.deleted}
            loading={false}
            profileId={profileId!}
            accessToken={accessToken!}
            onUpdated={fetchMeetings}
            showRestore
          />
        </div>
      )}

      {modalOpen && (
        <MeetingModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchMeetings}
        />
      )}
    </div>
  );
}
