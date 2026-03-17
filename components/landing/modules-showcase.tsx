'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import {
  User,
  Link2,
  Video,
  Share2,
  Calendar,
  CalendarCheck,
  Music,
  FileText,
  ClipboardList,
} from "lucide-react";

const modules = [
  {
    icon: User,
    accent: "#3B82F6",
    name: "Contact",
    description:
      "Share phone numbers, emails, websites, and addresses. Your digital business card.",
  },
  {
    icon: Link2,
    accent: "#06B6D4",
    name: "Links",
    description:
      "Curate a list of important links — portfolios, projects, publications, and more.",
  },
  {
    icon: Video,
    accent: "#EF4444",
    name: "Videos",
    description:
      "Showcase video content directly on your profile. Perfect for creators and marketers.",
  },
  {
    icon: Share2,
    accent: "#A855F7",
    name: "Socials",
    description:
      "Consolidate your online presence — LinkedIn, X, Instagram, TikTok, and more.",
  },
  {
    icon: Calendar,
    accent: "#22C55E",
    name: "Meetings",
    description:
      "Link your calendar tools to let connections book time directly from your profile.",
  },
  {
    icon: CalendarCheck,
    accent: "#10B981",
    name: "Appointments",
    description:
      "Manage bookings for consultants, coaches, therapists, and service professionals.",
  },
  {
    icon: Music,
    accent: "#1DB954",
    name: "Spotify",
    description:
      "Share your favorite music, playlists, and podcasts. Add personality to your profile.",
  },
  {
    icon: FileText,
    accent: "#F59E0B",
    name: "Files",
    description:
      "Distribute resumes, portfolios, price lists, and marketing materials with ease.",
  },
  {
    icon: ClipboardList,
    accent: "#EC4899",
    name: "Forms",
    description:
      "Collect leads, feedback, and registrations with custom forms on your profile.",
  },
];

export function ModulesShowcase() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeModule, setActiveModule] = useState(0);

  const active = modules[activeModule];
  const ActiveIcon = active.icon;

  return (
    <section
      id="modules"
      ref={ref}
      className="relative py-20 md:py-32 px-5 md:px-10"
    >
      {/* Background accents */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#7B93FF]/[0.03] blur-[150px] rounded-full" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#C77DFF]/[0.02] blur-[130px] rounded-full" />
      </div>

      <div className="max-w-[1200px] mx-auto relative">
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
            Modules
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Your Profile,
            <br className="hidden md:block" />
            <span className="text-zinc-400"> Your Rules.</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 md:mt-6 text-base md:text-lg text-zinc-400 max-w-xl mx-auto"
          >
            Mix and match 9 powerful modules to build a profile that truly
            represents you.
          </motion.p>
        </motion.div>

        {/* Interactive module display */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8"
        >
          {/* Module list */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-2 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none"
          >
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              const isActive = activeModule === i;
              return (
                <button
                  key={mod.name}
                  onClick={() => setActiveModule(i)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap lg:whitespace-normal transition-all duration-300 min-w-fit lg:min-w-0"
                  style={
                    isActive
                      ? {
                          background: `${mod.accent}12`,
                          border: `1px solid ${mod.accent}40`,
                          color: "#fff",
                        }
                      : {
                          background: "transparent",
                          border: "1px solid transparent",
                          color: "#71717a",
                        }
                  }
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                    style={
                      isActive
                        ? { background: `${mod.accent}20` }
                        : {
                            background: "rgba(255,255,255,0.04)",
                          }
                    }
                  >
                    <Icon
                      size={15}
                      style={{
                        color: isActive ? mod.accent : "#71717a",
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{mod.name}</span>
                  {isActive && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 hidden lg:block"
                      style={{ background: mod.accent }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Module detail */}
          <motion.div variants={fadeInUp} className="lg:col-span-3">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-hidden min-h-[280px] md:min-h-[340px] flex flex-col justify-between p-8 md:p-10"
              style={{
                border: `1px solid ${active.accent}28`,
                background: `radial-gradient(ellipse 80% 80% at 10% 20%, ${active.accent}0e 0%, transparent 60%), #09090f`,
              }}
            >
              {/* Watermark icon */}
              <div
                className="absolute -right-6 -bottom-6 pointer-events-none select-none"
                aria-hidden="true"
              >
                <ActiveIcon
                  size={190}
                  style={{
                    color: active.accent,
                    opacity: 0.06,
                  }}
                  strokeWidth={1}
                />
              </div>

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${active.accent}18`,
                      border: `1px solid ${active.accent}35`,
                    }}
                  >
                    <ActiveIcon size={26} style={{ color: active.accent }} />
                  </div>
                  <div>
                    <h3
                      className="text-2xl md:text-3xl font-bold text-white"
                      style={{
                        fontFamily: "var(--font-syne), sans-serif",
                      }}
                    >
                      {active.name}
                    </h3>
                    <p
                      className="text-xs font-medium tracking-widest uppercase mt-0.5"
                      style={{ color: active.accent }}
                    >
                      Module {String(activeModule + 1).padStart(2, "0")}
                    </p>
                  </div>
                </div>

                <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-lg">
                  {active.description}
                </p>
              </div>

              {/* Dot indicator */}
              <div className="relative mt-8 flex items-center gap-2">
                {modules.map((m, i) => (
                  <button
                    key={`dot-${m.name}`}
                    onClick={() => setActiveModule(i)}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeModule ? 32 : 8,
                      background:
                        i === activeModule
                          ? active.accent
                          : "rgba(255,255,255,0.08)",
                    }}
                    aria-label={`View ${m.name} module`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
