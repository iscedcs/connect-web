"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleIcon } from "@/lib/icons";
import { Spinner } from "@/components/ui/spinner";
import { URLS } from "@/lib/const";
import { toast } from "sonner";
import {
  detectAppointmentProvider,
  AppointmentProvider,
} from "@/lib/connect-appointments/detect-provider";

export default function AppointmentModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
  appointment,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  appointment?: any;
}) {
  const isEdit = !!appointment;

  const [url, setUrl] = useState(appointment?.url ?? "");
  const [label, setLabel] = useState(appointment?.label ?? "");
  const [provider, setProvider] = useState<AppointmentProvider>(
    appointment?.provider ?? "Other"
  );
  const [visible, setVisible] = useState(appointment?.isVisible ?? true);

  const [loading, setLoading] = useState(false);

  // auto-detect provider when URL changes
  useEffect(() => {
    if (!url) return;
    const detected = detectAppointmentProvider(url);
    setProvider(detected);
  }, [url]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!url.trim()) return toast.error("URL is required");

    setLoading(true);
    try {
      const endpoint = isEdit
        ? URLS.appointments.update
            .replace("{profileId}", profileId)
            .replace("{id}", appointment.id)
        : URLS.appointments.add.replace("{profileId}", profileId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider,
            url,
            label: label || provider, // fallback to provider
            is_visible: visible,
          }),
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success(isEdit ? "Appointment updated" : "Appointment added");
        onClose();
        await onUpdated();
      } else {
        toast.error(json?.message ?? "Failed");
      }
    } catch {
      toast.error("Error saving appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-[90%] max-w-md space-y-4">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Appointment" : "Add Appointment"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Booking URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://calendly.com/..."
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Intro Call"
              className="mt-1 bg-neutral-800 text-white border-white/10"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-white/70">Visible</span>
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
