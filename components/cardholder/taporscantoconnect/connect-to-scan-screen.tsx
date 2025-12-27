"use client";

import { Button } from "@/components/ui/button";
import { EllipseIcon, InfoIcon } from "@/lib/icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BarcodeDetector as PolyfilledBarcodeDetector } from "barcode-detector";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { extractDeviceFromURL } from "@/lib/device-extract";

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
  const hasNavigatedRef = useRef(false);

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

  function navigateWith(resultText: string) {
    const extracted = extractDeviceFromURL(resultText);

    if (!extracted?.cardid) {
      setStatus("Invalid ISCE QR code");
      hasNavigatedRef.current = false;
      return;
    }

    stopEverything();

    const params = new URLSearchParams({
      cardid: extracted?.cardid!,
    });

    if (extracted?.type) {
      params.set("type", extracted.type);
    }

    router.push(`/otp/idle?${params.toString()}`);
  }

  // ---- scanner loop --------------------------------------------------------

  async function scanLoop() {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !detectorRef.current ||
      hasNavigatedRef.current
    ) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState < 2) {
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
      const isNative =
        typeof window !== "undefined" && "BarcodeDetector" in window;

      const source = isNative ? video : canvas;

      const codes = await detectorRef.current.detect(source as any);
      if (codes.length > 0) {
        const value = (codes[0] as any).rawValue;

        console.log("QR DETECTED:", value);

        if (value) {
          setStatus("Code detected. Processing…");
          navigateWith(value);
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

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();

        await new Promise<void>((resolve) => {
          if (videoRef.current!.videoWidth > 0) {
            resolve();
          } else {
            videoRef.current!.onloadedmetadata = () => resolve();
          }
        });

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
    <div className="h-[100svh] bg-black text-white flex flex-col">
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
          <div className="w-full aspect-[9/12] bg-black">
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
