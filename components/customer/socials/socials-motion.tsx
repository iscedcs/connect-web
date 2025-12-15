"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";
import { InlineRenderer } from "@/components/customer/inline-renderers/inline-renderer";

export default function SocialsMotion({ socials }: { socials: any[] }) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  return (
    <>
      {/* ICON GRID */}
      <div className="grid grid-cols-4 gap-5">
        {socials.map((item) => (
          <motion.button
            key={item.id}
            onClick={() =>
              setExpandedItemId(expandedItemId === item.id ? null : item.id)
            }
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center">
              <img
                src={getFaviconFromUrl(item.url, 64)}
                alt={item.platform}
                className="w-8 h-8 object-contain"
              />
            </div>
          </motion.button>
        ))}
      </div>

      {/* INLINE PREVIEW */}
      {expandedItemId && (
        <div className="mt-6">
          {socials
            .filter((item) => item.id === expandedItemId)
            .map((item) => (
              <InlineRenderer key={item.id} item={item} />
            ))}
        </div>
      )}
    </>
  );
}
