"use client";

import { TogglePill } from "@/components/ui/toggle-pill";
import { ToggleIcon } from "@/lib/icons";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: string;
  qty: number;
  thumbSrc?: string;
};

export default function StoreManagementTable({
  title = "Store management",
  subtitle = "Setup a store and manage transactions",
  enabled = true,
  onToggle,
  manageHref = "/store",
  products,
}: {
  title?: string;
  subtitle?: string;
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  manageHref?: string;
  products: Product[];
}) {
  return (
    <div className="bg-neutral-900 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <Link
            href={manageHref}
            className="text-[10px] text-white/70 inline-flex items-center gap-1">
            {subtitle} <span>›</span>
          </Link>
        </div>
        <TogglePill checked={enabled} onCheckedChange={onToggle} />
      </div>

      <div className="mt-3 rounded-md bg-white/5 px-3 py-2">
        <div className="grid grid-cols-12 text-[10px] text-white/70">
          <span className="col-span-7">PRODUCT NAME</span>
          <span className="col-span-3">PRICE</span>
          <span className="col-span-1 text-right">QTY</span>
          <span className="col-span-1" />
        </div>
      </div>

      <div className="mt-2 space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="grid [grid-template-columns:7fr_3fr_1fr_auto] items-center px-3">
            <div className="text-sm truncate">{p.name}</div>
            <div className="text-sm">{p.price}</div>
            <div className="text-sm text-right">{p.qty}</div>

            {/* Thumb at the far right */}
            <div className="flex  justify-end">
              <span className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 shrink-0 inline-flex">
                {p.thumbSrc && (
                  <img
                    src={p.thumbSrc}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
