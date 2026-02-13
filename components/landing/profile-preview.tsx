"use client";

import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Image from "next/image";

const screens = [
  {
    id: "profile",
    label: "Profile",
    src: "/images/previews/portfolio.png",
    alt: "Connect digital profile showing contact info, socials, and links",
  },
  {
    id: "qr-online",
    label: "QR Online",
    src: "/images/previews/online.png",
    alt: "Share profile via online QR code - scan to open full profile directly",
  },
  {
    id: "qr-offline",
    label: "QR Offline",
    src: "/images/previews/offline.png",
    alt: "Share profile via offline QR code - scan to save contact info",
  },
];

export function ProfilePreview() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeScreen, setActiveScreen] = useState(0);

  return (
    <section
      ref={ref}
      style={{ position: "relative" }}
      className="py-20 md:py-32 px-5 md:px-10 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <motion.div variants={fadeInUp}>
            <p className="text-[#7B93FF] text-sm font-medium tracking-widest uppercase mb-3">
              Your Digital Profile
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white text-balance">
              More Than a<span className="text-zinc-400"> Business Card</span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-zinc-400 leading-relaxed">
              Your Connect profile is a living, breathing representation of your
              professional identity. Rich with modules for contacts, socials,
              links, files, and more. Share it via NFC devices, QR codes, or
              just a link.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {[
                "Two QR modes: Online (full profile) & Offline (contact card)",
                "Share via NFC cards, wristbands, badges, or any smart device",
                "No device needed — start with just your QR code or link",
                "Update anytime, changes reflect instantly everywhere",
                "Analytics on profile views and interactions",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#7B93FF]/10 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7B93FF]" />
                  </div>
                  <span className="text-sm md:text-base text-zinc-400">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Phone mockup with real screenshots */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center lg:items-end gap-6">
            <div className="relative w-[280px] md:w-[320px]">
              {/* Phone frame */}
              <div className="relative rounded-[2.5rem] border-2 border-white/[0.06] bg-zinc-900/50 p-2 shadow-2xl shadow-[#7B93FF]/5">
                {/* Screen content with animation */}
                <div className="rounded-[2rem] bg-black overflow-hidden aspect-[9/19.5] relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeScreen}
                      initial={{
                        opacity: 0,
                        scale: 0.98,
                      }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0">
                      <Image
                        src={screens[activeScreen].src || "/placeholder.svg"}
                        alt={screens[activeScreen].alt}
                        fill
                        className="object-cover object-top"
                        sizes="320px"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900/50 rounded-b-2xl" />
              </div>

              {/* Glow effect behind phone */}
              <div className="absolute -inset-10 bg-[#7B93FF]/5 blur-3xl rounded-full -z-10" />
            </div>

            {/* Screen switcher tabs */}
            <div className="flex items-center gap-2">
              {screens.map((screen, index) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(index)}
                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                    activeScreen === index
                      ? "bg-[#7B93FF] text-[#030014]"
                      : "bg-white/[0.03] text-zinc-400 hover:bg-white/5 hover:text-white border border-white/10"
                  }`}>
                  {screen.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
