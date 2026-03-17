"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeIn } from "@/lib/animations";
import { Twitter, Linkedin, Instagram } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "API"],
  Company: ["About ISCE", "Careers", "Blog", "Press"],
  Resources: ["Documentation", "Help Center", "Community", "Status"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/iscetech", label: "Twitter" },
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/iscetech",
    label: "LinkedIn",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/iscetech",
    label: "Instagram",
  },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.footer
      ref={ref}
      variants={fadeIn}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative px-5 md:px-10 pt-12 md:pt-16 pb-8"
    >
      {/* Gradient top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7B93FF]/30 to-transparent" />

      {/* Subtle ambient bg */}
      <div
        className="absolute top-0 inset-x-0 h-[200px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(123,147,255,0.02), transparent)",
        }}
      />

      <div className="max-w-[1200px] mx-auto relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(123,147,255,0.25), rgba(199,125,255,0.15))",
                  border: "1px solid rgba(123,147,255,0.2)",
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #7B93FF, #A5B8FF)",
                  }}
                />
              </div>
              <span
                className="text-white font-semibold text-base tracking-tight"
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                }}
              >
                Connect
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[200px] mb-6">
              The future of professional networking, powered by ISCE Digital
              Concept.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 transition-all duration-200"
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#7B93FF";
                    e.currentTarget.style.borderColor = "rgba(123,147,255,0.3)";
                    e.currentTarget.style.background = "rgba(123,147,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-[0.12em] mb-3 md:mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200"
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
        <div className="mt-12 md:mt-16 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Gradient top border on bottom bar */}
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)",
              marginTop: "-1px",
            }}
          />
          <p className="text-xs text-zinc-500">
            {`\u00A9 ${new Date().getFullYear()} ISCE Digital Concept. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">
              Part of the{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #7B93FF, #A5B8FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 500,
                }}
              >
                ISCE Ecosystem
              </span>
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
