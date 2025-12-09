"use client";

import { RightIcon } from "@/lib/icons";

export default function ConnectList({ items }: { items: any[] }) {
  return (
    <section className="mt-6 px-4 md:px-0">
      <div className="bg-[#151515] rounded-[22px] p-6 md:max-w-3xl md:mx-auto md:rounded-xl md:border md:border-white/10 md:space-y-2">
        {items.map((item, index) => (
          <div key={item.id}>
            {/* Row */}
            <a
              href={item.url}
              target="_blank"
              className="flex items-center justify-between py-4 group
                         md:py-5 md:px-4 md:rounded-xl 
                         md:hover:bg-white/5 md:transition">
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <span className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={item.icon} className="w-6 h-6 object-contain" />
                </span>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-sm md:text-base font-medium text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-white/50 mt-[2px] truncate md:max-w-sm">
                    {item.url}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <span className="text-3xl text-white/60 group-hover:text-white transition ml-4">
                <RightIcon />
              </span>
            </a>

            {/* Divider (mobile only) */}
            {index !== items.length - 1 && (
              <div className="flex md:hidden">
                <div className="border-b border-white/10 flex-1 ml-[56px]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
