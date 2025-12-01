"use client";

type Row = {
  id: string;
  iconSrc: string;
  title: string;
  subtitle: string;
  href: string;
};

export default function ConnectManagementList({
  title = "Connect management",
  subtitle = "Add links that will be accessible when your cards are scanned",
  rows,
  href = "/connect/links",
}: {
  title?: string;
  subtitle?: string;
  rows: Row[];
  href?: string;
}) {
  return (
    <div className="bg-[#151515]  stroke-[#868686] rounded-[22px] p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-medium text-white">{title}</h3>
          <p className="text-xs text-white/60 mt-1">{subtitle}</p>
        </div>

        <a href={href} className="text-3xl text-white/70">
          ›
        </a>
      </div>

      {/* Rows */}
      <div className="mt-6">
        {rows.map((r, index) => (
          <a
            key={r.id}
            href={r.href}
            className="flex items-center justify-between py-4 group">
            <div className="flex items-start gap-4 flex-1">
              {/* Icon */}
              <span className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={r.iconSrc}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              </span>

              {/* Text + Divider */}
              <div className="flex-1">
                <p className="text-[15px] text-white">{r.title}</p>
                <p className="text-xs text-white/50 mt-[2px]">{r.subtitle}</p>

                {/* Divider under text ONLY */}
                {index !== rows.length - 1 && (
                  <div className="mt-4 border-b border-white/10 w-full" />
                )}
              </div>
            </div>

            {/* Arrow */}
            <span className="text-3xl text-white/60 group-hover:text-white transition ml-4">
              ›
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
