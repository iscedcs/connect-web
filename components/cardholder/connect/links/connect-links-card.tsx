"use client";

import { Globe, Trash2, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { URLS } from "@/lib/const";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import LinkModal from "./connect-links-modal";
import { DeleteIcon, EditIcon, ToggleIcon } from "@/lib/icons";
import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";

export default function LinkCard({
  link,
  profileId,
  accessToken,
  onUpdated,
  showRestore,
  selectionMode,
  selected,
  toggleSelect,
}: {
  link: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;

  selectionMode?: boolean;
  selected?: boolean;
  toggleSelect?: (id: string) => void;
}) {
  const [visible, setVisible] = useState(link.isVisible);
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const pressTimer = useRef<any>(null);

  const handleLongPressStart = () => {
    if (!CONNECT_DEV_FEATURES.links.enableLongPressSelection) return;
    if (!pressTimer.current) {
      pressTimer.current = setTimeout(() => {
        toggleSelect?.(link.id);
      }, 450);
    }
  };

  const handleLongPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const patchRequest = async (endpoint: string, successMsg: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({}),
        }
      );
      const json = await res.json();

      if (res.ok) {
        toast.success(json?.message ?? successMsg);
        await onUpdated();
      } else toast.error(json?.message ?? "Update failed");
    } catch {
      toast.error("Error updating link");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.links.delete
          .replace("{profileId}", profileId)
          .replace("{id}", link.id)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success("Link deleted");
        await onUpdated();
      } else toast.error(json?.message ?? "Failed to delete");
    } catch {
      toast.error("Error deleting link");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    await patchRequest(
      URLS.links.restore
        .replace("{profileId}", profileId)
        .replace("{id}", link.id),
      "Link restored"
    );
  };

  const handleToggleVisible = async () => {
    setVisible(!visible);
    await patchRequest(
      URLS.links.visible
        .replace("{profileId}", profileId)
        .replace("{id}", link.id),
      "Visibility updated"
    );
  };

  return (
    <div
      className={`bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex justify-between items-center ${
        selected ? "ring-2 ring-primary/70" : ""
      }`}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}>
      {" "}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => selectionMode && toggleSelect?.(link.id)}>
        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
          <img
            src={getFaviconFromUrl(link.url)}
            className="w-6 h-6 rounded"
            alt="icon"
          />
        </div>

        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{link.title}</p>
          <p className="text-xs text-white/50 truncate max-w-[180px] block">
            {link.url}
          </p>
          {selected && <p className="text-xs text-background mt-1">Selected</p>}
        </div>
      </div>
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
                disabled={loading}
                onClick={() => setEditOpen(true)}>
                <EditIcon className="w-4 h-4 text-white/70" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                disabled={loading}
                onClick={handleDelete}>
                <DeleteIcon className="w-4 h-4 text-white/60" />
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRestore}
          disabled={loading}>
          Restore
        </Button>
      )}
      {editOpen && (
        <LinkModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          link={link}
        />
      )}
    </div>
  );
}
