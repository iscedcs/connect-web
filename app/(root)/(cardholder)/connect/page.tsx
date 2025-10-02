// app/connect/page.tsx
"use client";

import ConnectScanScreen from "@/components/cardholder/taporscantoconnect/connect-to-scan-screen";
import ConnectTapScreen from "@/components/cardholder/taporscantoconnect/connect-to-tap-screen";
import { WebNFCUtils } from "@/lib/web-nfc.utils";
import { useState, useEffect } from "react";

export default function ConnectPage() {
  const [hasNFC, setHasNFC] = useState(false);
  const [isCheckingNFC, setIsCheckingNFC] = useState(true);

  const [mode, setMode] = useState<"tap" | "scan">(hasNFC ? "tap" : "scan");

  useEffect(() => {
    const checkNFCCapability = async () => {
      try {
        const nfcSupported = WebNFCUtils.isNFCSupported();
        const nfcCapable = await WebNFCUtils.hasNFCCapability();

        setHasNFC(nfcSupported && nfcCapable);
      } catch (error) {
        console.warn("Failed to check NFC capability:", error);
        setHasNFC(false);
      } finally {
        setIsCheckingNFC(false);
      }
    };

    checkNFCCapability();
  }, []);

  useEffect(() => {
    if (!isCheckingNFC) {
      setMode(hasNFC ? "tap" : "scan");
    }
  }, [hasNFC, isCheckingNFC]);

  // Show loading state while checking NFC capability
  if (isCheckingNFC) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Checking device capabilities...</p>
        </div>
      </div>
    );
  }

  if (mode === "scan") {
    return (
      <ConnectScanScreen
        onTapInstead={() => setMode("tap")}
        backHref="/"
        previewSrc="/assets/2870ea38143ec7e1698cc7437b0c229b85605be9.jpg"
      />
    );
  }

  return (
    <ConnectTapScreen onScanInstead={() => setMode("scan")} backHref="/" />
  );
}
