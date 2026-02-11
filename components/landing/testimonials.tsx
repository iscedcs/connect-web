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
      "Connect has completely transformed how our team networks at events. We went from printing 500 business cards per quarter to zero. The ROI is incredible.",
    rating: 5,
  },
  {
    name: "Fatima Al-Hassan",
    role: "Freelance Brand Strategist",
    quote:
      "I love that I can update my portfolio link, add new testimonials, and adjust my booking calendar - all reflected instantly on my card. Game changer.",
    rating: 5,
  },
  {
    name: "Oluwaseun Adeyemi",
    role: "Head of Sales, Paystack",
    quote:
      "The NFC tap never fails to impress prospects. It's a conversation starter and it makes following up seamless. Our close rate went up 30%.",
    rating: 5,
  },
];

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
          >
            Loved by
            <span className="text-zinc-400"> Professionals</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              className="group p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-900/50 hover:border-[#7B93FF]/20 transition-all duration-500"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={`star-${testimonial.name}-${i}`}
                    size={14}
                    className="text-[#7B93FF] fill-[#7B93FF]"
                  />
                ))}
              </div>

              <blockquote className="text-sm md:text-base text-zinc-400 leading-relaxed mb-6">
                {`"${testimonial.quote}"`}
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#7B93FF]/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#7B93FF]">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
