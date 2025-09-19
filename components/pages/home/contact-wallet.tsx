"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WalletCard() {
  return (
    <div className=" overflow-hidden">
      {/* Top: starfield background + wallet art */}
      <div className="relative border-2 h-[203px] border-[#868686] rounded-2xl bg-neutral-900">
        <div
          className="absolute rounded-2xl inset-0"
          style={{
            backgroundImage:
              "url('/assets/1d0f954aa029cfb982cae5e5e2d17c0eedc06764.gif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="rounded-2xl relative p-6">
          <div className="flex items-start mx-auto  justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold leading-tight">
                Contactless wallet
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Free &amp; Fast transactions
              </p>
            </div>

            <img
              src="/assets/d9ee6188380502a129f3c94ac8e9067874838220.png"
              alt="Wallet"
              className="w-28 h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="bg-neutral-900 border-2 border-t-0 border-[#868686] rounded-b-2xl max-w-80 mx-auto ">
        <Button className="w-full py-4 text-sm hover:bg-neutral-800 transition">
          Connect your BVN to get started
        </Button>
        <div className="h-px bg-[#868686] mx-4" />

        <Link
          href="/terms"
          className="block w-full py-4 text-sm hover:bg-neutral-800 text-center transition">
          Terms &amp; Conditions
        </Link>
      </div>
    </div>
  );
}
