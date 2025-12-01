"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { Spinner } from "@/components/ui/spinner";
import { ToggleIcon } from "@/lib/icons";

export default function LinkModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
  link,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  link?: any;
}) {
  const isEdit = !!link;

  const [title, setTitle] = useState(link?.title ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [image] = useState("globe");
  const [visible, setVisible] = useState(link?.isVisible ?? true);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim()) return toast.error("All fields required");
    setLoading(true);
    try {
      const endpoint = isEdit
        ? URLS.links.update
            .replace("{profileId}", profileId)
            .replace("{id}", link.id)
        : URLS.links.add.replace("{profileId}", profileId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            url,
            image,
            order: 1,
            is_visible: visible,
          }),
        }
      );

      const json = await res.json();

      if (res.ok) {
        toast.success(isEdit ? "Link updated" : "Link added");
        onClose();
        await onUpdated();
      } else toast.error(json?.message ?? "Failed");
    } catch {
      toast.error("Error saving link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      style={{ animation: "modalFade .25s ease" }}>
      <div className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-[90%] max-w-md space-y-4 animate-modalScale">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Link" : "Add New Link"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Official Site"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-white/70">Visible on profile</span>
            <ToggleIcon
              className="w-8 h-8"
              checked={visible}
              onCheckedChange={setVisible}
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
