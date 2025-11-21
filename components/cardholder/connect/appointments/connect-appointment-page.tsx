"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";

import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { XSquare } from "lucide-react";
import AppointmentList from "./connect-appointment-list";
import AppointmentModal from "./connect-appointment-modal";
import { Spinner } from "@/components/ui/spinner";
import { DeleteIcon, EyesOpenIcon } from "@/lib/icons";

export default function AppointmentPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  const [appointments, setAppointments] = useState({
    active: [],
    deleted: [],
  });

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setDeleteing] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const [visible, setVisible] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const selectionMode =
    CONNECT_DEV_FEATURES.appointments.enableLongPressSelection &&
    selected.length > 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelected([]);

  const bulkDelete = async () => {
    try {
      setDeleteing(true);
      if (!selected.length) return;
      for (const id of selected) {
        await fetch(
          `${
            process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
          }${URLS.appointments.bulk_delete
            .replace("{profileId}", profileId!)
            .replace("{id}", id)}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }
      toast.success("Your appointments has been deleted🥺");
      clearSelection();
      await fetchAppointments();
    } finally {
      setDeleteing(false);
    }
  };

  const bulkVisible = async () => {
    try {
      setVisible(true);
      await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.appointments.all_visible.replace("{profileId}", profileId!)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      toast.success("Your clients can now see all your appointments🎉");
      clearSelection();
      fetchAppointments();
    } finally {
      setVisible(false);
    }
  };

  const fetchAppointments = async () => {
    if (!profileId || !accessToken) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.appointments.all.replace(
          "{profileId}",
          profileId
        )}?include_deleted=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const json = await res.json();

      const formatted = (json?.data?.appointments ?? []).map((a: any) => ({
        id: a.id,
        provider: a.provider,
        label: a.label,
        url: a.url,
        isVisible: a.is_visible,
        deletedAt: a.deletedAt,
      }));

      setAppointments({
        active: formatted.filter((a: any) => !a.deletedAt),
        deleted: formatted.filter((a: any) => a.deletedAt),
      });
    } catch {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) fetchAppointments();
  }, [isAuthed]);

  const restoreAll = async () => {
    try {
      setRestoring(true);

      await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.appointments.bulk_restore.replace("{profileId}", profileId!)}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Yeepy! You've restored all your appointments!🫣🫣");
      await fetchAppointments();
    } catch (error) {
      toast.error("Failed to restore");
    } finally {
      setRestoring(false);
    }
  };

  useEffect(() => {
    if (isAuthed) fetchAppointments();
  }, [isAuthed]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Your Appointment Links</h2>
        <Button
          className="rounded-full"
          variant="secondary"
          onClick={() => setModalOpen(true)}>
          Add new
        </Button>
      </div>

      {/* selection mode UI */}
      {selectionMode && (
        <div className="mb-4 flex gap-3 flex-wrap items-center bg-primary/10 p-3 rounded-xl border border-primary/30">
          <span className="text-background">{selected.length} selected</span>

          {CONNECT_DEV_FEATURES.appointments.enableBulkActions && (
            <Button size="sm" variant="default" onClick={bulkDelete}>
              {isDeleting ? (
                <Spinner />
              ) : (
                <>
                  <DeleteIcon className="w-4 h-4 mr-1" /> Delete Selected
                </>
              )}
            </Button>
          )}
          {CONNECT_DEV_FEATURES.appointments.enableAllVisibilityActions && (
            <Button size="sm" variant="default" onClick={bulkVisible}>
              {visible ? (
                <Spinner />
              ) : (
                <>
                  <EyesOpenIcon className="w-4 h-4 text-white/60 " />
                  Mark all as visible
                </>
              )}
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <XSquare className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      )}

      <AppointmentList
        appointments={appointments.active}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchAppointments}
        selectionMode={selectionMode}
        selectedIds={selected}
        toggleSelect={toggleSelect}
      />

      {appointments.deleted.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm uppercase mb-3">
              Deleted Appointments
            </h3>
            {CONNECT_DEV_FEATURES.appointments.enableAllRestoreActions && (
              <>
                {isRestoring ? (
                  <Spinner />
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={restoreAll}
                    disabled={isRestoring}>
                    Restore All
                  </Button>
                )}
              </>
            )}
          </div>

          <AppointmentList
            appointments={appointments.deleted}
            loading={false}
            profileId={profileId!}
            accessToken={accessToken!}
            onUpdated={fetchAppointments}
            showRestore
          />
        </div>
      )}

      {modalOpen && (
        <AppointmentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchAppointments}
        />
      )}
    </div>
  );
}
