"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { URLS } from "@/lib/const";
import { DeleteIcon, EditIcon, ToggleIcon } from "@/lib/icons";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { getFileIcon } from "@/lib/connect-files/get-file-icon";
import { DownloadIcon } from "lucide-react";
import FilesModal from "./connect-files-modal";
import { useAnimation, useMotionValue } from "framer-motion";

export default function FileCard({
  file,
  profileId,
  accessToken,
  onUpdated,
  showRestore,
  selectionMode,
  selected,
  toggleSelect,
}: {
  file: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  toggleSelect?: (id: string) => void;
}) {
  const [visible, setVisible] = useState(file.is_visible);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const deleteThreshold = -120;
  const pressTimer = useRef<any>(null);

  const handleDragEnd = async (_: any, info: any) => {
    if (info.offset.x < deleteThreshold) {
      await controls.start({
        x: -180,
        transition: { type: "spring", stiffness: 300 },
      });
    } else {
      controls.start({ x: 0, transition: { type: "spring" } });
    }
  };

  const handleLongPressStart = () => {
    if (!CONNECT_DEV_FEATURES.files.enableLongPressSelection) return;

    if (!pressTimer.current) {
      pressTimer.current = setTimeout(() => {
        toggleSelect?.(file.id);
      }, 450);
    }
  };

  const handleLongPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const patch = async (endpoint: string, msg: string, body: any = {}) => {
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
        toast.success(msg);
        await onUpdated();
      } else toast.error(json?.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  };
  const handleToggleVisible = async () => {
    const newValue = !visible;
    setVisible(newValue);

    await patch(
      URLS.files.visible
        .replace("{profileId}", profileId)
        .replace("{id}", file.id),
      newValue ? "Visible" : "Hidden",
      { is_visible: newValue }
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    await patch(
      URLS.files.delete
        .replace("{profileId}", profileId)
        .replace("{id}", file.id),
      "File deleted"
    );
    setDeleting(false);
  };

  const handleRestore = async () => {
    setRestoring(true);
    await patch(
      URLS.files.restore
        .replace("{profileId}", profileId)
        .replace("{id}", file.id),
      "File restored"
    );
    setRestoring(false);
  };

  const handleDownload = () => {
    if (!CONNECT_DEV_FEATURES.files.enableDownload) return;
    window.open(file.spaces_url, "_blank");
  };

  const handlePermanentDelete = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.files.permanent_delete
        .replace("{profileId}", profileId!)
        .replace("{id}", file.id)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    toast.success("File permanently deleted");
    setLoading(false);
  };

  return (
    <div
      className={`
    bg-neutral-900/60 border border-white/10 rounded-xl p-4 
    flex justify-between items-center 
    transition-all duration-200 
    hover:bg-neutral-900 hover:shadow-lg
    hover:scale-[1.05] hover:border-white/20 hover:-translate-y-[2px] hover:shadow-black/30
    ${selected ? "ring-2 ring-primary/70" : ""}
  `}
      style={{
        animation: "fadeSlideIn 0.35s ease forwards",
        opacity: 0,
      }}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}>
      {/* LEFT */}
      <div
        className="flex items-center gap-3 min-w-0 cursor-pointer"
        onClick={() => selectionMode && toggleSelect?.(file.id)}>
        <div
          className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center shrink-0
        transition-all duration-200 hover:scale-[1.05]">
          {getFileIcon(file.media_type)}
        </div>

        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{file.filename}</p>
          <p className="text-xs text-white/50 truncate ">
            {(file.size_bytes / 1024 / 1024).toFixed(2)} MB
          </p>

          {selected && (
            <p className="text-[10px] text-background mt-1">Selected</p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      {!showRestore ? (
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {!selectionMode && (
            <>
              {CONNECT_DEV_FEATURES.files.enableDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="w-8 h-8">
                  <DownloadIcon className="w-4 h-4 text-white/70" />
                </Button>
              )}

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
        <div className="flex flex-col items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleRestore}>
            {isRestoring ? <Spinner /> : "Restore"}
          </Button>
          {CONNECT_DEV_FEATURES.files.enablePermanentDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handlePermanentDelete}>
              Delete Permanently
            </Button>
          )}
        </div>
      )}

      {editOpen && (
        <FilesModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          fileItem={file}
        />
      )}
    </div>
  );
}
