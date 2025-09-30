"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DevicesCard() {
  return (
    <div className="bg-neutral-900 rounded-2xl p-5 pt-5 pb-0 space-y-4 overflow-hidden">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Devices</h3>
        <p className="text-sm text-gray-400">
          There are no connected devices at the moment, start by tapping the add
          button at the top right of this modal
        </p>
      </div>

      <Link href="/connect">
        <Button className="rounded-full px-4 py-2 w-fit" variant="secondary">
          Connect devices
        </Button>
      </Link>

      {/* Decorative image strip */}
      <div className="rounded-t-xl px-4 -mx-5 overflow-hidden mt-8">
        <img
          src="/assets/8ba8f3e953958500550d865787dad98b982c4fba.gif"
          alt="Devices Illustration"
          className="w-full h-20 object-cover"
        />
      </div>
    </div>
  );
}
