import Image from "next/image";

export function EventCard({ event }: any) {
  const date = new Date(event.startDate);

  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  const weekday = date.toLocaleString("en-US", {
    weekday: "short",
  });

  return (
    <a
      href={`/events/${event.cleanName ?? event.id}`}
      className="flex items-start justify-between py-4 ">
      {/* LEFT: IMAGE + DETAILS */}
      <div className="flex items-start gap-4">
        <Image
          src={event.image}
          alt={event.title}
          width={100}
          height={100}
          quality={100}
          className="w-10 h-10 rounded-lg object-cover"
        />

        <div>
          <p className="font-normal capitalize">{event.title}</p>

          <p className="text-[8px] text-white/60 ">
            {weekday}, {event.time ?? "Time TBA"}·
            {event.location ?? "Location TBA"}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-black border border-[#8A8A8A] rounded-xl w-[50px] py-[3px] relative">
        {/* TOP HALF */}
        <div className="w-full flex flex-col items-center pb-[1px]">
          <span className="text-[10px] text-[#D0D0D0] tracking-wider leading-none">
            {month}
          </span>
        </div>

        {/* DIVIDER LINE */}
        <div className="absolute top-[50%] left-0 w-full border-t border-white/10" />

        {/* BOTTOM HALF */}
        <div className="w-full flex flex-col items-center pt-3">
          <span className="text-[15px] font-semibold text-white leading-none">
            {day}
          </span>
        </div>
      </div>
    </a>
  );
}
