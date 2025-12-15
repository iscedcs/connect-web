"use client";

import { motion } from "framer-motion";

export function FileInline({ file }: { file: any }) {
  const url = file.url;
  const isImage = /\.(png|jpg|jpeg|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3 rounded-xl overflow-hidden bg-black border border-white/10">
      {isImage && (
        <img
          src={url}
          alt={file.title}
          className="w-full max-h-[420px] object-contain bg-black"
        />
      )}

      {isPdf && (
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className="w-full h-[420px] bg-black"
        />
      )}

      {!isImage && !isPdf && (
        <div className="p-4 text-sm text-white/60">
          Preview not supported.
          <a href={url} target="_blank" className="underline ml-1 text-white">
            Open file
          </a>
        </div>
      )}
    </motion.div>
  );
}
