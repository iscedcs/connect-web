"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteIcon, EditIcon, ToggleIcon } from "@/lib/icons";
import { ProviderIcon } from "@/lib/connect-meetings/provider-icons";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import MeetingModal from "./connect-meeting-modal";

export default function MeetingCard({
  meeting,
  profileId,
  accessToken,
  onUpdated,
  showRestore,
  selectionMode,
  selected,
  toggleSelect,
  setDefaultMeeting,
}: {
  meeting: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;

  selectionMode?: boolean;
  selected?: boolean;
  toggleSelect?: (id: string) => void;

  setDefaultMeeting?: (id: string) => Promise<void>;
}) {
  const [visible, setVisible] = useState(meeting.isVisible);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pressTimer = useRef<any>(null);

  const longPressStart = () => {
    if (!CONNECT_DEV_FEATURES.meetings.enableLongPressSelection) return;
    pressTimer.current = setTimeout(() => {
      toggleSelect?.(meeting.id);
    }, 450);
  };
  const longPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const patch = async (endpoint: string, success: string, body: any = {}) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();
      if (!res.ok) return toast.error(json?.message ?? "Error");

      toast.success(success);
      await onUpdated();
    } finally {
      setLoading(false);
    }
  };

  const toggleVisible = async () => {
    const newValue = !visible;
    setVisible(newValue);
    await patch(
      URLS.meetings.visible
        .replace("{profileId}", profileId)
        .replace("{id}", meeting.id),
      "Visibility updated",
      { is_visible: newValue }
    );
  };

  const deleteMeeting = async () => {
    await patch(
      URLS.meetings.delete
        .replace("{profileId}", profileId)
        .replace("{id}", meeting.id),
      "Meeting removed"
    );
  };

  const restoreMeeting = async () => {
    await patch(
      URLS.meetings.restore
        .replace("{profileId}", profileId)
        .replace("{id}", meeting.id),
      "Meeting restored"
    );
  };

  return (
    <div
      className={`bg-neutral-900/60 border border-white/10 rounded-xl p-4 
    flex justify-between items-center 
    transition-all duration-200 
    hover:bg-neutral-900 hover:shadow-lg
    hover:scale-[1.05] hover:border-white/20 hover:-translate-y-[2px] hover:shadow-black/30
    ${selected ? "ring-2 ring-primary/70" : ""}`}
      style={{
        animation: "fadeSlideIn 0.35s ease forwards",
        opacity: 0,
      }}
      onMouseDown={longPressStart}
      onMouseUp={longPressEnd}
      onMouseLeave={longPressEnd}
      onTouchStart={longPressStart}
      onTouchEnd={longPressEnd}>
      <div
        className="flex items-center gap-3 cursor-pointer min-w-0"
        onClick={() => selectionMode && toggleSelect?.(meeting.id)}>
        <div className="w-10 h-10 bg-neutral-800 flex items-center justify-center rounded-full">
          <ProviderIcon provider={meeting.provider} />
        </div>

        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">
            {meeting.label ?? "Meeting"}
          </p>
          <p className="text-xs text-white/50 truncate max-w-[160px]">
            {meeting.url}
          </p>

          {meeting.isDefault && (
            <span className="text-xs text-yellow-400">Default</span>
          )}
        </div>
      </div>

      {!showRestore ? (
        <div className="flex items-center gap-3">
          {!selectionMode && (
            <>
              {/* Visibility */}
              <ToggleIcon
                className="w-8 h-8"
                checked={visible}
                onCheckedChange={toggleVisible}
              />

              {/* Set Default */}
              <Button
                variant="ghost"
                size="icon"
                disabled={loading}
                onClick={() => setDefaultMeeting?.(meeting.id)}>
                ⭐
              </Button>

              {/* Edit */}
              <Button
                variant="ghost"
                size="icon"
                disabled={loading}
                onClick={() => setEditOpen(true)}>
                <EditIcon className="w-4 h-4 text-white/70" />
              </Button>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                disabled={loading}
                onClick={deleteMeeting}>
                <DeleteIcon className="w-4 h-4 text-white/70" />
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={restoreMeeting}>
          Restore
        </Button>
      )}

      {editOpen && (
        <MeetingModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          meeting={meeting}
        />
      )}
    </div>
  );
}
