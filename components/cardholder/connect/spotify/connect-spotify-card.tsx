"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleIcon, EditIcon, DeleteIcon } from "@/lib/icons";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";
import SpotifyModal from "./connect-spotify-modal";
import { Spinner } from "@/components/ui/spinner";
import { SpotifyTypeBadge } from "@/lib/getspotifybadgetype";

export default function SpotifyCard({
  spotify,
  profileId,
  accessToken,
  onUpdated,
  showRestore,
  selectionMode,
  selected,
  toggleSelect,
}: {
  spotify: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  toggleSelect?: (id: string) => void;
}) {
  const [visible, setVisible] = useState(spotify.is_visible);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);

  const pressTimer = useRef<any>(null);

  const handleLongPressStart = () => {
    if (!CONNECT_DEV_FEATURES.spotify.enableLongPressSelection) return;

    if (!pressTimer.current) {
      pressTimer.current = setTimeout(() => {
        toggleSelect?.(spotify.id);
      }, 450);
    }
  };

  const handleLongPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const patch = async (endpoint: string, msg: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const json = await res.json();

      if (res.ok) {
        toast.success(msg);
        await onUpdated();
      } else toast.error(json?.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await patch(
      URLS.spotify.delete
        .replace("{profileId}", profileId)
        .replace("{id}", spotify.id),
      "Spotify item deleted"
    );
    setDeleting(false);
  };

  const handleRestore = async () => {
    setRestoring(true);
    await patch(
      URLS.spotify.restore
        .replace("{profileId}", profileId)
        .replace("{id}", spotify.id),
      "Spotify item restored"
    );
    setRestoring(false);
  };

  const handleToggleVisible = async () => {
    const newValue = !visible;
    setVisible(newValue);

    await patch(
      URLS.spotify.visible
        .replace("{profileId}", profileId)
        .replace("{id}", spotify.id),
      newValue ? "Visible" : "Hidden"
    );
  };

  return (
    <div
      className={`bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex justify-between items-center ${
        selected ? "ring-2 ring-primary/70" : ""
      }`}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}>
      {/* LEFT SIDE */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => selectionMode && toggleSelect?.(spotify.id)}>
        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
          <img
            src={getFaviconFromUrl(spotify.externalUrl)}
            className="w-6 h-6 rounded"
            alt="icon"
          />
        </div>

        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate flex items-center gap-2">
            {spotify.title} <SpotifyTypeBadge type={spotify.type} />
          </p>
          <p className="text-xs text-white/50 truncate max-w-[180px] block">
            {spotify.externalUrl}
          </p>
          {selected && <p className="text-xs text-background">Selected</p>}
        </div>
      </div>

      {/* RIGHT SIDE */}
      {!showRestore ? (
        <div className="flex items-center gap-3">
          {!selectionMode && (
            <>
              <ToggleIcon
                checked={visible}
                onCheckedChange={handleToggleVisible}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditOpen(true)}>
                <EditIcon className="w-4 h-4 text-white/70" />
              </Button>

              <Button variant="ghost" size="icon" onClick={handleDelete}>
                {isDeleting ? (
                  <Spinner />
                ) : (
                  <DeleteIcon className="w-4 h-4 text-white/60" />
                )}
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={handleRestore}>
          {isRestoring ? <Spinner /> : "Restore"}
        </Button>
      )}

      {editOpen && (
        <SpotifyModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          spotify={spotify}
        />
      )}
    </div>
  );
}
