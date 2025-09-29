"use client";

import { Button } from "@/components/ui/button";

export default function ConnectSuccessScreen({
  cardImage = "/assets/card.jpg",
  message = "Device connected",
  onContinue,
}: {
  cardImage?: string;
  message?: string;
  onContinue?: () => void;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-start pt-16">
        <div className="w-[280px] rounded-2xl overflow-hidden shadow-md">
          <img
            src={cardImage}
            alt="Connected device"
            className="w-full h-auto object-cover"
          />
        </div>

        <p className="mt-4 text-base font-semibold">{message}</p>
      </div>

      <div className="px-4 pb-6">
        <Button
          onClick={onContinue}
          className="w-full rounded-2xl bg-white text-black py-6 text-base font-medium shadow-sm active:translate-y-px">
          Continue
        </Button>
      </div>
    </div>
  );
}
