"use client";

import { CopyClipIcon, EyesOpenIcon } from "@/lib/icons";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WalletBalanceCard({
  balance,
  accountLabel = "Titan account details",
  accountNumber = "0242011292 - Paul Oyeniran",
  hideAmount = false,
  onToggleHide,
  href = "/wallet",
}: {
  balance: string;
  accountLabel?: string;
  accountNumber?: string;
  hideAmount?: boolean;
  onToggleHide?: () => void;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-neutral-900 rounded-2xl p-5 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-80 pointer-events-none"
        style={{
          backgroundImage:
            "url('/assets/1d0f954aa029cfb982cae5e5e2d17c0eedc06764.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <p className="text-base text-white/80">Available balance</p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleHide?.();
              }}
              aria-label="Toggle balance visibility"
              className="text-white/80">
              <EyesOpenIcon />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">
              <ArrowRight />
            </span>
          </div>
        </div>

        <p
          className={`mt-2 text-5xl tracking-tight ${
            hideAmount ? "blur-sm" : ""
          }`}>
          {balance}
        </p>

        <div className="mt-3 text-sm">
          <p className="text-white/70 inline-flex items-center gap-2">
            <span>
              <CopyClipIcon />
            </span>{" "}
            {accountLabel}
          </p>
          <p className=" text-sm underline underline-offset-4">
            {accountNumber}
          </p>
        </div>
      </div>
    </Link>
  );
}
