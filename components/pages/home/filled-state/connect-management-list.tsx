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
  href = "/connect-management",
}: {
  title?: string;
  subtitle?: string;
  rows: Row[];
  href?: string;
}) {
  return (
    <div className="bg-neutral-900 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-xs text-white/70">{subtitle}</p>
        </div>
        <a href={href} className="text-xl">
          ›
        </a>
      </div>

      <div className="mt-4 divide-y divide-white/10">
        {rows.map((r) => (
          <a
            key={r.id}
            href={r.href}
            className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center">
                <img
                  src={r.iconSrc}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              </span>
              <div>
                <p className="text-sm">{r.title}</p>
                <p className="text-xs text-white/60">{r.subtitle}</p>
              </div>
            </div>
            <span className="text-lg">›</span>
          </a>
        ))}
      </div>
    </div>
  );
}
