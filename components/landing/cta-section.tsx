'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getSignUpUrl } from '@/lib/client-auth-urls';

export function CtaSection() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	return (
    <section
      id="cta"
      ref={ref}
      className="relative py-20 md:py-32 px-5 md:px-10"
    >
      <div className="max-w-[1000px] mx-auto relative">
        {/* Outer ambient glow */}
        <div
          className="absolute inset-0 -m-24 rounded-full pointer-events-none blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(123,147,255,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Gradient border wrapper */}
        <div
          className="relative rounded-3xl p-px"
          style={{
            background:
              "linear-gradient(135deg, rgba(123,147,255,0.35) 0%, rgba(199,125,255,0.18) 50%, rgba(123,147,255,0.12) 100%)",
          }}
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative rounded-3xl p-8 md:p-16 text-center overflow-hidden"
            style={{ background: "#08080f" }}
          >
            {/* Aurora inside card */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              <div
                className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[100px]"
                style={{ background: "rgba(123,147,255,0.07)" }}
              />
              <div
                className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[80px]"
                style={{ background: "rgba(199,125,255,0.05)" }}
              />
            </div>

            {/* Subtle grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
                maskImage:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
              }}
            />

            <motion.div variants={fadeInUp} className="relative">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm text-[#7B93FF] mb-6"
                style={{
                  border: "1px solid rgba(123,147,255,0.3)",
                  background: "rgba(123,147,255,0.06)",
                }}
              >
                <Sparkles size={14} />
                Join the future of networking
              </div>

              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance"
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                }}
              >
                Ready to Ditch
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #7B93FF 0%, #A5B8FF 50%, #C77DFF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Paper Cards?
                </span>
              </h2>

              <p className="mt-5 md:mt-6 text-base md:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Join thousands of professionals who have upgraded to Connect.
                Create your digital profile in minutes — share via QR code, NFC
                smart devices, or a simple link. Start free, no device required.
              </p>

              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <a
                  href={getSignUpUrl()}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm md:text-base font-semibold text-[#030014] transition-all duration-300 hover:shadow-[0_0_40px_rgba(123,147,255,0.35)]"
                  style={{
                    background: "linear-gradient(135deg, #7B93FF, #A5B8FF)",
                  }}
                >
                  Create Your Profile Free
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>
                <a
                  href="https://isce.tech/store"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm md:text-base font-medium text-white transition-colors duration-200"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Explore Smart Devices
                </a>
              </div>

              <p className="mt-5 text-xs text-zinc-500">
                No credit card required. Free plan available.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
