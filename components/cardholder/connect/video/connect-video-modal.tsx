"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { Spinner } from "@/components/ui/spinner";

export default function VideoModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
  video,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  video?: any;
}) {
  const isEdit = !!video;
  const [title, setTitle] = useState(video?.title);
  const [platform, setPlatform] = useState("youtube");
  const [url, setUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!url.trim()) return toast.error("Please enter a video URL");
    setLoading(true);
    try {
      const endpoint = isEdit
        ? URLS.videos.update
            .replace("{profileId}", profileId)
            .replace("{id}", video.id)
        : URLS.videos.add.replace("{profileId}", profileId);

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title,
            platform,
            url,
            is_visible: isVisible,
          }),
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success(
          isEdit ? "Video updated successfully" : "Video added successfully"
        );
        onClose();
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to save video");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md space-y-5">
        <h2 className="text-lg font-semibold">Add Video</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full mt-1 bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="others">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/70">Video URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtu.be/abc123"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/70">
              Make visible on profile
            </span>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner className="size-6" /> Adding...
              </>
            ) : (
              "Add Video"
            )}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}
