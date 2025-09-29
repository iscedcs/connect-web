// app/connect/page.tsx
"use client";

import ConnectScanScreen from "@/components/taporscantoconnect/connect-to-scan-screen";
import ConnectTapScreen from "@/components/taporscantoconnect/connect-to-tap-screen";
import { useEffect, useState } from "react";

export default function ConnectPage() {
  const [hasNFC, setHasNFC] = useState(false);

  useEffect(() => {
    // Only run on the client
    if (typeof window !== "undefined" && "NDEFReader" in window) {
      setHasNFC(true);
    }
  }, []);

  const [mode, setMode] = useState<"tap" | "scan">(hasNFC ? "tap" : "scan");

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
