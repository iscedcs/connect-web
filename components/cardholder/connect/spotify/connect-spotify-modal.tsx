"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleIcon } from "@/lib/icons";
import { Spinner } from "@/components/ui/spinner";
import { URLS } from "@/lib/const";
import { toast } from "sonner";
import {
  detectSpotifyType,
  SpotifyType,
} from "@/lib/connect-spotify/detect-type";
import { fetchSpotifyMetadata } from "@/lib/autofetch-metadata";

export default function SpotifyModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
  spotify,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  spotify?: any;
}) {
  const isEdit = !!spotify;

  const [url, setUrl] = useState(spotify?.external_url ?? "");
  const [title, setTitle] = useState(spotify?.title ?? "");
  const [type, setType] = useState<SpotifyType>(spotify?.type ?? "other");
  const [visible, setVisible] = useState(spotify?.is_visible ?? true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!url) return;
      const detected = detectSpotifyType(url);
      setType(detected);

      const meta = await fetchSpotifyMetadata(url);
      if (meta?.title && !title) {
        setTitle(meta.title);
      }
    };
    load();
  }, [url]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!url.trim()) return toast.error("A valid Spotify URL is required!");

    setLoading(true);

    try {
      const endpoint = isEdit
        ? URLS.spotify.update
            .replace("{profileId}", profileId)
            .replace("{id}", spotify.id)
        : URLS.spotify.add.replace("{profileId}", profileId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            external_url: url,
            title: title || type.toUpperCase(),
            is_visible: visible,
            order: spotify?.order ?? 1,
          }),
        }
      );

      const json = await res.json();

      if (res.ok) {
        toast.success(
          isEdit ? "Spotify item updated successfully!" : "Spotify item added!"
        );
        onClose();
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Something went wrong.");
      }
    } catch {
      toast.error("Error saving Spotify item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-[90%] max-w-md space-y-4">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Spotify Item" : "Add Spotify Item"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Spotify URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Playlist"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
            <div>
              <label className="text-sm text-white/70">Detected Type</label>
              <Input
                value={type}
                disabled
                className="mt-1 bg-neutral-800 text-white border-white/10 opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-white/70">Visible</span>
            <ToggleIcon checked={visible} onCheckedChange={setVisible} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner className="size-6" /> Saving...
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
