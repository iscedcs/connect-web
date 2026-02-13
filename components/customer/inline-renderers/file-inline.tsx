"use client";

import { motion } from "framer-motion";

export function FileInline({ file }: { file: any }) {
  const url = file.url;
  const isImage = /\.(png|jpg|jpeg|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);
  const pdfViewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
    url,
  )}`;

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
        <div>
          <iframe src={pdfViewerUrl} className="w-full h-[420px] bg-black" />
          <div className="p-3 border-t border-white/10">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-white text-black font-bold px-4 py-2 text-xs"
            >
              Open file
            </a>
            <p className="mt-2 text-[11px] text-white/60">
              If preview is blocked on your device, tap Open file.
            </p>
          </div>
        </div>
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
