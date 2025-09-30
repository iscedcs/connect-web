"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialSlides: Slide[] = [
  {
    id: 1,
    icon: "/assets/rainbow_95231491.svg",
    title: "Request for your contactless device!",
    subtitle: "Make an order request",
  },
  {
    id: 2,
    icon: "/assets/rainbow_95231491.svg",
    title: "Virtual & Offline bookings",
    subtitle: "Host, Attend & Bookmark events",
  },
  {
    id: 3,
    icon: "/assets/rainbow_95231491.svg",
    title: "Contactless Wallet",
    subtitle: "Free & fast transactions",
  },
];

export default function PromoBanner() {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  // Auto slide every 3s
  useEffect(() => {
    if (!instanceRef.current) return;
    const interval = setInterval(() => {
      if (!paused) {
        instanceRef.current?.next();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paused, instanceRef]);

  const handleRemoveSlide = (id: number) => {
    const updatedSlides = slides.filter((s) => s.id !== id);
    setSlides(updatedSlides);
    setCurrentSlide(0); // reset to first slide if needed
  };

  if (slides.length === 0) return null;

  return (
    <div className="w-full">
      {/* Slider */}
      <div
        ref={sliderRef}
        className="keen-slider rounded-2xl overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="keen-slider__slide bg-neutral-900 p-4 flex items-center gap-3 relative">
            {/* Left Icon */}
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={slide.icon} alt="" className="w-8 h-8" />
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <p className="text-sm font-medium">{slide.title}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{slide.subtitle}</span>
                <span className="text-lg">›</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => handleRemoveSlide(slide.id)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            className={`h-2 w-2 rounded-full transition-colors ${
              currentSlide === idx ? "bg-white" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
