"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import LinkList from "./connect-links-list";
import LinkModal from "./connect-links-modal";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { DeleteIcon, EyesOpenIcon } from "@/lib/icons";
import { ArrowUpDown, XSquare } from "lucide-react";
import {
  detectCategory,
  LinkCategory,
} from "@/lib/connect-links/categories/category";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  image: string;
  order: number;
  isVisible: boolean;
  deletedAt?: string | null;
  category?: LinkCategory;
}

export default function LinkPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  const [links, setLinks] = useState<{
    active: LinkItem[];
    deleted: LinkItem[];
  }>({
    active: [],
    deleted: [],
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const selectionMode =
    CONNECT_DEV_FEATURES.links.enableLongPressSelection && selected.length > 0;

  const [reorderMode, setReorderMode] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelected([]);

  const fetchLinks = async () => {
    if (!profileId || !accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.links.all.replace(
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
      console.log("✅ Full response:", json);
      const formatted = (json?.data?.links ?? []).map((l: any) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        image: l.image,
        order: l.order,
        isVisible: l.is_visible,
        deletedAt: l.deletedAt,
        category: CONNECT_DEV_FEATURES.links.enableAutoCategoryGrouping
          ? detectCategory(l.url)
          : undefined,
      }));

      setLinks({
        active: formatted.filter((l: any) => !l.deletedAt),
        deleted: formatted.filter((l: any) => l.deletedAt),
      });
    } catch (err) {
      toast.error("Failed to fetch links");
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
        }${URLS.links.delete
          .replace("{profileId}", profileId!)
          .replace("{id}", id)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    }

    toast.success("Links deleted");
    clearSelection();
    fetchLinks();
  };

  // Bulk visibility toggle
  const bulkVisible = async () => {
    if (!selected.length) return;

    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.links.all_visible.replace("{profileId}", profileId!)}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    toast.success("Visibility updated");
    clearSelection();
    fetchLinks();
  };

  // Restore All
  const restoreAll = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.links.restore_all.replace("{profileId}", profileId!)}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    toast.success("Links restored");
    fetchLinks();
  };

  // Reorder submit
  const saveReorder = async (newOrder: any[]) => {
    const payload = newOrder.map((l, idx) => ({
      id: l.id,
      order: idx + 1,
    }));

    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.links.reorder.replace("{profileId}", profileId!)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: payload }),
      }
    );

    toast.success("Order updated");
    setReorderMode(false);
    fetchLinks();
  };

  useEffect(() => {
    if (isAuthed) fetchLinks();
  }, [isAuthed]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Your Links</h2>
        <Button
          className="rounded-full"
          variant="secondary"
          onClick={() => setModalOpen(true)}>
          Add new
        </Button>
      </div>

      {selectionMode && CONNECT_DEV_FEATURES.links.enableBulkActions && (
        <div className="mb-4 flex gap-3 items-center bg-primary/10 p-3 rounded-xl border border-primary/30">
          <span className="text-background">{selected.length} selected</span>

          <Button size="sm" variant="default" onClick={bulkDelete}>
            <DeleteIcon className="w-4 h-4 mr-1" /> Delete Selected
          </Button>

          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <XSquare className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      )}

      {selectionMode &&
        CONNECT_DEV_FEATURES.links.enableAllVisibilityActions && (
          <div className="mb-4 flex gap-3 items-center bg-primary/10 p-3 rounded-xl border border-primary/30">
            <span className="text-background">{selected.length} selected</span>

            <Button size="sm" variant="default" onClick={bulkVisible}>
              <EyesOpenIcon className="w-4 h-4 mr-1" /> Toggle Visibility
            </Button>

            <Button size="sm" variant="ghost" onClick={clearSelection}>
              <XSquare className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        )}
      {CONNECT_DEV_FEATURES.links.enableReorder && !selectionMode && (
        <Button
          size="sm"
          variant="default"
          className="mb-4"
          onClick={() => setReorderMode((v) => !v)}>
          <ArrowUpDown className="w-4 h-4 mr-2" />
          {reorderMode ? "Finish Reordering" : "Reorder Links"}
        </Button>
      )}

      <LinkList
        links={links.active}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchLinks}
        selectionMode={selectionMode}
        selectedIds={selected}
        toggleSelect={toggleSelect}
        reorderMode={reorderMode}
        onReorderComplete={saveReorder}
      />

      {links.deleted.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm uppercase">Deleted Links</h3>

            {CONNECT_DEV_FEATURES.links.enableAllRestoreActions && (
              <Button size="sm" variant="secondary" onClick={restoreAll}>
                Restore All
              </Button>
            )}
          </div>
          <LinkList
            links={links.deleted}
            loading={false}
            profileId={profileId!}
            accessToken={accessToken!}
            onUpdated={fetchLinks}
            showRestore
          />
        </div>
      )}

      {modalOpen && (
        <LinkModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchLinks}
        />
      )}
    </div>
  );
}
