"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EventSlider() {
  const [paused, setPaused] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(slider) {},
  });

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused) instanceRef.current?.next();
    }, 3000);
    return () => clearInterval(interval);
  }, [paused, instanceRef]);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div ref={sliderRef} className="keen-slider">
        {/* ------------------------------------------------------------------ */}
        {/* SLIDE 1 — "Host, Attend & Bookmark" CARD */}
        {/* ------------------------------------------------------------------ */}
        <div className="keen-slider__slide">
          <div className="bg-neutral-900 rounded-3xl p-8 flex flex-col gap-8">
            {/* Icon */}
            <img
              src="/assets/91d6f749cf29b08243e458824c8229e483783de4.gif"
              alt="Event Icon"
              className="w-20 h-20"
            />

            {/* Text */}
            <div>
              <p className="text-[12px] text-white/60">
                Virtual & Offline bookings available
              </p>

              <div className="flex items-start justify-between mt-3">
                <h3 className="text-[22px] leading-[1.2] font-normal w-[75%]">
                  Host, Attend & Bookmark
                  <br /> events near you
                </h3>

                <Link href="/events">
                  <ArrowRight className="size-5 mt-1 text-white hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SLIDE 2 — FOUNDERS & FUNDERS EVENT CARD */}
        {/* ------------------------------------------------------------------ */}
        <div className="keen-slider__slide">
          <div className="relative w-full h-[280px] rounded-3xl overflow-hidden">
            {/* Background Image */}
            <Image
              src="/assets/Rectangle.png"
              alt="Event"
              fill
              className="object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-5">
              {/* TOP */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-black/60 text-white text-sm font-medium">
                  <span>24</span>
                  <span className="text-[11px]">Sept</span>
                </div>

                <div className="text-white">
                  <p className="text-sm text-white/90">Lagos, Nigeria</p>
                  <p className="text-base font-semibold">AMG workspace</p>
                </div>
              </div>

              {/* BOTTOM */}
              <div className="flex justify-between">
                <div className="flex-col">
                  <p className="text-xs text-white/70 mb-1">
                    Hosted by Ignatius Emeka
                  </p>

                  <h2 className="text-2xl leading-[1.2] font-medium text-white ">
                    Founders & Funders
                    <br /> mixer event
                  </h2>
                </div>
                <div className="flex items-center mt-3 ">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src="/assets/Ellipse.png"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden -ml-4">
                    <img
                      src="/assets/Ellipse123.png"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white -ml-4 relative flex items-center justify-center">
                    <img
                      src="/assets/Ellipse125.png"
                      className="w-full h-full object-cover opacity-0"
                    />
                    <span className="absolute text-black text-sm font-semibold">
                      240+
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-3">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => instanceRef.current?.moveToIdx(i)}
            className="h-2 w-2 rounded-full bg-white/40 hover:bg-white transition-all"
          />
        ))}
      </div>
    </div>
  );
}
