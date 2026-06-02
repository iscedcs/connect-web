"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface WalletStatus {
  hasWallet: boolean;
  kycStatus:
    | "UNVERIFIED"
    | "BVN_SUBMITTED"
    | "BVN_VERIFIED"
    | "REJECTED"
    | null;
  virtualAccountNumber: string | null;
  virtualAccountBank: string | null;
  balance: number | null;
  currency: string | null;
}

export default function WalletCard({ compact }: { compact?: boolean }) {
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWalletStatus() {
      try {
        const res = await fetch("/api/wallet/status");
        if (res.ok) {
          const json = await res.json();
          setWalletStatus(json.data);
        }
      } catch {
        // silently fail — show BVN prompt as fallback
      } finally {
        setLoading(false);
      }
    }
    fetchWalletStatus();
  }, []);

  // User has a verified wallet with virtual account — show wallet info card
  const hasVerifiedWallet =
    walletStatus?.kycStatus === "BVN_VERIFIED" &&
    walletStatus?.virtualAccountNumber;

  if (loading) {
    return (
      <div className="overflow-hidden">
        <div
          className={`relative border-2 border-[#868686] rounded-2xl bg-neutral-900 animate-pulse ${compact ? "h-[160px]" : "h-[203px]"}`}
        />
      </div>
    );
  }

  // Show wallet info card if account is connected
  if (hasVerifiedWallet) {
    return (
      <div className="overflow-hidden">
        {/* Top: wallet card with account info */}
        <div className="relative border-2 border-[#868686] rounded-2xl bg-gradient-to-br from-emerald-950 to-neutral-900">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-emerald-400 font-medium">
                  ISCE Wallet
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  ₦
                  {(walletStatus?.balance ?? 0).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-xs text-gray-400">Virtual Account</p>
              <p className="text-sm font-mono text-white">
                {walletStatus?.virtualAccountNumber}
              </p>
              <p className="text-xs text-gray-500">
                {walletStatus?.virtualAccountBank}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: link to wallet page */}
        <div className="bg-neutral-900 border-2 border-t-0 border-[#868686] rounded-b-2xl max-w-80 mx-auto">
          <Link href="/wallet">
            <Button className="w-full py-4 text-sm bg-emerald-600 hover:bg-emerald-700 transition">
              Manage Wallet
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show BVN pending message if submitted
  if (walletStatus?.kycStatus === "BVN_SUBMITTED") {
    return (
      <div className="overflow-hidden">
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
            <div className="flex items-start mx-auto justify-between gap-4">
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

        <div className="bg-neutral-900 border-2 border-t-0 border-[#868686] rounded-b-2xl max-w-80 mx-auto">
          <div className="w-full py-4 text-sm text-center text-amber-400">
            BVN verification in progress...
          </div>
          <div className="h-px bg-[#868686] mx-4" />
          <Link
            href="/bvn"
            className="block w-full py-4 text-sm hover:bg-neutral-800 text-center text-emerald-400 transition"
          >
            Check verification status
          </Link>
          <div className="h-px bg-[#868686] mx-4" />
          <Link
            href="/terms"
            className="block w-full py-4 text-sm hover:bg-neutral-800 text-center transition"
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    );
  }

  // Default: show BVN prompt (UNVERIFIED, REJECTED, or no wallet)
  return (
    <div className="overflow-hidden">
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
          <div className="flex items-start mx-auto justify-between gap-4">
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
      <div className="bg-neutral-900 border-2 border-t-0 border-[#868686] rounded-b-2xl max-w-80 mx-auto">
        <Link href="/bvn">
          <Button className="w-full py-4 text-sm hover:bg-neutral-800 transition">
            {walletStatus?.kycStatus === "REJECTED"
              ? "Retry BVN verification"
              : "Connect your BVN to get started"}
          </Button>
        </Link>
        <div className="h-px bg-[#868686] mx-4" />
        <Link
          href="/terms"
          className="block w-full py-4 text-sm hover:bg-neutral-800 text-center transition"
        >
          Terms &amp; Conditions
        </Link>
      </div>
    </div>
  );
}
