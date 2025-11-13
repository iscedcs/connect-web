"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { ToggleIcon } from "@/lib/icons";
import { Spinner } from "@/components/ui/spinner";

export default function EditContactModal({
  open,
  onClose,
  contact,
  profileId,
  accessToken,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  contact: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
}) {
  const [label, setLabel] = useState(contact.label || "");
  const [phoneNumber, setPhoneNumber] = useState(contact.value || "");
  const [isPrimary, setIsPrimary] = useState(contact.isPrimary || false);
  const [isVisible, setIsVisible] = useState(contact.isVisible || true);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpdate = async () => {
    if (!label.trim() || !phoneNumber.trim())
      return toast.error("Please fill in all fields");

    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.profile_contact.update
          .replace("{profileId}", profileId)
          .replace("{id}", contact.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            label,
            phone_number: phoneNumber,
            is_primary: isPrimary,
            is_visible: isVisible,
          }),
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success(json?.message ?? "Contact updated successfully!");
        onClose();
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to update");
      }
    } catch (err) {
      toast.error("Error updating contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-[90%] max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Edit Contact</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter label"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Phone Number</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-white/70">Set as Primary</span>
            <ToggleIcon
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
              className="w-8 h-8"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Visible on Profile</span>
            <ToggleIcon
              checked={isVisible}
              onCheckedChange={setIsVisible}
              className="w-8 h-8"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="cursor-pointer">
            {loading ? (
              <>
                <Spinner className="size-6" /> Saving...{" "}
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
