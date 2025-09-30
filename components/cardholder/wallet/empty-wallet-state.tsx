"use client";

import { Button } from "@/components/ui/button";
import WalletHeader from "./wallet-header";

export default function WalletEmptyState({
  onTopUp,
  ...headerProps
}: React.ComponentProps<typeof WalletHeader> & { onTopUp?: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <WalletHeader {...headerProps} onTopUp={onTopUp} />

      <div className="px-4">
        <div className="py-14 text-center">
          <p className="text-white/80 font-medium">Nothing to see yet</p>
          <p className="text-xs text-white/60 mt-1">
            Make a transaction or top-up wallet
          </p>
          <Button
            onClick={onTopUp}
            className="mt-3 rounded-full bg-white/15 hover:bg-white/20 text-white px-4 py-1.5 text-sm">
            Top-up
          </Button>
        </div>
      </div>
    </div>
  );
}
