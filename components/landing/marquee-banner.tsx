"use client";

import { motion } from "framer-motion";

const words = [
  "Tap",
  "Scan",
  "Share",
  "Connect",
  "Network",
  "Grow",
  "Link",
  "Build",
  "Collaborate",
  "Create",
];

export function MarqueeBanner() {
  return (
    <section className="relative py-8 md:py-12 overflow-hidden border-y border-white/10">
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
        className="flex items-center gap-8 md:gap-12 whitespace-nowrap"
      >
        {[...words, ...words, ...words, ...words].map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white/[0.07] uppercase tracking-wider select-none"
          >
            {word}
            <span className="text-[#7B93FF]/20 mx-4 md:mx-6">/</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}
