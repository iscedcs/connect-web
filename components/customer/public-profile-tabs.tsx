"use client";

import { useState } from "react";
import { EventCard } from "@/components/customer/event-card";
import { RightIcon } from "@/lib/icons";

export default function PublicProfileTabs({
  connectItems,
  events,
}: {
  connectItems: any[];
  events: any[];
}) {
  const [activeTab, setActiveTab] = useState<"connect" | "events">("connect");

  return (
    <>
      <section className="mt-6 px-4 flex gap-8 text-base">
        <button
          onClick={() => setActiveTab("connect")}
          className={`pb-2 ${
            activeTab === "connect"
              ? "font-semibold border-b-2 border-white"
              : "text-white/50"
          }`}>
          Connect
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`pb-2 ${
            activeTab === "events"
              ? "font-semibold border-b-2 border-white"
              : "text-white/50"
          }`}>
          Events
        </button>
      </section>

      {activeTab === "connect" && (
        <section className="mt-6 px-4">
          <div className="bg-[#151515] rounded-[22px] rounded-b-none p-4 pt-1">
            {connectItems.map((item, index) => (
              <div key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  className="flex items-center justify-between py-4 group">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={item.icon}
                        alt=""
                        className="w-6 h-6 object-contain"
                      />
                    </span>

                    <div className="flex-1">
                      <p className="text-sm text-white">{item.title}</p>
                      <p className="text-[10px] text-white/50 mt-[2px] truncate max-w-[180px] block">
                        {item.url}
                      </p>
                    </div>
                  </div>

                  <span className="text-3xl text-white/60 group-hover:text-white transition ml-4">
                    <RightIcon />
                  </span>
                </a>

                {index !== connectItems.length - 1 && (
                  <div className="border-b border-white/10 flex-1 ml-[56px]" />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "events" && (
        <section className="px-4 mt-6 space-y-2">
          {events.length === 0 && (
            <p className="text-white/40 text-sm">No events found</p>
          )}

          {events.map((event: any) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
    </>
  );
}
