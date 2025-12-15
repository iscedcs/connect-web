"use client";

import { Button } from "@/components/ui/button";
import { URLS } from "@/lib/const";
import { DeleteIcon, EditIcon, EyesOpenIcon, ToggleIcon } from "@/lib/icons";
import { Eye, Star, Video } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import VideoModal from "./connect-video-modal";
import { Spinner } from "@/components/ui/spinner";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";

export default function VideoCard({
  video,
  profileId,
  accessToken,
  onUpdated,
  showRestore,
  selected = false,
  toggleSelect,
  selectionMode = false,
}: {
  video: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selected?: boolean;
  toggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}) {
  const [visible, setVisible] = useState(video.isVisible);
  const [featured, setFeatured] = useState(video.isFeatured);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const pressTimer = useRef<any>(null);

  const handleLongPressStart = () => {
    if (!CONNECT_DEV_FEATURES.videos.enableLongPressSelection) return;

    if (!pressTimer.current) {
      pressTimer.current = setTimeout(() => {
        toggleSelect?.(video.id);
      }, 450);
    }
  };

  const handleLongPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  // -------------------------------------------------------------
  // ACTIVE ENDPOINTS
  // -------------------------------------------------------------
  const patchRequest = async (
    endpoint: string,
    successMsg: string,
    body: any = {}
  ) => {
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
      if (res.ok) {
        toast.success(json?.message ?? successMsg);
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating video");
    } finally {
      setLoading(false);
    }
  };

  const handleFeature = async () => {
    setFeatured(!featured);
    await patchRequest(
      URLS.videos.feature
        .replace("{profileId}", profileId)
        .replace("{id}", video.id),
      featured ? "Video unfeatured" : "Video featured"
    );
  };

  const handleToggleVisible = async () => {
    const newValue = !visible;
    setVisible(newValue);
    await patchRequest(
      URLS.videos.visible
        .replace("{profileId}", profileId)
        .replace("{id}", video.id),
      "Visibility updated",
      { is_visible: newValue }
    );
  };

  const handleRestore = async () => {
    setRestoring(true);
    await patchRequest(
      URLS.videos.restore
        .replace("{profileId}", profileId)
        .replace("{id}", video.id),
      "Video restored successfully!"
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.videos.delete
          .replace("{profileId}", profileId)
          .replace("{id}", video.id)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Video deleted!");
        await onUpdated();
      } else toast.error(json?.message ?? "Failed to delete");
    } catch {
      toast.error("Error deleting video");
    } finally {
      setLoading(false);
      setDeleting(false);
    }
  };

  return (
    <div
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
      className={`
        relative bg-neutral-900/60 border border-white/10 rounded-xl p-4 cursor-default
        transition-all duration-200
        ${
          selected
            ? "ring-2 ring-primary scale-[0.99]"
            : "hover:bg-neutral-800/50"
        }
      `}>
      {/* CHECKBOX OVERLAY */}
      {selectionMode && (
        <div className="absolute top-3 left-3 w-5 h-5 border border-white/40 rounded bg-black/40 flex items-center justify-center">
          {selected && <div className="w-3 h-3 bg-primary rounded-sm"></div>}
        </div>
      )}{" "}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
            <Video className="w-5 h-5 text-white/80" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium">{video.title}</p>
            <p className="text-xs text-white/50">{video.platform}</p>
            {video.isFeatured && (
              <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Buttons disabled in selection mode */}
        {!showRestore ? (
          <div className="flex items-center gap-2">
            {!selectionMode && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}>
                  <EditIcon className="w-4 h-4 text-white/60" />
                </Button>

                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  {isDeleting ? (
                    <Spinner />
                  ) : (
                    <DeleteIcon className="w-4 h-4 text-white/60 hover:text-red-400" />
                  )}
                </Button>
              </>
            )}
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={handleRestore}>
            {isRestoring ? <Spinner /> : "Restore"}
          </Button>
        )}
      </div>
      {/* Visibility & Featured toggles */}
      {!showRestore && !selectionMode && (
        <div className="flex justify-between items-center text-xs text-white/60 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2">
            <EyesOpenIcon className="w-4 h-4" />
            <ToggleIcon
              className="w-8 h-8"
              checked={visible}
              onCheckedChange={handleToggleVisible}
            />
            <span>Visible</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${featured ? "text-yellow-400" : ""}`} />
            <ToggleIcon
              className="w-8 h-8"
              checked={featured}
              onCheckedChange={handleFeature}
            />
            <span>Featured</span>
          </div>
        </div>
      )}
      {editOpen && (
        <VideoModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          video={video}
        />
      )}
    </div>
  );
}
