"use client";
import OtpScreen from "@/components/otp/otp-screen";
import React from "react";

export default function OtpClientErrorSection() {
  return (
    <OtpScreen
      state="error"
      onVerify={async (code) => {
        console.log("Verifying OTP:", code);
        return "error" as const;
      }}
    />
  );
}
