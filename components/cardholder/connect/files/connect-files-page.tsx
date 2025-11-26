"use client";

import { Button } from "@/components/ui/button";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { URLS } from "@/lib/const";
import { DeleteIcon } from "@/lib/icons";
import { FilterIcon, XSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FileList from "./connect-files-list";
import FilesModal from "./connect-files-modal";
import { detectFileType } from "@/lib/connect-files/detect-file-type";
import { FILE_TYPE_FILTERS } from "@/lib/connect-files/file-types";

export default function FilesPage({ accessToken, profileId, isAuthed }: any) {
  const [files, setFiles] = useState({ active: [], deleted: [] });
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const selectionMode =
    CONNECT_DEV_FEATURES.files.enableLongPressSelection && selected.length > 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelected([]);

  const fetchFiles = async () => {
    if (!profileId || !accessToken) return;

    try {
      const url =
        selectedType === "all"
          ? `${
              process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
            }${URLS.files.all.replace(
              "{profileId}",
              profileId
            )}?include_deleted=true`
          : `${
              process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
            }${URLS.files.file_type
              .replace("{profileId}", profileId)
              .replace("{type}", selectedType)}?include_deleted=true`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });

      const json = await res.json();

      const list = json?.data?.files ?? [];

      setFiles({
        active: list.filter((x: any) => !x.deletedAt),
        deleted: list.filter((x: any) => x.deletedAt),
      });
    } catch {
      setFiles({ active: [], deleted: [] });
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    for (const id of selected) {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.files.bulk_delete
          .replace("{profileId}", profileId!)
          .replace("{id}", id)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    }
    toast.success("files deleted");
    clearSelection();
    fetchFiles();
  };

  const bulkVisible = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.files.bulk_visible.replace("{profileId}", profileId!)}`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    toast.success("Visibility updated");
    clearSelection();
    fetchFiles();
  };
  const restoreAll = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.files.bulk_restore.replace("{profileId}", profileId!)}`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    toast.success("Restored all");
    fetchFiles();
  };

  useEffect(() => {
    if (isAuthed) fetchFiles();
  }, [isAuthed, selectedType]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Uploaded Files</h2>
        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-full"
          variant="secondary">
          Upload file
        </Button>
      </div>
      {/* Scroll-mask wrapper */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/80 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />

        {/* Actual scroll row */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
          {FILE_TYPE_FILTERS.map((ft) => (
            <button
              key={ft.id}
              onClick={() => setSelectedType(ft.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border backdrop-blur-sm
          ${
            selectedType === ft.id
              ? "bg-white/10 text-white border-white/30 shadow-sm"
              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
          }
        `}>
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      {selectionMode && (
        <div className="mb-4 flex gap-3 items-center bg-primary/10 p-3 rounded-xl border border-primary/30">
          <span className="text-background">{selected.length} selected</span>

          {CONNECT_DEV_FEATURES.files.enableBulkActions && (
            <Button size="sm" variant="default" onClick={bulkDelete}>
              <DeleteIcon className="w-4 h-4 mr-1" /> Delete Selected
            </Button>
          )}
          {CONNECT_DEV_FEATURES.files.enableBulkVisibility && (
            <Button size="sm" variant="default" onClick={bulkVisible}>
              <DeleteIcon className="w-4 h-4 mr-1" /> Mark all as visible
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <XSquare className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      )}
      <FileList
        items={files.active}
        loading={loading}
        profileId={profileId}
        accessToken={accessToken}
        onUpdated={fetchFiles}
        selectedIds={selected}
        selectionMode={selectionMode}
        toggleSelect={toggleSelect}
      />
      {files.deleted.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm uppercase">Deleted</h3>

            {CONNECT_DEV_FEATURES.files.enableBulkRestore && (
              <Button size="sm" variant="secondary" onClick={restoreAll}>
                Restore All
              </Button>
            )}
          </div>

          <FileList
            items={files.deleted}
            loading={loading}
            profileId={profileId}
            accessToken={accessToken}
            onUpdated={fetchFiles}
            showRestore
          />
        </div>
      )}
      {modalOpen && (
        <FilesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={fetchFiles}
          fileItem={null}
        />
      )}
    </>
  );
}
