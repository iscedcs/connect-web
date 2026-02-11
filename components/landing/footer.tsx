"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeIn } from "@/lib/animations";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "API"],
  Company: ["About ISCE", "Careers", "Blog", "Press"],
  Resources: ["Documentation", "Help Center", "Community", "Status"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.footer
      ref={ref}
      variants={fadeIn}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="border-t border-white/10 px-5 md:px-10 py-12 md:py-16"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#7B93FF]/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#7B93FF]" />
              </div>
              <span className="text-white font-semibold text-base tracking-tight">
                Connect
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[200px]">
              The future of professional networking, powered by ISCE Digital
              Concept.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-3 md:mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            {`\u00A9 ${new Date().getFullYear()} ISCE Digital Concept. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">
              Part of the{" "}
              <span className="text-[#7B93FF] font-medium">ISCE Ecosystem</span>
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
