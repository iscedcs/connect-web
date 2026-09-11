"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useMemo, useState } from "react";
import { X, CreditCard, Zap, CalendarDays, Wallet, UserCircle } from "lucide-react";
import Link from "next/link";

interface PromoBannerProps {
  hasDevices: boolean;
  hasEvents: boolean;
  profileComplete: boolean;
}

interface ContextualSlide {
  id: number;
  icon: React.ReactNode;
  href: string;
  title: string;
  subtitle: string;
  showWhen: (ctx: PromoBannerProps) => boolean;
}

const DISMISSED_KEY = "connect_promo_dismissed";

function getDismissedIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistDismissal(id: number) {
  const dismissed = getDismissedIds();
  if (!dismissed.includes(id)) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, id]));
  }
}

const allSlides: ContextualSlide[] = [
  {
    id: 1,
    icon: <CreditCard className="w-8 h-8 text-blue-500" />,
    href: "https://www.isce.tech/store",
    title: "Request for your contactless device!",
    subtitle: "Make an order request",
    showWhen: (ctx) => !ctx.hasDevices,
  },
  {
    id: 2,
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    href: "/connect",
    title: "Activate a new device",
    subtitle: "By scanning or tapping",
    showWhen: (ctx) => !ctx.hasDevices,
  },
  {
    id: 3,
    icon: <CalendarDays className="w-8 h-8 text-green-500" />,
    href: "https://www.gada.isce.tech",
    title: "Virtual & Offline bookings",
    subtitle: "Host, Attend & Bookmark events",
    showWhen: (ctx) => !ctx.hasEvents,
  },
  {
    id: 4,
    icon: <Wallet className="w-8 h-8 text-purple-500" />,
    href: "/wallet",
    title: "Contactless Wallet",
    subtitle: "Free & fast transactions",
    showWhen: () => true,
  },
  {
    id: 5,
    icon: <UserCircle className="w-8 h-8 text-orange-500" />,
    href: "/profile",
    title: "Complete your profile",
    subtitle: "Add your details to stand out",
    showWhen: (ctx) => !ctx.profileComplete,
  },
];

export default function PromoBanner({
  hasDevices,
  hasEvents,
  profileComplete,
}: PromoBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, []);

  const visibleSlides = useMemo(() => {
    const ctx = { hasDevices, hasEvents, profileComplete };
    return allSlides
      .filter((s) => s.showWhen(ctx))
      .filter((s) => !dismissedIds.includes(s.id));
  }, [hasDevices, hasEvents, profileComplete, dismissedIds]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: visibleSlides.length > 1,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  useEffect(() => {
    setCurrentSlide(0);
    instanceRef.current?.update({ loop: visibleSlides.length > 1 });
    instanceRef.current?.moveToIdx(0, true, { duration: 0 });
  }, [visibleSlides.length, instanceRef]);

  useEffect(() => {
    if (visibleSlides.length <= 1) return;
    const interval = setInterval(() => {
      if (!paused && instanceRef.current) {
        instanceRef.current.next();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paused, visibleSlides.length, instanceRef]);

  const handleDismiss = (id: number) => {
    persistDismissal(id);
    setDismissedIds((prev) => [...prev, id]);
  };

  if (visibleSlides.length === 0) return null;

  return (
    <div className="w-full">
      <div
        ref={sliderRef}
        className="keen-slider rounded-2xl overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {visibleSlides.map((slide) => (
          <div
            key={slide.id}
            className="keen-slider__slide bg-neutral-900 p-4 flex items-center gap-3 relative"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {slide.icon}
            </div>

            <div className="flex flex-col">
              <p className="text-sm font-medium">{slide.title}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Link href={slide.href!} className="gap-2 space-x-1.5">
                  <span>{slide.subtitle}</span>
                  <span className="text-lg">›</span>
                </Link>
              </div>
            </div>

            <button
              aria-label="Dismiss"
              onClick={() => handleDismiss(slide.id)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {visibleSlides.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {visibleSlides.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentSlide === idx ? "bg-white" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
