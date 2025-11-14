"use client";

import { Globe, Trash2, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";
import { URLS } from "@/lib/const";

export default function LinkCard({
  link,
  profileId,
  accessToken,
  onUpdated,
}: {
  link: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
}) {
  const [visible, setVisible] = useState(link.isVisible);
  const [loading, setLoading] = useState(false);

  const handleToggleVisible = async () => {
    setVisible((prev: any) => !prev);
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.links.visible
          .replace("{profileId}", profileId)
          .replace("{id}", link.id)}`,
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
        toast.success(json?.message ?? "Visibility updated");
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to update visibility");
      }
    } catch {
      toast.error("Error updating visibility");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
          <Globe className="w-5 h-5 text-white/80" />
        </div>
        <div>
          <p className="text-sm font-medium truncate">{link.title}</p>
          <p className="text-xs text-white/50 truncate">{link.url}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Switch checked={visible} onCheckedChange={handleToggleVisible} />
        <Button variant="ghost" size="icon">
          <Trash2 className="w-4 h-4 text-white/60" />
        </Button>
      </div>
    </div>
  );
}
