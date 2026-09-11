"use client";

import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Orb from "@/components/originkit/ui/cosmic-orb";

interface EventItem {
  id: string;
  title: string;
  cleanName: string;
  startDate: string | null;
  time: string | null;
  location: string | null;
  image: string | null;
}

interface EventCardProps {
  events?: EventItem[];
  compact?: boolean;
}

const EVENTS_WEB_URL =
  process.env.NEXT_PUBLIC_EVENTS_WEB_URL || "https://gada.isce.tech";

function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Single event row */
function EventRow({ event }: { event: EventItem }) {
  const eventUrl = `${EVENTS_WEB_URL}/user/events/${event.cleanName}`;
  const dateLabel = formatEventDate(event.startDate);

  return (
    <Link
      href={eventUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 transition-colors hover:bg-white/10"
    >
      {/* Thumbnail */}
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-white/10">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CalendarDays className="size-6 text-white/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">{event.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
          {dateLabel && (
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3" />
              {dateLabel}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="size-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>
      </div>

      <ArrowRight className="size-4 flex-shrink-0 text-white/40" />
    </Link>
  );
}

/** Fallback card shown when the user has no events */
function EmptyEventsCard() {
  return (
    <div className="bg-neutral-900 rounded-3xl p-8 flex flex-col gap-8">
      <Orb size={80} />
      <div>
        <p className="text-[12px] text-white/60">
          Virtual & Offline bookings available
        </p>
        <div className="flex items-start justify-between mt-3">
          <h3 className="text-[22px] leading-[1.2] font-normal w-[75%]">
            Host, Attend & Bookmark
            <br /> events near you
          </h3>
          <Link href={EVENTS_WEB_URL} target="_blank" rel="noopener noreferrer">
            <ArrowRight className="size-5 mt-1 text-white hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EventCard({ events = [], compact }: EventCardProps) {
  if (events.length === 0) {
    return <EmptyEventsCard />;
  }

  const displayedEvents = events.slice(0, compact ? 2 : 3);
  const manageUrl = `${EVENTS_WEB_URL}/user/events?tab=manage`;

  return (
    <div className="bg-neutral-900 rounded-3xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-white">Your Events</h3>
        <Link
          href={manageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Event list */}
      <div className="flex flex-col gap-2">
        {displayedEvents.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
