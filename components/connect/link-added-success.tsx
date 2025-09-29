"use client";
import { Button } from "@/components/ui/button";

export default function LinkAddedSuccess({
  avatarSrc,
  message,
  ctaLabel = "Take me to my profile",
  onCta,
}: {
  avatarSrc: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border border-white/30">
          <img
            src={avatarSrc}
            alt="link avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="mt-6 text-center text-lg font-semibold">{message}</p>
      </div>

      <div className="w-full px-4 pb-6">
        <Button
          onClick={onCta}
          className="w-full rounded-2xl bg-white text-black py-3 text-base font-medium shadow-sm">
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
