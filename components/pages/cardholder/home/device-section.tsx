"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DevicesCard({ compact }: { compact?: boolean }) {
  return (
    <div className="bg-neutral-900 rounded-2xl p-5 pt-5 pb-0 space-y-4 overflow-hidden">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Devices</h3>
        <p className="text-sm text-gray-400">
          No connected devices yet. Tap the button below to pair your wearable.
        </p>
      </div>

      <Link href="/wearables">
        <Button className="rounded-full px-4 py-2 w-fit" variant="secondary">
          Connect devices
        </Button>
      </Link>

      {/* Decorative image strip — hidden in compact mode */}
      {!compact && (
        <div className="rounded-t-xl px-4 -mx-5 overflow-hidden mt-8">
          <img
            src="/assets/8ba8f3e953958500550d865787dad98b982c4fba.gif"
            alt="Devices Illustration"
            className="w-full h-20 object-cover"
          />
        </div>
      )}
      {compact && <div className="pb-5" />}
    </div>
  );
}
