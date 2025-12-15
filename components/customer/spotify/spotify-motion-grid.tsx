"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";
import { RightIcon } from "@/lib/icons";
import { InlineRenderer } from "@/components/customer/inline-renderers/inline-renderer";

export default function SpotifyMotionGrid({ items }: { items: any[] }) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  if (!items?.length) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col">
          {/* CLICK ROW */}
          <motion.button
            onClick={() =>
              setExpandedItemId(expandedItemId === item.id ? null : item.id)
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-4 bg-[#0f0f0f] rounded-xl p-4 hover:bg-[#1a1a1a] transition text-left">
            <span className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
              <img
                src={getFaviconFromUrl(item.url, 64)}
                alt="Spotify"
                className="w-7 h-7"
              />
            </span>

            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">
                {item.title || "Spotify"}
              </p>
            </div>

            <span
              className={`text-white/60 text-xl transition-transform ${
                expandedItemId === item.id ? "rotate-90" : ""
              }`}>
              <RightIcon />
            </span>
          </motion.button>

          {/* INLINE PREVIEW */}
          {expandedItemId === item.id && <InlineRenderer item={item} />}
        </div>
      ))}
    </div>
  );
}
