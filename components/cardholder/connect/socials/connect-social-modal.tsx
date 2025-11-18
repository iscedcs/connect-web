"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleIcon } from "@/lib/icons";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import {
  detectSocialPlatform,
  autoLabel,
  SocialPlatform,
} from "@/lib/connect-social/detect-provider";

export default function SocialModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
  social,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  social?: any;
}) {
  const isEdit = !!social;

  const [platform, setPlatform] = useState<SocialPlatform>(
    social?.platform ?? "Unknown"
  );
  const [label, setLabel] = useState(social?.label ?? "");
  const [value, setValue] = useState(social?.value ?? "");
  const [visible, setVisible] = useState(social?.isVisible ?? true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit && value.trim().length > 5) {
      const detected = detectSocialPlatform(value);
      setPlatform(detected);
      setLabel(autoLabel(detected));
    }
  }, [value]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!value.trim()) return toast.error("Enter a value/link");

    setLoading(true);
    try {
      const endpoint = isEdit
        ? URLS.profile_social.update
            .replace("{profileId}", profileId)
            .replace("{id}", social.id)
        : URLS.profile_social.add.replace("{profileId}", profileId);

      const method = isEdit ? "PATCH" : "POST";

      const body = {
        platform,
        label,
        value,
        is_visible: visible,
        order: 1,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success(isEdit ? "Social updated" : "Social added");
        onClose();
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed");
      }
    } catch {
      toast.error("Error saving social link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-[90%] max-w-md space-y-4">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Social Link" : "Add Social Link"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70">
              Profile Link / Value
            </label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Platform</label>
            <Input
              value={platform}
              disabled
              className="mt-1 bg-neutral-800 text-white border-white/10 opacity-60"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Professional Profile"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-white/70">Visible on profile</span>
            <ToggleIcon checked={visible} onCheckedChange={setVisible} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner className="size-6" /> Saving…
              </>
            ) : isEdit ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
