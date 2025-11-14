"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { Spinner } from "@/components/ui/spinner";

export default function LinkModal({
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
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("globe");
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim()) return toast.error("All fields required");
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.links.add.replace("{profileId}", profileId)}`,
        {
          method: "POST",
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
        toast.success("Link added");
        onClose();
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to add link");
      }
    } catch {
      toast.error("Error adding link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-[90%] max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Add New Link</h2>

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
            <Switch checked={visible} onCheckedChange={setVisible} />
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
            )}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}
