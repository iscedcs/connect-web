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
  },
  {
    number: "02",
    icon: QrCode,
    title: "Share Instantly",
    description:
      "Share via your QR code (online or offline version), a profile link, or upgrade to NFC smart devices like cards, wristbands, and badges.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Connect & Grow",
    description:
      "Your contacts see your full profile — no app needed on their end. Track views, exchange contacts, and build meaningful connections.",
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative"
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/10 bg-zinc-900/50 relative z-10">
                  <span className="text-xl md:text-2xl font-bold text-[#7B93FF] font-mono">
                    {step.number}
                  </span>
                </div>

                <div className="mt-6 md:mt-8">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#7B93FF]/10 mb-4">
                    <Icon size={18} className="text-[#7B93FF]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-xs mx-auto">
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
