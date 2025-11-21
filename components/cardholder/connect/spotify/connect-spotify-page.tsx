"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SpotifyModal from "./connect-spotify-modal";
import SpotifyList from "./connect-spotify-list";
import { URLS } from "@/lib/const";
import {
  detectSpotifyType,
  SpotifyType,
} from "@/lib/connect-spotify/detect-type";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { DeleteIcon } from "@/lib/icons";
import { XSquare } from "lucide-react";
import { toast } from "sonner";

interface SpotifyItem {
  id: string;
  type: SpotifyType;
  externalUrl: string;
  title: string;
  isVisible: boolean;
  order: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}
export default function SpotifyPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  const [spotify, setSpotify] = useState<{
    active: SpotifyItem[];
    deleted: SpotifyItem[];
  }>({
    active: [],
    deleted: [],
  });
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const selectionMode =
    CONNECT_DEV_FEATURES.spotify.enableLongPressSelection &&
    selected.length > 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelected([]);

  const fetchItems = async () => {
    if (!profileId || !accessToken) return;

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.spotify.all.replace(
          "{profileId}",
          profileId
        )}?include_deleted=true`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }
      );

      const json = await res.json();

      const formatted = (json?.data?.items ?? []).map((s: any) => ({
        id: s.id,
        type: detectSpotifyType(s.external_url),
        externalUrl: s.external_url,
        title: s.title,
        order: s.order,
        isVisible: s.is_visible,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        deletedAt: s.deletedAt,
      }));

      setSpotify({
        active: formatted.filter((s: any) => !s.deletedAt),
        deleted: formatted.filter((s: any) => s.deletedAt),
      });
    } catch {
      setSpotify({ active: [], deleted: [] });
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
        }${URLS.spotify.bulk_delete
          .replace("{profileId}", profileId!)
          .replace("{id}", id)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    }
    toast.success("Social links deleted");
    clearSelection();
    fetchItems();
  };

  const bulkVisible = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.spotify.bulk_visible.replace("{profileId}", profileId!)}`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    toast.success("Visibility updated");
    clearSelection();
    fetchItems();
  };

  const restoreAll = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.spotify.bulk_restore.replace("{profileId}", profileId!)}`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    toast.success("Restored all");
    fetchItems();
  };

  useEffect(() => {
    if (isAuthed) fetchItems();
  }, [isAuthed]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Spotify Links</h2>
        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-full px-4 py-1">
          Add new
        </Button>
      </div>

      {selectionMode && (
        <div className="mb-4 flex gap-3 items-center bg-primary/10 p-3 rounded-xl border border-primary/30">
          <span className="text-background">{selected.length} selected</span>

          {CONNECT_DEV_FEATURES.spotify.enableBulkActions && (
            <Button size="sm" variant="default" onClick={bulkDelete}>
              <DeleteIcon className="w-4 h-4 mr-1" /> Delete Selected
            </Button>
          )}
          {CONNECT_DEV_FEATURES.spotify.enableAllVisibilityActions && (
            <Button size="sm" variant="default" onClick={bulkVisible}>
              <DeleteIcon className="w-4 h-4 mr-1" /> Mark all as visible
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <XSquare className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      )}

      <SpotifyList
        items={spotify.active}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchItems}
        selectedIds={selected}
        selectionMode={selectionMode}
        toggleSelect={toggleSelect}
      />

      {spotify.deleted.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm uppercase">Deleted</h3>

            {CONNECT_DEV_FEATURES.spotify.enableAllRestoreActions && (
              <Button size="sm" variant="secondary" onClick={restoreAll}>
                Restore All
              </Button>
            )}
          </div>

          <SpotifyList
            items={spotify.deleted}
            loading={loading}
            profileId={profileId!}
            accessToken={accessToken!}
            onUpdated={fetchItems}
            showRestore
          />
        </div>
      )}

      {modalOpen && (
        <SpotifyModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchItems}
        />
      )}
    </>
  );
}
