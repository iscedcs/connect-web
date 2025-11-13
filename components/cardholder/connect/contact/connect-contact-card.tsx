"use client";

import { useState } from "react";
import { Mail, Phone, Star, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { URLS } from "@/lib/const";
import { DeleteIcon, EditIcon, EyesOpenIcon, ToggleIcon } from "@/lib/icons";
import EditContactModal from "./connect-contact-edit-modal";

export default function ContactCard({
  contact,
  profileId,
  accessToken,
  onUpdated,
  showRestore,
}: {
  contact: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(contact.isVisible);
  const [primary, setPrimary] = useState(contact.isPrimary);
  const [editOpen, setEditOpen] = useState(false);

  const Icon =
    contact.type === "EMAIL" ? Mail : contact.type === "PHONE" ? Phone : Star;

  // 🧠 Helper to call PATCH endpoints
  const patchRequest = async (endpoint: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success(json?.message ?? "Update successful");
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.profile_contact.restore
          .replace("{profileId}", profileId)
          .replace("{id}", contact.id)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Contact restored");
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to restore");
      }
    } catch (err) {
      toast.error("Error restoring contact");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisible = async () => {
    setVisible((prev: any) => !prev);
    await patchRequest(
      URLS.profile_contact.visible
        .replace("{profileId}", profileId)
        .replace("{id}", contact.id)
    );
  };

  const handleSetPrimary = async () => {
    setPrimary(true);
    await patchRequest(
      URLS.profile_contact.primary
        .replace("{profileId}", profileId)
        .replace("{id}", contact.id)
    );
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.profile_contact.delete
          .replace("{profileId}", profileId)
          .replace("{id}", contact.id)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Contact deleted successfully");
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to delete contact");
      }
    } catch (err) {
      toast.error("Error deleting contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <p className="text-sm font-medium">{contact.value}</p>
            <p className="text-xs text-white/50">{contact.label}</p>
          </div>
        </div>

        {!showRestore ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              disabled={loading}
              className="hover:bg-transparent cursor-pointer"
              onClick={handleDelete}>
              <DeleteIcon className="w-4 h-4 text-white/60" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={loading}
              className="hover:bg-transparent cursor-pointer"
              onClick={() => setEditOpen(true)}>
              <EditIcon className="w-4 h-4 text-white/60" />
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={handleRestore}>
            Restore
          </Button>
        )}
      </div>

      {!showRestore && (
        <div className="flex justify-between items-center text-xs text-white/60 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2">
            <EyesOpenIcon className="w-4 h-4" />
            <ToggleIcon
              className="w-7 h-7"
              checked={visible}
              onCheckedChange={handleToggleVisible}
            />
            <span>Visible</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <ToggleIcon
              className="w-7 h-7"
              checked={primary}
              onCheckedChange={handleSetPrimary}
            />
            <span>Primary</span>
          </div>
        </div>
      )}
      {editOpen && (
        <EditContactModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          contact={contact}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
        />
      )}
    </div>
  );
}
