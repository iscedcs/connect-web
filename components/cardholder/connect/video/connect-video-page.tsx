"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import VideoList from "./connect-video-list";
import VideoModal from "./connect-video-modal";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";

interface VideoItem {
  id: string;
  title: string;
  platform: string;
  url: string;
  isVisible: boolean;
  isFeatured: boolean;
  deletedAt?: string | null;
}

export default function VideoPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  //FUTURE-READY ENDPOINTS
  const __DEV_FEATURES = CONNECT_DEV_FEATURES.videos;
  const [videos, setVideos] = useState<{
    active: VideoItem[];
    deleted: VideoItem[];
  }>({
    active: [],
    deleted: [],
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const allowSelection = __DEV_FEATURES.enableBulkActions;

  const selectionMode = allowSelection && selected.length > 0;
  const toggleSelect = (id: string) => {
    if (!allowSelection) return;

    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelected([]);

  const bulkDeleteSelected = async () => {
    if (!__DEV_FEATURES.enableBulkActions) return;

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.videos.bulk_delete.replace("{profileId}", profileId!)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success("All videos deleted");
        clearSelection();
        fetchVideos();
      } else toast.error(json.message ?? "Bulk delete failed");
    } catch {
      toast.error("Bulk delete error");
    }
  };

  const restoreAllVideos = async () => {
    if (!__DEV_FEATURES.enableAllRestoreActions) return;

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.videos.restore_all.replace("{profileId}", profileId!)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success("All videos restored");
        fetchVideos();
      } else toast.error(json.message ?? "Restore all failed");
    } catch {
      toast.error("Restore all error");
    }
  };

  const toggleAllVisibility = async () => {
    if (!__DEV_FEATURES.enableAllVisibilityActions) return;

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.videos.all_visible.replace("{profileId}", profileId!)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success("All videos visibility updated");
        fetchVideos();
      } else toast.error(json.message ?? "Visibility update failed");
    } catch {
      toast.error("All visibility error");
    }
  };

  const fetchVideos = async () => {
    if (!profileId || !accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.videos.all.replace(
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
      const allVideos = json?.data?.videos ?? [];

      // console.log("Fetched Videos:", json);

      const formatted = allVideos.map((v: any) => ({
        id: v.id,
        title: v.title,
        platform: v.platform,
        url: v.url,
        isVisible: v.is_visible,
        isFeatured: v.is_featured,
        deletedAt: v.deletedAt,
      }));

      const activeVideos = formatted.filter((v: any) => !v.deletedAt);
      const deletedVideos = formatted.filter((v: any) => v.deletedAt);

      setVideos({ active: activeVideos, deleted: deletedVideos });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) fetchVideos();
  }, [isAuthed]);

  return (
    <div className="relative">
      {/* -------------- Bulk Toolbar -------------- */}
      {selectionMode && (
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur p-3 border-b border-white/10 flex justify-between items-center">
          <p className="text-white/60 text-sm">{selected.length} selected</p>

          <div className="flex gap-2">
            {__DEV_FEATURES.enableBulkActions && (
              <Button
                size="sm"
                variant="destructive"
                onClick={bulkDeleteSelected}>
                Delete Selected
              </Button>
            )}

            {__DEV_FEATURES.enableAllVisibilityActions && (
              <Button
                size="sm"
                variant="secondary"
                onClick={toggleAllVisibility}>
                Make All Visible
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="text-white/60"
              onClick={clearSelection}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-lg font-medium">Your Videos</h2>
        {!selectionMode && (
          <Button
            className="rounded-full"
            variant="secondary"
            onClick={() => setModalOpen(true)}>
            Add new
          </Button>
        )}
      </div>

      {/* -------------- ACTIVE VIDEOS -------------- */}

      <VideoList
        videos={videos.active}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchVideos}
        selected={allowSelection ? selected : []}
        toggleSelect={allowSelection ? toggleSelect : undefined}
        selectionMode={selectionMode}
      />

      {videos.deleted.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm uppercase tracking-wide">
              Deleted Videos
            </h3>

            {__DEV_FEATURES.enableAllRestoreActions && (
              <Button size="sm" variant="secondary" onClick={restoreAllVideos}>
                Restore All
              </Button>
            )}
          </div>

          <VideoList
            videos={videos.deleted}
            loading={false}
            profileId={profileId!}
            accessToken={accessToken!}
            onUpdated={fetchVideos}
            showRestore
            selected={[]}
          />
        </div>
      )}
      {modalOpen && (
        <VideoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchVideos}
        />
      )}
    </div>
  );
}
