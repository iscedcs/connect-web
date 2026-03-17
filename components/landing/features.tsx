"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Nfc, QrCode, Shield, Zap, Globe, Layers } from "lucide-react";

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

        {/* Asymmetric bento grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          {/* Feature 1 — Wide hero card: NFC */}
          <motion.div
            variants={fadeInUp}
            className="group relative md:col-span-2 p-7 md:p-10 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-[#7B93FF]/40 transition-all duration-500 cursor-default"
          >
            <div className="absolute inset-0 bg-[#7B93FF]/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            {/* Decorative large icon watermark */}
            <Nfc
              size={160}
              className="absolute -right-6 -bottom-6 text-[#7B93FF]/[0.06] group-hover:text-[#7B93FF]/[0.1] transition-colors duration-500"
            />
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(123,147,255,0.18) 0%, rgba(165,184,255,0.10) 100%)",
                  border: "1px solid rgba(123,147,255,0.20)",
                }}
              >
                <Nfc size={24} className="text-[#7B93FF]" />
              </div>
              <h3
                className="text-xl md:text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {features[0].title}
              </h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
                {features[0].description}
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-[#7B93FF] font-medium">
                <span className="w-1 h-1 rounded-full bg-[#7B93FF] animate-pulse" />
                Works with any smartphone — no app required
              </div>
            </div>
          </motion.div>

          {/* Feature 2 — Tall right card: QR */}
          <motion.div
            variants={fadeInUp}
            className="group relative lg:row-span-2 p-7 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-[#A5B8FF]/40 transition-all duration-500 cursor-default"
          >
            <div className="absolute inset-0 bg-[#A5B8FF]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <QrCode
              size={140}
              className="absolute -right-4 -bottom-4 text-[#A5B8FF]/[0.06] group-hover:text-[#A5B8FF]/[0.10] transition-colors duration-500"
            />
            <div className="relative h-full flex flex-col">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: "rgba(165,184,255,0.12)",
                  border: "1px solid rgba(165,184,255,0.18)",
                }}
              >
                <QrCode size={22} className="text-[#A5B8FF]" />
              </div>
              <h3
                className="text-lg md:text-xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {features[1].title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {features[1].description}
              </p>
              {/* Visual QR mockup */}
              <div className="mt-auto pt-8 grid grid-cols-2 gap-3">
                {["Online QR", "Offline QR"].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      className="w-full aspect-square rounded-lg mb-2"
                      style={{
                        background: "rgba(165,184,255,0.08)",
                        backgroundImage:
                          "repeating-linear-gradient(0deg, rgba(165,184,255,0.1) 0px, rgba(165,184,255,0.1) 2px, transparent 2px, transparent 8px), repeating-linear-gradient(90deg, rgba(165,184,255,0.1) 0px, rgba(165,184,255,0.1) 2px, transparent 2px, transparent 8px)",
                      }}
                    />
                    <p className="text-[10px] text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Features 3–6 — Standard 2×2 sub-grid */}
          {features.slice(2).map((feature) => {
            const Icon = feature.icon;
            const accent =
              feature.icon === Layers
                ? "#C77DFF"
                : feature.icon === Zap
                  ? "#FBBF24"
                  : feature.icon === Shield
                    ? "#34D399"
                    : "#7B93FF";
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group relative p-6 md:p-7 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all duration-500 cursor-default"
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(ellipse at 0% 0%, ${accent}08 0%, transparent 60%)`,
                  }}
                />
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `${accent}15`,
                      border: `1px solid ${accent}20`,
                    }}
                  >
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
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
