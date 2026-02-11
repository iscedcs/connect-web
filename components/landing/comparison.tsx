"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { X, Check } from "lucide-react";

const paperCardProblems = [
  "Gets lost or thrown away",
  "Outdated information after reprints",
  "No analytics or tracking",
  "Wasteful and not eco-friendly",
  "Limited to text and a logo",
  "Expensive bulk printing costs",
];

const connectAdvantages = [
  "Always accessible — QR code, link, or NFC device",
  "Update anytime, changes reflect instantly",
  "Track profile views and interactions",
  "Zero paper waste, fully digital",
  "Videos, links, files, social media, and more",
  "No device needed — start sharing for free",
];

export function Comparison() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-5 md:px-10">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-14 md:mb-20"
        >
          <motion.p
            variants={fadeInUp}
            className="text-[#7B93FF] text-sm font-medium tracking-widest uppercase mb-3"
          >
            Why Connect
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance"
          >
            Paper Cards Are
            <span className="text-zinc-400"> Dead.</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
        >
          {/* Paper card column */}
          <motion.div
            variants={fadeInUp}
            className="p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-900/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <X size={18} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-400">
                Paper Business Cards
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {paperCardProblems.map((problem) => (
                <div key={problem} className="flex items-start gap-3">
                  <X
                    size={16}
                    className="text-red-500/60 mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-zinc-400">
                    {problem}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Connect column */}
          <motion.div
            variants={fadeInUp}
            className="p-6 md:p-8 rounded-2xl border border-[#7B93FF]/30 bg-[#7B93FF]/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#7B93FF]/10 flex items-center justify-center">
                <Check size={18} className="text-[#7B93FF]" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Connect by ISCE
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {connectAdvantages.map((advantage) => (
                <div key={advantage} className="flex items-start gap-3">
                  <Check
                    size={16}
                    className="text-[#7B93FF] mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-white/80">
                    {advantage}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
