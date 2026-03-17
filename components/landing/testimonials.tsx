"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Chinedu Eze",
    role: "CEO, TechBridge Africa",
    quote:
      "Connect has completely transformed how our team networks at events. We went from printing 500 business cards per quarter to zero. The ROI is incredible — our team closes faster, follows up smarter, and our brand looks sharper in every room.",
    rating: 5,
    accent: "#7B93FF",
  },
  {
    name: "Fatima Al-Hassan",
    role: "Freelance Brand Strategist",
    quote:
      "I love that I can update my portfolio link, add new testimonials, and adjust my booking calendar — all reflected instantly on my card. Game changer.",
    rating: 5,
    accent: "#A5B8FF",
  },
  {
    name: "Oluwaseun Adeyemi",
    role: "Head of Sales, Paystack",
    quote:
      "The NFC tap never fails to impress prospects. It's a conversation starter and it makes following up seamless. Our close rate went up 30%.",
    rating: 5,
    accent: "#C77DFF",
  },
];

function StarRow({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex items-center gap-1 mb-5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} style={{ color, fill: color }} />
      ))}
    </div>
  );
}

function Avatar({ name, accent }: { name: string; accent: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: `${accent}18`,
        border: `1.5px solid ${accent}50`,
        boxShadow: `0 0 12px ${accent}18`,
      }}
    >
      <span className="text-xs font-bold" style={{ color: accent }}>
        {initials}
      </span>
    </div>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [hero, ...rest] = testimonials;

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-5 md:px-10">
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
            Testimonials
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Loved by
            <span className="text-zinc-400"> Professionals</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
        >
          {/* Hero testimonial — full width */}
          <motion.div
            variants={fadeInUp}
            className="group relative md:col-span-2 p-8 md:p-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all duration-500 hover:border-[#7B93FF]/25"
            style={{
              transition: "border-color 0.5s, box-shadow 0.5s",
            }}
            whileHover={{
              boxShadow: "0 0 40px rgba(123,147,255,0.07)",
            }}
          >
            {/* Decorative quote mark */}
            <div
              className="absolute top-4 right-6 leading-none font-black select-none pointer-events-none"
              aria-hidden="true"
              style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontSize: "clamp(7rem, 12vw, 11rem)",
                color: hero.accent,
                opacity: 0.05,
                lineHeight: 1,
              }}
            >
              &ldquo;
            </div>

            <StarRow count={hero.rating} color={hero.accent} />

            <blockquote
              className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-8 max-w-3xl"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              &ldquo;{hero.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3">
              <Avatar name={hero.name} accent={hero.accent} />
              <div>
                <p className="text-sm font-semibold text-white">{hero.name}</p>
                <p className="text-xs text-zinc-500">{hero.role}</p>
              </div>
            </div>
          </motion.div>

          {/* Smaller testimonials */}
          {rest.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              className="group relative p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all duration-500"
              whileHover={{
                borderColor: `${testimonial.accent}35`,
                boxShadow: `0 0 32px ${testimonial.accent}08`,
              }}
            >
              {/* Decorative quote mark */}
              <div
                className="absolute top-3 right-5 leading-none font-black select-none pointer-events-none"
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontSize: "6rem",
                  color: testimonial.accent,
                  opacity: 0.05,
                  lineHeight: 1,
                }}
              >
                &ldquo;
              </div>

              <StarRow count={testimonial.rating} color={testimonial.accent} />

              <blockquote className="text-sm md:text-base text-zinc-400 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <Avatar name={testimonial.name} accent={testimonial.accent} />
                <div>
                  <p className="text-sm font-medium text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
