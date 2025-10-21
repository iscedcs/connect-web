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

  const inFlightRef = React.useRef(false);

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
      onResend={() => {}}
      onVerify={async (token) => {
        if (!userId) return "error";
        if (inFlightRef.current) return "success";

        //verify
        const v = await verifyDeviceToken({
          token,
          userId,
          init: { cache: "no-store" },
        });
        if (!v.ok) {
          setOtpState("error");
          return "error";
        }

        setOtpState("success");

        //immediately create (exactly once)
        if (!effectiveProductId) return "success";
        inFlightRef.current = true;

        const c = await createDevice({
          token,
          productId: effectiveProductId,
          init: { cache: "no-store" },
        });

        // consider 409 as success (already connected)
        if (c.ok || c.status === 409) {
          setCreated(true);
          return "success";
        }

        // creation failed → allow retry without re-verifying
        inFlightRef.current = false;
        setOtpState("error");
        return "error";
      }}
    />
  );
}
