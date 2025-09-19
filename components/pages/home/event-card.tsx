"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EventCard() {
  return (
    <div className="bg-neutral-900 rounded-2xl p-5 flex flex-col gap-4">
      {/* Icon */}
      <div className="w-12 h-12">
        <img
          src="/assets/91d6f749cf29b08243e458824c8229e483783de4.gif"
          alt="Event Icon"
          className="w-12 h-12"
        />
      </div>

      {/* Text + Arrow */}
      <div>
        <p className="text-xs text-gray-400">
          Virtual & Offline bookings available
        </p>
        <div className="flex items-center justify-between mt-1">
          <h3 className="text-base font-medium leading-tight">
            Host, Attend & Bookmark events near you
          </h3>
          <Link href="/events">
            <span className="text-xl hover:translate-x-1 transition-transform">
              <ArrowRight />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
