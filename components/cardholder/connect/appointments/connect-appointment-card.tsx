"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleIcon, EditIcon, DeleteIcon } from "@/lib/icons";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";
import AppointmentModal from "./connect-appointment-modal";
import { Spinner } from "@/components/ui/spinner";
import { Star } from "lucide-react";

export default function AppointmentCard({
  appointment,
  profileId,
  accessToken,
  onUpdated,
  showRestore,
  selectionMode,
  selected,
  toggleSelect,
}: {
  appointment: any;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  showRestore?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  toggleSelect?: (id: string) => void;
}) {
  const [isDefault, setIsDefault] = useState(appointment.is_default ?? false);
  useEffect(() => {
    setIsDefault(appointment.is_default ?? false);
  }, [appointment.is_default]);
  const [visible, setVisible] = useState(appointment.isVisible);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setDeleteing] = useState(false);
  const [isRestoring, setRestoring] = useState(false);

  const pressTimer = useRef<any>(null);

  const handleLongPressStart = () => {
    if (!CONNECT_DEV_FEATURES.appointments.enableLongPressSelection) return;
    if (!pressTimer.current) {
      pressTimer.current = setTimeout(() => {
        toggleSelect?.(appointment.id);
      }, 450);
    }
  };

  const handleLongPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const patchRequest = async (endpoint: string, msg: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_default: true }),
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success(msg);
        await onUpdated();
      } else toast.error(json?.message ?? "Update failed");
    } catch {
      toast.error("Error updating appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteing(true);

      await patchRequest(
        URLS.appointments.delete
          .replace("{profileId}", profileId)
          .replace("{id}", appointment.id),
        "Your Appoointment has been deleted!🥺"
      );
    } finally {
      setDeleteing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      await patchRequest(
        URLS.appointments.restore
          .replace("{profileId}", profileId)
          .replace("{id}", appointment.id),
        "Yeepy! Your appointment has been restored successfully!🫣🫣"
      );
    } finally {
      setRestoring(false);
    }
  };

  const handleToggleVisible = async () => {
    const newValue = !visible;
    try {
      setVisible(newValue);
      await patchRequest(
        URLS.appointments.visible
          .replace("{profileId}", profileId)
          .replace("{id}", appointment.id),
        newValue
          ? "😋 You've enabled your appointment visibility!!🎉🎉"
          : "🙈 Your appointment is now hidden."
      );
    } catch {
      setVisible(!newValue);
    }
  };
  const handleSetDefault = async () => {
    try {
      setIsDefault(true);

      await patchRequest(
        URLS.appointments.default
          .replace("{profileId}", profileId)
          .replace("{id}", appointment.id),
        "Default appointment updated"
      );

      await onUpdated(); // <- critical (triggers refreshed list)
    } catch {
      setIsDefault(false);
    }
  };

  return (
    <div
      className={`bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex justify-between items-center ${
        selected ? "ring-2 ring-primary/70" : ""
      }`}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}>
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => selectionMode && toggleSelect?.(appointment.id)}>
        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
          <img
            src={getFaviconFromUrl(appointment.url)}
            className="w-6 h-6 rounded"
            alt="icon"
          />
        </div>

        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{appointment.label}</p>
          <p className="text-xs text-white/50 truncate max-w-[180px] block">
            {appointment.url}
          </p>
          {selected && <p className="text-xs text-background">Selected</p>}
        </div>
      </div>

      {!showRestore ? (
        <div className="flex items-center gap-3">
          {!selectionMode && (
            <>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSetDefault}
                  disabled={isDefault || loading}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    isDefault ? "opacity-60" : ""
                  }`}>
                  <Star
                    className={`w-4 h-4 ${
                      isDefault
                        ? "fill-primary text-amber-400"
                        : "text-white/70"
                    }`}
                  />
                </Button>

                <ToggleIcon
                  checked={visible}
                  onCheckedChange={handleToggleVisible}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditOpen(true)}
                  className="w-8 h-8 flex items-center justify-center">
                  <EditIcon className="w-4 h-4 text-white/70" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="w-8 h-8 flex items-center justify-center">
                  {isDeleting ? (
                    <Spinner />
                  ) : (
                    <DeleteIcon className="w-4 h-4 text-white/60" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {isRestoring ? (
            <Spinner />
          ) : (
            <Button variant="secondary" size="sm" onClick={handleRestore}>
              Restore
            </Button>
          )}
        </>
      )}

      {editOpen && (
        <AppointmentModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profileId={profileId}
          accessToken={accessToken}
          onUpdated={onUpdated}
          appointment={appointment}
        />
      )}
    </div>
  );
}
