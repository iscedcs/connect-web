"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface UpdateDeviceModalProps {
  open: boolean;
  onClose: () => void;
  device: DeviceInterface | null;
  accessToken: string;
  onUpdated: () => Promise<void>;
}

export default function UpdateDeviceModal({
  open,
  onClose,
  device,
  accessToken,
  onUpdated,
}: UpdateDeviceModalProps) {
  const [label, setLabel] = useState(device?.label ?? "");
  const [isPrimary, setIsPrimary] = useState(device?.isPrimary ?? false);
  const [loading, setLoading] = useState(false);

  if (!open || !device) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/device/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: device.id,
          accessToken,
          productId: device.productId ?? "unknown",
          type: device.type,
          label,
          isPrimary,
          isActive: true,
          assignedAt: device.assignedAt ?? new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        }),
      });

      const json = await res.json();
      console.log("Device Update Respomse", `${res}`);
      if (res.ok) {
        toast.success("Device updated successfully");
        onClose();
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed to update device");
      }
    } catch (err) {
      console.error("Error updating device:", err);
      toast.error("Error updating device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md space-y-5 relative">
        <h2 className="text-lg font-semibold">Update Device</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter new device label"
              className="mt-1 bg-neutral-800 text-white border border-white/10"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/70">Set device as primary</span>
            <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Device"}
          </Button>
        </div>
      </div>
    </div>
  );
}
