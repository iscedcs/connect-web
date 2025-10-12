"use client";

import { Button } from "@/components/ui/button";
import {
  CopyClipIcon,
  EyesOpenIcon,
  PlusIcon,
  ScanIcon,
  SendIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WalletHeader({
  backHref = "/",
  accountLabel = "Titan account details",
  accountNumber = "0242011292 - Paul Oyeniran",
  balance = "₦0.00",
  hideAmount = false,
  onToggleHide,
  onTopUp,
  onSend,
  onTransactions,
  className,
}: {
  backHref?: string;
  accountLabel?: string;
  accountNumber?: string;
  balance?: string;
  hideAmount?: boolean;
  onToggleHide?: () => void;
  onTopUp?: () => void;
  onSend?: () => void;
  onTransactions?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn("bg-neutral-900 rounded-b-4xl px-4 pt-3 pb-6", className)}>
      {/* top row */}
      <div className="flex items-center justify-between">
        <Link href={backHref} className="text-white/90">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-[11px] text-white/70">
          <span className="inline-flex items-center gap-1">
            <span className="text-white/80">
              <CopyClipIcon />
            </span>
            {accountLabel}
          </span>
          <div className="mt-0.5 underline underline-offset-4">
            <Link href="/wallet/account">{accountNumber}</Link>
          </div>
        </div>
      </div>

      {/* balance */}
      <div className="mt-6">
        <div className="text-sm text-white/70 flex items-center gap-2">
          <span>Available balance</span>
          <Button
            onClick={onToggleHide}
            className="text-white/70 hover:text-white"
            aria-label="Toggle balance visibility">
            <EyesOpenIcon className="w-4 h-4" />
          </Button>
        </div>
        <div
          className={cn(
            "mt-1 text-4xl font-semibold tracking-tight",
            hideAmount && "blur-sm"
          )}>
          {balance}
        </div>

        <div className="mt-2 grid text-xs">
          <span className="text-white/70">
            Want to learn more about wallets?{" "}
          </span>
          <Link href="/help/wallet" className="underline">
            Learn more
          </Link>
        </div>
      </div>

      {/* actions */}
      <div className="mt-5 ">
        <div className="mx-auto max-w-[320px] grid grid-cols-3 place-items-center gap-2">
          <Button
            onClick={onTopUp}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow"
            aria-label="Top up">
            <PlusIcon className="w-24 h-24" />
          </Button>
          <Button
            onClick={onSend}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow"
            aria-label="Send">
            <SendIcon className="w-24 h-24" />
          </Button>
          <Button
            onClick={onTransactions}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow ml-auto"
            aria-label="Transactions">
            <ScanIcon className="w-24 h-24" />
          </Button>
        </div>
      </div>
    </div>
  );
}
