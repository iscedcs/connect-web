"use client";
import OtpScreen from "@/components/cardholder/otp/otp-screen";
import ConnectSuccessScreen from "@/components/cardholder/taporscantoconnect/connected-to-device-screen";
import { createDevice, verifyDeviceToken } from "@/lib/services/device";
import { useRouter } from "next/navigation";
import React from "react";

interface OtpClientSectionProps {
  cardId?: string;
  deviceType?: string;
  user?: UserInfo;
  productId?: string;
}

export default function OtpClientSection({
  cardId,
  deviceType,
  user,
  productId,
}: OtpClientSectionProps) {
  const router = useRouter();

  const userId = user?.id;

  const effectiveProductId = productId ?? cardId;
  const [created, setCreated] = React.useState(false);
  const [otpState, setOtpState] = React.useState<
    "idle" | "success" | "error" | "resending"
  >("idle");
  const [verifiedToken, setVerifiedToken] = React.useState<string | null>(null);

  const creatingRef = React.useRef(false);

  // Log the received parameters for debugging

  React.useEffect(() => {
    if (
      otpState === "success" &&
      verifiedToken &&
      effectiveProductId &&
      !creatingRef.current
    ) {
      creatingRef.current = true;
      (async () => {
        const r = await createDevice({
          token: verifiedToken,
          productId: effectiveProductId,
        });
        if (r.ok) {
          setCreated(true);
        } else {
          // fall back to error state if creation failed
          setOtpState("error");
          creatingRef.current = false;
        }
      })();
    }
  }, [otpState, verifiedToken, effectiveProductId]);

  React.useEffect(() => {
    if (cardId) {
      console.log("Card ID received:", cardId);
    }
    if (deviceType) {
      console.log("Device type received:", deviceType);
    }
  }, [cardId, deviceType]);

  if (created) {
    return (
      <ConnectSuccessScreen
        cardImage="/cards/PuURPLE.png"
        message="Device connected"
        onContinue={() => router.push("/devices")}
      />
    );
  }
  return (
    <OtpScreen
      state={otpState}
      onResend={() => console.log("resend…")}
      onVerify={async (token) => {
        if (!userId) return "error";
        const r = await verifyDeviceToken({ token, userId });
        setOtpState(r.ok ? "success" : "error");
        return r.ok ? "success" : "error";
      }}
      onVerified={(token) => {
        // capture token so we can create automatically
        setVerifiedToken(token);
      }}
    />
  );
}
