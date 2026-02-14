"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { CONNECT_DEV_FEATURES } from "@/config/connect-dev-features";
import { XSquare, DeleteIcon, FilterIcon } from "lucide-react";
import FormList from "./connect-forms-list";
import FormsModal from "@/components/forms/form-modal";
import { useRouter } from "next/navigation";
import { LeftIcon } from "@/lib/icons";

const FORM_FILTERS = [
  { id: "all", label: "All" },
  { id: "DRAFT", label: "Draft" },
  { id: "ACTIVE", label: "Published" },
];

export default function FormsPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  const [forms, setForms] = useState({ active: [], deleted: [] });
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [formToEdit, setFormToEdit] = useState(null);
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const __DEV_FEATURES = CONNECT_DEV_FEATURES.forms;
  const allowSelection = __DEV_FEATURES.enableBulkActions;
  const selectionMode =
    CONNECT_DEV_FEATURES.forms.enableLongPressSelection && selected.length > 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelected([]);

  const fetchForms = async () => {
    if (!profileId || !accessToken) return;

    try {
      const url =
        selectedType === "all"
          ? `${
              process.env.NEXT_PUBLIC_CONNECT_API_URL
            }${URLS.forms.all.replace(
              "{profileId}",
              profileId
            )}?include_deleted=true`
          : `${
              process.env.NEXT_PUBLIC_CONNECT_API_URL
            }${URLS.forms.all.replace(
              "{profileId}",
              profileId
            )}?status=${selectedType}&include_deleted=true`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });

      const { data } = await res.json();
      const list = data?.forms ?? [];

      let filtered = list;

      if (selectedType != "all") {
        filtered = filtered.filter((f: any) => f.status === selectedType);
      }
      setForms({
        active: filtered.filter((x: any) => !x.deletedAt),
        deleted: filtered.filter((x: any) => x.deletedAt),
      });
    } catch {
      setForms({ active: [], deleted: [] });
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (!__DEV_FEATURES.enableBulkActions) return;

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_CONNECT_API_URL
        }${URLS.forms.bulk_delete.replace("{profileId}", profileId!)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Forms deleted");
        clearSelection();
        fetchForms();
      } else toast.error(json.message ?? "Bulk delete failed");
    } catch {
      toast.error("Bulk delete error");
    }
  };

  const bulkRestore = async () => {
    if (!__DEV_FEATURES.enableBulkRestore) return;
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_CONNECT_API_URL
        }${URLS.forms.bulk_restore.replace("{profileId}", profileId!)}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Forms restored");
        fetchForms();
      } else toast.error(json.message ?? "Restore all failed!");
    } catch {
      toast.error("Restore all error");
    }
  };

  const bulkVisibility = async () => {
    if (!__DEV_FEATURES.enableBulkVisible) return;
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_CONNECT_API_URL
        }${URLS.forms.bulk_visible.replace("{profileId}", profileId!)}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Visibility updated");
        clearSelection();
        fetchForms();
      } else toast.error(json.message ?? "Visibility update failed");
    } catch {
      toast.error("Mark all visible error");
    }
  };

  useEffect(() => {
    if (isAuthed) fetchForms();
  }, [isAuthed, selectedType]);

  return (
    <>
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => router.back()}>
        <LeftIcon />
      </button>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Forms</h2>
        {!selectionMode && (
          <Button
            onClick={() => {
              setFormToEdit(null);
              setModalOpen(true);
            }}
            variant="secondary"
            className="rounded-full">
            Create Form
          </Button>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {FORM_FILTERS.map((ft) => (
          <button
            key={ft.id}
            onClick={() => setSelectedType(ft.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              selectedType === ft.id
                ? "bg-white/10 text-white border-white/30"
                : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
            }`}>
            {ft.label}
          </button>
        ))}
      </div>

      {/* BULK ACTIONS */}
      {selectionMode && (
        <div className="mb-4 flex gap-3 items-center bg-primary/10 p-3 rounded-xl border border-primary/30">
          <span className="text-background">{selected.length} selected</span>

          <div className="flex gap-2">
            {__DEV_FEATURES.enableBulkActions && (
              <Button size="sm" variant="default" onClick={bulkDelete}>
                <DeleteIcon className="w-4 h-4 mr-1" /> Delete Selected
              </Button>
            )}

            {__DEV_FEATURES.enableBulkVisible && (
              <Button size="sm" variant="default" onClick={bulkVisibility}>
                Toggle Visibility
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={clearSelection}>
              <XSquare className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ACTIVE LIST */}
      <FormList
        items={forms.active}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchForms}
        selected={allowSelection ? selected : []}
        toggleSelect={allowSelection ? toggleSelect : undefined}
        setFormToEdit={setFormToEdit}
        openModal={() => setModalOpen(true)}
      />

      {/* DELETED LIST */}
      {forms.deleted.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/50 text-sm uppercase">Deleted Forms</h3>

            {__DEV_FEATURES.enableBulkRestore && (
              <Button size="sm" variant="secondary" onClick={bulkRestore}>
                Restore All
              </Button>
            )}
          </div>

          <FormList
            items={forms.deleted}
            loading={false}
            profileId={profileId!}
            accessToken={accessToken!}
            onUpdated={fetchForms}
            showRestore
            selected={[]}
          />
        </div>
      )}

      {modalOpen && (
        <FormsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchForms}
          formItem={formToEdit}
        />
      )}
    </>
  );
}
