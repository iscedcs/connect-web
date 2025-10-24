"use client";

import { Button } from "@/components/ui/button";
import { EllipseIcon, InfoIcon } from "@/lib/icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BarcodeDetector as PolyfilledBarcodeDetector } from "barcode-detector";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type DetectorCtor =
  | (new (opts?: { formats?: string[] }) => BarcodeDetector)
  | undefined;

export default function ConnectScanScreen({
  onTapInstead,
  backHref = "/",
}: {
  onTapInstead?: () => void;
  backHref?: string;
}) {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const detectorCtorRef = useRef<DetectorCtor>(undefined);

  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Point your camera at the code");

  // ---- helpers -------------------------------------------------------------

  function stopEverything() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }

  function extractParamsFromText(text: string): {
    cardid?: string;
    type?: string;
  } {
    // If it's a URL, try to read ?cardid and ?type
    try {
      const u = new URL(text);
      const cardid = u.searchParams.get("cardId") ?? undefined;
      const type = u.searchParams.get("type") ?? undefined;
      if (cardid) return { cardid, type };
    } catch {
      // Not a URL — fall through
    }

    // If raw text looks like a plausible product/card id, treat it as cardid
    const plausible = /^[a-z0-9\-]{6,}$/i.test(text) ? text : undefined;
    return { cardid: plausible };
  }

  function navigateWith(resultText: string) {
    const { cardid, type } = extractParamsFromText(resultText);
    if (!cardid) {
      setStatus("Unsupported code. Try a different QR or use NFC tap.");
      return;
    }

    // Stop camera first
    stopEverything();

    const qs = new URLSearchParams({ cardid });
    if (type) qs.set("type", type);

    router.push(`/otp/idle?${qs.toString()}`);
  }

  // ---- scanner loop --------------------------------------------------------

  async function scanLoop() {
    if (!videoRef.current || !canvasRef.current || !detectorRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    // Match canvas size to current frame
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Detect from canvas (works in native + polyfill)
      const codes = await detectorRef.current.detect(
        canvas as unknown as CanvasImageSource
      );
      if (codes.length > 0) {
        const best = (codes[0] as any).rawValue;
        if (best) {
          setStatus("Code detected. Processing…");
          navigateWith(best);
          return;
        }
      }
    } catch (e) {
      console.warn("Barcode detect failed:", e);
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }

  // ---- init camera + detector ---------------------------------------------

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError(null);
      setStatus("Starting camera…");

      // 1) Check support
      detectorCtorRef.current =
        (typeof window !== "undefined"
          ? (window as any).BarcodeDetector
          : undefined) || PolyfilledBarcodeDetector;

      if (!detectorCtorRef.current) {
        setError(
          "This browser doesn’t support in-page QR scanning. Use NFC Tap instead."
        );
        return;
      }
      try {
        // 2) Create detector for QR only
        detectorRef.current = new detectorCtorRef.current({
          formats: ["qr_code"],
        } as any);
        // 3) Request the rear camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) {
          // If unmounted before it resolved
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setReady(true);
        setStatus("Point your camera at the code");

        // 4) Kick off the loop
        rafRef.current = requestAnimationFrame(scanLoop);
      } catch (e: any) {
        console.error("Camera error:", e);
        setError(
          e?.name === "NotAllowedError"
            ? "Camera permission denied. Allow camera or use NFC Tap instead."
            : "Unable to start camera. Try NFC Tap instead."
        );
      }
    })();

    return () => {
      cancelled = true;
      stopEverything();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- UI ------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* top safety banner */}
      <div className="mx-auto w-full">
        <div className="flex bg-white/10 px-3 py-2 text-xs backdrop-blur">
          <span className="mr-2">
            <InfoIcon />
          </span>
          Ensure your NFC is turned on to connect successfully — or scan the QR.
        </div>
      </div>

      {/* top bar */}
      <div className="mx-auto w-full max-w-screen-sm px-4 py-3 flex items-center justify-between">
        <Link href={backHref} className="text-white/90 text-xl">
          <ArrowLeft />
        </Link>
      </div>

      {/* camera preview */}
      <div className="mx-auto w-full max-w-screen-sm flex-1 px-4 pb-4">
        <div className="relative w-full overflow-hidden rounded-xl">
          {/* 9/16 viewfinder box */}
          <div className="w-full aspect-[9/16] bg-black">
            {error ? (
              <div className="w-full h-full flex items-center justify-center text-center px-6">
                <p className="text-sm text-white/80">{error}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* simple overlay guide */}
          {!error && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-1/3 rounded-xl border-2 border-white/50" />
            </div>
          )}
        </div>

        {/* status text */}
        <p className="mt-3 text-center text-xs text-white/70">{status}</p>
      </div>

      {/* bottom button */}
      <div className="mx-auto w-full max-w-screen-sm px-4 pb-6">
        <Button
          onClick={onTapInstead}
          className="w-full rounded-2xl bg-white text-black py-6 text-base font-medium shadow-sm active:translate-y-px">
          Tap device instead
        </Button>
      </div>
    </div>
  );
}
