"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { UserPlus, QrCode, Share2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Sign up for free and build your digital identity. Add contacts, social links, portfolio, files, videos — everything that represents you.",
    accent: "#7B93FF",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Share Instantly",
    description:
      "Share via your QR code (online or offline version), a profile link, or upgrade to NFC smart devices like cards, wristbands, and badges.",
    accent: "#A5B8FF",
  },
  {
    number: "03",
    icon: Share2,
    title: "Connect & Grow",
    description:
      "Your contacts see your full profile — no app needed on their end. Track views, exchange contacts, and build meaningful connections.",
    accent: "#C77DFF",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-20 md:py-32 px-5 md:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
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
            How It Works
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Three Steps.
            <br className="hidden md:block" />
            <span className="text-zinc-400"> Zero Complexity.</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="group relative rounded-2xl p-7 md:p-9 overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] transition-all duration-500 cursor-default"
              >
                {/* Watermark step number */}
                <div
                  className="absolute -right-4 -bottom-6 text-[8rem] md:text-[10rem] font-black leading-none select-none transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.07]"
                  style={{
                    fontFamily: "var(--font-syne), sans-serif",
                    color: step.accent,
                    opacity: 0.04,
                  }}
                >
                  {step.number}
                </div>

                {/* Hover aurora tint */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(ellipse at 0% 100%, ${step.accent}07 0%, transparent 70%)`,
                  }}
                />

                <div className="relative">
                  {/* Step badge */}
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-md"
                      style={{
                        color: step.accent,
                        background: `${step.accent}15`,
                        border: `1px solid ${step.accent}25`,
                        fontFamily: "var(--font-syne), sans-serif",
                      }}
                    >
                      {step.number}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${step.accent}15`,
                        border: `1px solid ${step.accent}20`,
                      }}
                    >
                      <Icon size={15} style={{ color: step.accent }} />
                    </div>
                  </div>

                  <h3
                    className="text-lg md:text-xl font-bold text-white mb-3"
                    style={{ fontFamily: "var(--font-syne), sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
