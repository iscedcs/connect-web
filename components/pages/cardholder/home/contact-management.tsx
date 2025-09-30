"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { scaleSlides } from "@/lib/utils";
import Link from "next/link";

const icons = [
  { src: "/assets/logos_youtube-icon.svg", alt: "YouTube" },
  { src: "/assets/Ellipse9.svg", alt: "Connect" },
  { src: "/assets/336333cb08daaa72b8ac20c655e5f8de719c62f0.png", alt: "Links" },
  { src: "/assets/logos_bitcoin.svg", alt: "Bitcoin" },
  { src: "/assets/logos_spotify-icon.svg", alt: "Spotify" },
];

export default function ConnectManagement() {
  const [paused, setPaused] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: "precision",
    slides: { perView: 5, spacing: 12, origin: "center" },
    created: scaleSlides,
    slideChanged: scaleSlides,
  });

  // autoscroll
  useEffect(() => {
    const id = setInterval(() => !paused && instanceRef.current?.next(), 2200);
    return () => clearInterval(id);
  }, [paused, instanceRef]);

  return (
    <div className="bg-neutral-900 rounded-2xl p-5 text-center">
      <h3 className="text-lg font-medium">Connect management</h3>
      <p className="text-sm text-gray-400">
        Add links that will be accessible when your cards are scanned
      </p>

      {/* Icon rail */}
      <div
        ref={sliderRef}
        className="keen-slider mt-4 px-2 overflow-visible"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>
        {icons.map((i, idx) => (
          <div
            key={idx}
            className="keen-slider__slide flex items-center justify-center py-3 overflow-visible" // <-- give vertical padding
          >
            <div className="icon-bubble transition-transform duration-300 ease-out">
              <img
                src={i.src}
                alt={i.alt}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Link href="/connect/links">
          <Button variant="secondary" className="rounded-full px-6">
            Add links
          </Button>
        </Link>
      </div>

      <style jsx>{`
        /* base bubble; scales up without clipping */
        .icon-bubble {
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          background: #151515;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* force container to allow scaled children to show fully */
        :global(.keen-slider) {
          overflow: visible;
        }
        :global(.keen-slider__slide) {
          overflow: visible;
        }
      `}</style>
    </div>
  );
}
