"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";

import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { DeleteIcon, EyesOpenIcon } from "@/lib/icons";
import { XSquare, ArrowUpDown } from "lucide-react";
import {
  detectSocialPlatform,
  SocialPlatform,
} from "@/lib/connect-social/detect-provider";
import SocialList from "./connect-social-list";
import SocialModal from "./connect-social-modal";

interface SocialItem {
  id: string;
  platform: SocialPlatform;
  label: string;
  value: string;
  order: number;
  isVisible: boolean;
  deletedAt?: string | null;
}

export default function SocialPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  const [socials, setSocials] = useState<{
    active: SocialItem[];
    deleted: SocialItem[];
  }>({
    active: [],
    deleted: [],
  });

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const selectionMode =
    CONNECT_DEV_FEATURES.social.enableLongPressSelection && selected.length > 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelected([]);

  const fetchSocials = async () => {
    if (!profileId || !accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.profile_social.all.replace(
          "{profileId}",
          profileId
        )}?include_deleted=true`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const json = await res.json();

      const formatted = (json?.data?.socials ?? []).map((s: any) => ({
        id: s.id,
        platform: s.platform,
        label: s.label,
        value: s.value,
        order: s.order,
        isVisible: s.is_visible,
        deletedAt: s.deletedAt,
      }));

      setSocials({
        active: formatted.filter((s: any) => !s.deletedAt),
        deleted: formatted.filter((s: any) => s.deletedAt),
      });
    } catch {
      toast.error("Failed to fetch social links");
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
        }${URLS.profile_social.delete
          .replace("{profileId}", profileId!)
          .replace("{id}", id)}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }
    toast.success("Social links deleted");
    clearSelection();
    fetchSocials();
  };

  const bulkVisible = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.profile_social.all_visible.replace("{profileId}", profileId!)}`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    toast.success("Visibility updated");
    clearSelection();
    fetchSocials();
  };

  const restoreAll = async () => {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.profile_social.restore_all.replace("{profileId}", profileId!)}`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    toast.success("Restored all");
    fetchSocials();
  };

  useEffect(() => {
    if (isAuthed) fetchSocials();
  }, [isAuthed]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Social Profiles</h2>

        <Button
          className="rounded-full"
          variant="secondary"
          onClick={() => setModalOpen(true)}>
          Add new
        </Button>
      </div>

      {selectionMode && (
        <div className="mb-4 flex gap-3 items-center bg-primary/10 p-3 rounded-xl border border-primary/30">
          <span className="text-background">{selected.length} selected</span>

          {CONNECT_DEV_FEATURES.social.enableBulkActions && (
            <Button size="sm" variant="default" onClick={bulkDelete}>
              <DeleteIcon className="w-4 h-4 mr-1" /> Delete Selected
            </Button>
          )}
          {CONNECT_DEV_FEATURES.social.enableAllVisibilityActions && (
            <Button size="sm" variant="default" onClick={bulkVisible}>
              <DeleteIcon className="w-4 h-4 mr-1" /> Mark all as visible
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <XSquare className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      )}

      <SocialList
        socials={socials.active}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchSocials}
        selectedIds={selected}
        selectionMode={selectionMode}
        toggleSelect={toggleSelect}
      />

      {socials.deleted.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm uppercase">Deleted</h3>

            {CONNECT_DEV_FEATURES.social.enableAllRestoreActions && (
              <Button size="sm" variant="secondary" onClick={restoreAll}>
                Restore All
              </Button>
            )}
          </div>

          <SocialList
            socials={socials.deleted}
            loading={false}
            profileId={profileId!}
            accessToken={accessToken!}
            onUpdated={fetchSocials}
            showRestore
          />
        </div>
      )}

      {modalOpen && (
        <SocialModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchSocials}
        />
      )}
    </div>
  );
}
