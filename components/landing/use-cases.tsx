"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  Briefcase,
  Mic2,
  Palette,
  Building2,
  GraduationCap,
  Stethoscope,
} from "lucide-react";

const useCases = [
  {
    icon: Briefcase,
    title: "Professionals",
    description:
      "Executives, salespeople, and consultants who network frequently. Make every handshake count.",
  },
  {
    icon: Palette,
    title: "Creatives",
    description:
      "Designers, filmmakers, and artists. Showcase your portfolio, videos, and social presence in one link.",
  },
  {
    icon: Mic2,
    title: "Speakers & Influencers",
    description:
      "Share your booking link, latest content, and social profiles instantly at every event.",
  },
  {
    icon: Building2,
    title: "Teams & Companies",
    description:
      "Equip your entire team with branded digital cards. Consistent, professional, and trackable.",
  },
  {
    icon: GraduationCap,
    title: "Students & Graduates",
    description:
      "Stand out at career fairs. Share your resume, LinkedIn, and project links with a single tap.",
  },
  {
    icon: Stethoscope,
    title: "Service Providers",
    description:
      "Doctors, lawyers, coaches - share appointment booking, credentials, and contact info effortlessly.",
  },
];

export function UseCases() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="use-cases"
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
            Use Cases
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance"
          >
            Built for
            <span className="text-zinc-400"> Everyone</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 md:mt-6 text-base md:text-lg text-zinc-400 max-w-xl mx-auto"
          >
            From entrepreneurs to enterprise teams, Connect adapts to how you
            work and network.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={useCase.title}
                variants={fadeInUp}
                className="group relative p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-900/50 hover:border-[#7B93FF]/20 transition-all duration-500"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#7B93FF]/10 flex items-center justify-center group-hover:bg-[#7B93FF]/20 transition-colors">
                    <Icon size={18} className="text-[#7B93FF]" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {useCase.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
