"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState, useEffect } from "react";

type Slide = {
  id: string;
  image: string; // card image
  title: string; // caption title (e.g., "Cards")
  subtitle: string; // small text
};

const defaultSlides: Slide[] = [
  {
    id: "1",
    image: "/assets/card.jpg",
    title: "Cards",
    subtitle: "Personalized to fit into your everyday lifestyle",
  },
  {
    id: "2",
    image: "/assets/2701e4aa55ab26bea712d31de18c7bcc5e655929.png",
    title: "Wristband",
    subtitle: "Seamless contactless experiences on the go",
  },

  {
    id: "3",
    image: "/assets/b31eff4fd906e021018be419d1f70aa5c7080e38.png",
    title: "Sticker",
    subtitle: "Stick and connect on any surface",
  },
];

export default function WearablesCarousel({
  slides = defaultSlides,
  autoplay = true,
  intervalMs = 3000,
}: {
  slides?: Slide[];
  autoplay?: boolean;
  intervalMs?: number;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1, spacing: 12 },
    slideChanged(s) {
      setCurrent(s.track.details.rel);
    },
  });

  useEffect(() => {
    if (!autoplay || !instanceRef.current) return;
    const id = setInterval(() => {
      if (!paused) instanceRef.current?.next();
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoplay, intervalMs, paused, instanceRef]);

  return (
    <div className="w-full">
      <div
        ref={sliderRef}
        className="keen-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>
        {slides.map((s) => (
          <div key={s.id} className="keen-slider__slide">
            {/* slide content column, centered */}
            <div className="flex flex-col items-center">
              {/* CONSISTENT MEDIA BOX */}
              <div className="w-full flex justify-center">
                {/* fixed-height box so layout doesn’t jump; images are centered & contained */}
                <div className="h-48 w-full max-w-sm rounded-2xl p-3 flex items-center justify-center">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                </div>
              </div>

              {/* caption section */}
              <div className="mt-5 text-center">
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-xs text-white/70 mt-1">{s.subtitle}</p>

                <button
                  type="button"
                  className="mt-3 inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-sm hover:bg-white/15">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => instanceRef.current?.moveToIdx(i)}
            className={`h-1.5 w-1.5 rounded-full transition ${
              current === i ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
