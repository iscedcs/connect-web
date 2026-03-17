"use client";

import { motion } from "framer-motion";

const words = [
  { text: "Tap", accent: false },
  { text: "Scan", accent: false },
  { text: "Share", accent: true },
  { text: "Connect", accent: false },
  { text: "Network", accent: true },
  { text: "Grow", accent: false },
  { text: "Link", accent: false },
  { text: "Build", accent: true },
  { text: "Collaborate", accent: false },
  { text: "Create", accent: false },
];

const repeated = [...words, ...words, ...words, ...words];

export function MarqueeBanner() {
  return (
    <section className="relative py-10 md:py-14 overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7B93FF]/35 to-transparent" />
      {/* Gradient bottom border */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7B93FF]/20 to-transparent" />

      {/* Subtle ambient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7B93FF]/[0.025] via-transparent to-transparent pointer-events-none" />

      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#030014] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#030014] to-transparent z-10 pointer-events-none" />

      <motion.div
        animate={{ x: [0, "-50%"] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 32,
          ease: "linear",
        }}
        className="flex items-center whitespace-nowrap"
      >
        {repeated.map((word, i) => (
          <span
            key={`${word.text}-${i}`}
            className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-wider select-none"
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              color: word.accent
                ? "rgba(123,147,255,0.35)"
                : "rgba(255,255,255,0.06)",
              marginRight: "0",
            }}
          >
            {word.text}
            <span
              className="mx-5 md:mx-8"
              style={{ color: "rgba(123,147,255,0.18)" }}
            >
              ✦
            </span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}
