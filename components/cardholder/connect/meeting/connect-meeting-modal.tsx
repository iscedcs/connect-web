"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleIcon } from "@/lib/icons";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import {
  detectMeetingProvider,
  providerLabel,
  MeetingProvider,
} from "@/lib/connect-meetings/providers";

export default function MeetingModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
  meeting,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  meeting?: any;
}) {
  const isEdit = !!meeting;

  const [url, setUrl] = useState(meeting?.url ?? "");
  const [provider, setProvider] = useState<MeetingProvider>(
    detectMeetingProvider(meeting?.url ?? "")
  );
  const [label, setLabel] = useState(meeting?.label ?? providerLabel(provider));
  const [userEditedLabel, setUserEditedLabel] = useState(false);

  const [visible, setVisible] = useState(meeting?.isVisible ?? true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const detected = detectMeetingProvider(url);
    setProvider(detected);

    // Only auto-update label if user hasn't manually typed
    if (!userEditedLabel) {
      setLabel(providerLabel(detected));
    }
  }, [url]);

  if (!open) return null;

  const submit = async () => {
    if (!url.trim()) return toast.error("URL is required");

    setLoading(true);

    const endpoint = isEdit
      ? URLS.meetings.update
          .replace("{profileId}", profileId)
          .replace("{id}", meeting.id)
      : URLS.meetings.add.replace("{profileId}", profileId);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
      {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          label,
          provider,
          is_visible: visible,
        }),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      toast.error(json?.message ?? "Error saving");
      setLoading(false);
      return;
    }

    toast.success(isEdit ? "Meeting updated" : "Meeting added");

    setLoading(false);
    onClose();
    await onUpdated();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      style={{ animation: "modalFade .25s ease" }}>
      <div className="bg-neutral-900 p-6 rounded-xl w-[90%] max-w-md border border-white/10 space-y-4 animate-modalScale">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Meeting" : "Add Meeting Link"}
        </h2>

        {/* URL */}
        <div>
          <label className="text-sm text-white/70">Meeting URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://meet.google.com/xyz-1234"
            className="mt-1 bg-neutral-800 text-white border-white/10"
          />
        </div>

        {/* Label */}
        <div>
          <label className="text-sm text-white/70">Label</label>
          <Input
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setUserEditedLabel(true);
            }}
            className="mt-1 bg-neutral-800 text-white border-white/10"
            placeholder="Google Meet"
          />
        </div>

        {/* Visible Toggle */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-white/70">Visible on profile</span>
          <ToggleIcon checked={visible} onCheckedChange={setVisible} />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <Spinner className="w-5 h-5" /> Saving...
              </>
            ) : isEdit ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
