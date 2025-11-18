"use client";

import { Button } from "@/components/ui/button";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";
import { URLS } from "@/lib/const";
import { DeleteIcon, EditIcon, ToggleIcon } from "@/lib/icons";
import { useRef, useState } from "react";
import { toast } from "sonner";
import SocialModal from "./connect-social-modal";
import { Spinner } from "@/components/ui/spinner";

export default function SocialCard({
  social,
  profileId,
  accessToken,
  onUpdated,
  showRestore,
  selectionMode,
  selected,
  toggleSelect,
}: {
  social: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;

  selectionMode?: boolean;
  selected?: boolean;
  toggleSelect?: (id: string) => void;
}) {
  const [visible, setVisible] = useState(social.isVisible);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setDeleteing] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const [isToggling, setToggling] = useState(false);

  const pressTimer = useRef<any>(null);

  const handleLongPressStart = () => {
    if (!CONNECT_DEV_FEATURES.social.enableLongPressSelection) return;
    if (!pressTimer.current) {
      pressTimer.current = setTimeout(() => {
        toggleSelect?.(social.id);
      }, 450);
    }
  };
  const handleLongPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const patchRequest = async (endpoint: string, message: string) => {
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
        toast.success(message);
        await onUpdated();
      } else toast.error(json?.message ?? "Update failed");
    } catch {
      toast.error("Error updating social link");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteing(true);
      await patchRequest(
        URLS.profile_social.delete
          .replace("{profileId}", profileId)
          .replace("{id}", social.id),
        "Your Social has been deleted successfully!🥺"
      );
    } finally {
      setDeleteing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      await patchRequest(
        URLS.profile_social.restore
          .replace("{profileId}", profileId)
          .replace("{id}", social.id),
        "Yeepy! Your Social has been restored successfully!🫣🫣"
      );
    } finally {
      setRestoring(false);
    }
  };

  //DO
  const handleToggleVisible = async () => {
    setVisible(!visible);
    await patchRequest(
      URLS.profile_social.visible
        .replace("{profileId}", profileId)
        .replace("{id}", social.id),
      "Wooh!!😋 You've enabled visibility for all!!🎉🎉"
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
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => selectionMode && toggleSelect?.(social.id)}>
        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
          <img
            src={getFaviconFromUrl(social.value)}
            className="w-6 h-6 rounded"
            alt="icon"
          />{" "}
        </div>

        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{social.label}</p>
          <p className="text-xs text-white/50 truncate max-w-[180px] block">
            {social.value}
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
                onClick={() => setEditOpen(true)}>
                <EditIcon className="w-4 h-4 text-white/70" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent cursor-pointer"
                onClick={handleDelete}>
                {isDeleting ? (
                  <Spinner />
                ) : (
                  <DeleteIcon className="w-4 h-4 text-white/60 " />
                )}
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          {isRestoring ? (
            <Spinner />
          ) : (
            <Button variant="secondary" size="sm" onClick={handleRestore}>
              Restore
            </Button>
          )}
        </>
      )}

      {editOpen && (
        <SocialModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          social={social}
        />
      )}
    </div>
  );
}
