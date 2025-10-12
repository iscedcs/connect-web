"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WearablesCarousel from "./wearable-carousel";
import { Button } from "@/components/ui/button";

export default function WearablesScreen({
  onConnect,
}: {
  onConnect?: () => void;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="mx-auto w-full max-w-screen-sm px-4 pb-4 pt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/90">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <h1 className="mt-4 text-3xl font-bold leading-tight">
          Contactless Wearables
        </h1>

        <div className="mt-6">
          <WearablesCarousel />
        </div>
      </div>

      {/* sticky bottom button (safe-area aware) */}
      <div className="mt-auto px-4 pb-6">
        <Button
          asChild
          onClick={onConnect}
          className="w-full rounded-2xl bg-white text-black py-3 text-base font-medium shadow-sm active:translate-y-px">
          <Link href="/connect">Connect</Link>
        </Button>
      </div>
    </div>
  );
}
