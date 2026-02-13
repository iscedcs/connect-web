"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, fadeIn } from "@/lib/animations";
import { ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5 md:px-10">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full bg-[#7B93FF]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#7B93FF]/[0.03] blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div variants={fadeInUp} className="mb-6 md:mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs md:text-sm text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B93FF] animate-pulse" />
            ISCE Ecosystem
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={fadeInUp}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-balance">
          <span className="text-white">Your Identity.</span>
          <br />
          <span className="text-[#7B93FF]">One Tap. One Scan.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeInUp}
          className="mt-5 md:mt-8 text-base md:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-pretty">
          Connect replaces paper business cards with a powerful digital profile.
          Share via NFC smart devices, QR codes, or a simple link — no app
          needed. Start sharing for free, no device required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeInUp}
          className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href="/dashboard"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#7B93FF] text-[#030014] px-7 py-3.5 rounded-lg text-sm md:text-base font-medium hover:bg-[#7B93FF]/90 transition-all duration-200">
            Create Your Profile Free
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/10 bg-transparent text-white px-7 py-3.5 rounded-lg text-sm md:text-base font-medium hover:bg-white/5 transition-colors duration-200">
            See How It Works
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeIn}
          className="mt-16 md:mt-20 grid grid-cols-3 gap-6 md:gap-10 max-w-lg mx-auto">
          {[
            { value: "10K+", label: "Active Users" },
            { value: "50K+", label: "Connections Made" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-zinc-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}>
          <ChevronDown size={20} className="text-zinc-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
