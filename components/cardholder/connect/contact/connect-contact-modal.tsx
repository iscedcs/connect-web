// components/pages/connect/contact/contact-modal.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { URLS } from "@/lib/const";
import { ToggleIcon } from "@/lib/icons";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) return toast.error("Please enter a phone number");
    if (!label.trim()) return toast.error("Please enter a label");

    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.profile_contact.add.replace("{profileId}", profileId)}`,
        {
          method: "POST",
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
        toast.success("Contact added successfully");
        onClose();
        await onUpdated();
      } else {
        toast.error(json?.message || "Failed to add contact");
      }
    } catch (err) {
      console.error("Error adding contact:", err);
      toast.error("Error adding contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      style={{ animation: "modalFade .25s ease" }}>
      <div className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-[90%] max-w-md space-y-4 animate-modalScale">
        <h2 className="text-lg font-semibold">Add Contact</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Support, Office, Personal"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Phone Number</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234..."
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-white/70">Set as primary</span>
            <ToggleIcon
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
              className="w-8 h-8"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">
              Make visible on profile
            </span>
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner className="size-6" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
