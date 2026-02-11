"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  Nfc,
  QrCode,
  Shield,
  Zap,
  Globe,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Nfc,
    title: "NFC Smart Devices",
    description:
      "Tap your Connect card, wristband, badge, or any NFC-enabled device on a smartphone to instantly share your profile. No app needed.",
  },
  {
    icon: QrCode,
    title: "QR Codes — Online & Offline",
    description:
      "Two QR codes per profile: an Online code that opens your full profile, and an Offline code that saves your contact with key info directly.",
  },
  {
    icon: Layers,
    title: "Modular Profiles",
    description:
      "Build your digital identity with customizable modules — contacts, links, socials, files, videos, meetings, forms, and more.",
  },
  {
    icon: Zap,
    title: "No Device? No Problem.",
    description:
      "Start sharing immediately using just your QR code or profile link. Get a smart device later, or never — the choice is yours.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description:
      "Built on the ISCE auth system with enterprise-grade security. You control what you share and who sees it.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      "Compatible with all modern smartphones. Your profile works seamlessly across iOS and Android — no app install required for your contacts.",
  },
];

export function Features() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-20 md:py-32 px-5 md:px-10"
    >
      {/* Section divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

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
            Features
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance"
          >
            Everything You Need
            <br className="hidden md:block" />
            <span className="text-zinc-400"> to Network Smarter</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group relative p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-900/50 hover:bg-white/[0.03] transition-all duration-500 hover:border-[#7B93FF]/30"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-[#7B93FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#7B93FF]/10 flex items-center justify-center mb-4 md:mb-5 group-hover:bg-[#7B93FF]/20 transition-colors duration-300">
                    <Icon
                      size={20}
                      className="text-[#7B93FF]"
                    />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {feature.description}
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
