"use client";

import { InfoIcon } from "@/lib/icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function ConnectTapScreen({
  onScanInstead,
  backHref = "/",
}: {
  onScanInstead?: () => void;
  backHref?: string;
}) {
  return (
    <div className="min-h-screen relative text-white">
      {/* gradient bg (replace with your asset if you prefer) */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/GettyImages-1297962402.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* top safety banner */}
      <div className="relative">
        <div className="mx-auto w-full">
          <div className=" flex bg-white/10 px-3 py-2 text-xs backdrop-blur">
            <span className="mr-2">
              <InfoIcon />
            </span>
            Ensure your NFC is turned on to connect successfully
          </div>
        </div>
      </div>

      {/* back */}
      <div className="relative mx-auto w-full max-w-screen-sm px-4 pt-3">
        <Link href={backHref} className="inline-block text-white/90 text-xl">
          <ArrowLeft />
        </Link>
      </div>

      {/* center content */}
      <div className="relative mx-auto w-full max-w-screen-sm px-4">
        <div className="h-[76vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold animate-pulse">Tap to connect</h1>
            <p className="mt-2 text-sm text-white/80">
              Waiting to detect device...
            </p>
          </div>
        </div>
      </div>

      {/* bottom button */}
      <div className="relative mx-auto w-full max-w-screen-sm px-4 pb-6">
        <Button
          onClick={onScanInstead}
          className="w-full rounded-2xl bg-white text-black py-6 text-base font-medium shadow-sm active:translate-y-px">
          Scan device instead
        </Button>
      </div>
    </div>
  );
}
