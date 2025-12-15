"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RightIcon } from "@/lib/icons";
import { InlineRenderer } from "@/components/customer/inline-renderers/inline-renderer";
import { DockIcon } from "lucide-react";

export default function FilesMotionGrid({ files }: { files: any[] }) {
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  if (!files?.length) return null;

  return (
    <div className="bg-[#151515] rounded-[22px] p-4">
      {files.map((file: any, index: number) => (
        <div key={file.id} className="flex flex-col">
          {/* FILE ROW */}
          <motion.button
            onClick={() =>
              setExpandedFileId(expandedFileId === file.id ? null : file.id)
            }
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center justify-between py-4 group text-left hover:bg-white/5 rounded-xl px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                <DockIcon />
              </div>

              <div className="min-w-0">
                <p className="text-sm truncate">{file.title}</p>
                <p className="text-[10px] text-white/50 truncate max-w-[180px]">
                  {file.url}
                </p>
              </div>
            </div>

            <span
              className={`text-white/50 transition-transform ${
                expandedFileId === file.id ? "rotate-90" : ""
              }`}>
              <RightIcon />
            </span>
          </motion.button>

          {/* INLINE PREVIEW */}
          {expandedFileId === file.id && <InlineRenderer item={file} />}
        </div>
      ))}
    </div>
  );
}
