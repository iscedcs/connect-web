"use client";

import { motion } from "framer-motion";

export function SpotifyInline({ url }: { url: string }) {
  // Convert to Spotify embed URL
  const embedUrl = url.replace("open.spotify.com/", "open.spotify.com/embed/");

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f]">
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl"
      />
    </motion.div>
  );
}
