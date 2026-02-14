"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ToggleIcon } from "@/lib/icons";
import { URLS } from "@/lib/const";
import { toast } from "sonner";

import FormFieldEditor, { FormField } from "./form-field-editor";

type FormStatus = "DRAFT" | "ACTIVE";

interface FormItem {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  is_visible: boolean;
  fields: FormField[];
}

export default function FormsModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
  formItem,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  formItem?: FormItem | null;
}) {
  if (!open) return null;

  const isEdit = !!formItem;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FormStatus>("DRAFT");
  const [isVisible, setIsVisible] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);

  // Hydrate when editing
  useEffect(() => {
    if (formItem) {
      setTitle(formItem.title || "");
      setDescription(formItem.description || "");
      setStatus(formItem.status || "DRAFT");
      setIsVisible(formItem.is_visible ?? true);
      setFields(formItem.fields || []);
    } else {
      setTitle("");
      setDescription("");
      setStatus("DRAFT");
      setIsVisible(true);
      setFields([]);
    }
  }, [formItem]);

  const addField = () => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `fld_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const newField: FormField = {
      id,
      type: "text",
      label: "",
      name: ``,
      required: false,
      options: [],
      validations: {},
    };

    setFields((prev) => [...prev, newField]);
  };

  const updateField = (updated: FormField) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Form title is required");
      return;
    }

    if (!fields.length) {
      toast.error("Add at least one field to the form");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        form_type: "custom",
        template_id: null,
        status,
        is_visible: isVisible,
        fields,
      };

      const endpoint = isEdit
        ? URLS.forms.update
            .replace("{profileId}", profileId)
            .replace("{id}", formItem!.id)
        : URLS.forms.add.replace("{profileId}", profileId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CONNECT_API_URL}${endpoint}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(json?.message ?? "Failed to save form");
        return;
      }

      toast.success(isEdit ? "Form updated!" : "Form created!");
      onClose();
      await onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Error saving form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="bg-neutral-950 border border-white/10 rounded-2xl w-[95%] max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            {/* HEADER */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {isEdit ? "Edit Form" : "Create New Form"}
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Build a lightweight form visitors can submit from your
                  profile.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white/60 mr-1">Visible</span>
                <ToggleIcon
                  checked={isVisible}
                  onCheckedChange={setIsVisible}
                />
              </div>
            </div>

            {/* BODY */}
            <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* BASIC INFO */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-white/70">Form Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contact Me"
                    className="w-full mt-1 p-2.5 bg-neutral-900 border border-white/10 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Business inquiries, collaborations, bookings..."
                    className="w-full mt-1 p-2.5 bg-neutral-900 border border-white/10 rounded-lg text-sm min-h-[80px] resize-y"
                  />
                </div>

                {/* STATUS */}
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("DRAFT")}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        status === "DRAFT"
                          ? "bg-white/10 border-white/40 text-white"
                          : "bg-neutral-900 border-white/10 text-white/60 hover:bg-neutral-800"
                      }`}>
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("ACTIVE")}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        status === "ACTIVE"
                          ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-300"
                          : "bg-neutral-900 border-white/10 text-white/60 hover:bg-neutral-800"
                      }`}>
                      Published
                    </button>
                  </div>
                </div>
              </div>

              {/* FIELDS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Fields</h3>
                  <Button size="sm" variant="secondary" onClick={addField}>
                    + Add Field
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-xs text-white/40 border border-dashed border-white/15 rounded-lg p-3 text-center">
                    No fields yet. Click{" "}
                    <span className="font-medium">“Add Field”</span> to start
                    building your form.
                  </p>
                )}

                <div className="space-y-3">
                  {fields.map((field) => (
                    <FormFieldEditor
                      key={field.id}
                      field={field}
                      onChange={updateField}
                      onDelete={deleteField}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3 bg-neutral-950/80">
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />{" "}
                    {isEdit ? "Saving..." : "Creating..."}
                  </span>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create Form"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
