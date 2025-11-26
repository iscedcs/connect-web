"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ToggleIcon } from "@/lib/icons";
import { Spinner } from "@/components/ui/spinner";
import { URLS } from "@/lib/const";
import { toast } from "sonner";

import { uploadFile } from "@/lib/storage";
import { generateChecksum } from "@/lib/spaces/checksum";

export default function FilesModal({
  open,
  onClose,
  profileId,
  accessToken,
  onUpdated,
  fileItem,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  accessToken: string;
  onUpdated: () => Promise<void>;
  fileItem?: any;
}) {
  if (!open) return null;

  const isEdit = !!fileItem;

  const [file, setFile] = useState<File | null>(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = (ev: any) => {
    const f = ev.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (ev: any) => {
    ev.preventDefault();
    const f = ev.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!isEdit && !file) return toast.error("Please select a file.");

    setLoading(true);

    try {
      let payload: any = {
        filename: file ? file.name : fileItem.filename,
        is_visible: visible,
      };
      //   let payload: any = {
      //     ...(isEdit
      //       ? {
      //           filename: fileItem.filename,
      //           storage_key: fileItem.storage_key,
      //           media_type: fileItem.media_type,
      //           size_bytes: fileItem.size_bytes,
      //           checksum: fileItem.checksum,
      //           spaces_url: fileItem.spaces_url,
      //           is_visible: visible,
      //         }
      //       : {}),
      //   };

      if (file) {
        const upload = await uploadFile(file, `profiles/${profileId}/files`);

        if (!upload.success) {
          toast.error("Upload to Spaces failed");
          setLoading(false);
          return;
        }

        const checksum = await generateChecksum(file);

        payload = {
          filename: file.name,
          storage_key: upload.key,
          media_type: file.type,
          size_bytes: file.size,
          checksum,
          spaces_url: upload.url,
          is_visible: visible,
        };
      }

      const endpoint = isEdit
        ? URLS.files.update
            .replace("{profileId}", profileId)
            .replace("{id}", fileItem.id)
        : URLS.files.add.replace("{profileId}", profileId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${endpoint}`,
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
        toast.error(json?.message ?? "Failed to upload file");
        return;
      }

      toast.success(isEdit ? "File updated!" : "File uploaded!✅");
      onClose();
      onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Upload error occurred");
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
            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold">
              {isEdit ? "Update File" : "Upload File"}
            </h2>

            {/* Dropzone */}
            {!isEdit && (
              <motion.div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-neutral-800/40 hover:bg-neutral-800/60 transition"
                onClick={() => fileInputRef.current?.click()}>
                {!file ? (
                  <p className="text-sm text-white/60">
                    Drag & Drop or Click to upload
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-white/50">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFilePick}
            />

            {/* Visibility */}
            {!isEdit && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-white/70">Visible</span>
                <ToggleIcon checked={visible} onCheckedChange={setVisible} />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={loading || (!file && !isEdit)}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> {isEdit ? "Saving..." : "Uploading..."}
                  </span>
                ) : isEdit ? (
                  "Save"
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
