"use client";

import { EllipseIcon, InfoIcon } from "@/lib/icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";

export default function ConnectScanScreen({
  onTapInstead,
  backHref = "/",
  previewSrc = "/images/camera-placeholder.jpg",
}: {
  onTapInstead?: () => void;
  backHref?: string;
  previewSrc?: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* top safety banner */}
      <div className="mx-auto w-full">
        <div className=" flex bg-white/10 px-3 py-2 text-xs backdrop-blur">
          <span className="mr-2">
            <InfoIcon />
          </span>
          Ensure your NFC is turned on to connect successfully
        </div>
      </div>

      {/* top bar */}
      <div className="mx-auto w-full max-w-screen-sm px-4 py-3 flex items-center justify-between">
        <Link href={backHref} className="text-white/90 text-xl">
          <ArrowLeft />
        </Link>
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1200); // mock refresh
          }}
          aria-label="Refresh"
          className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
          {loading ? (
            <span className="animate-spin">
              <EllipseIcon />
            </span>
          ) : (
            <span>
              <EllipseIcon />
            </span>
          )}
        </button>
      </div>

      <div className="mx-auto w-full max-w-screen-sm flex-1 px-0 pb-4">
        <div className="w-full aspect-[9/16] max-h-[70vh] bg-black">
          <img
            src={previewSrc}
            alt="Device camera preview"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-sm px-4 pb-6">
        <Button
          onClick={onTapInstead}
          className="w-full rounded-2xl bg-white text-black py-6 text-base font-medium shadow-sm active:translate-y-px">
          Tap device instead
        </Button>
      </div>
    </div>
  );
}
