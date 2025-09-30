"use client";
import OtpScreen from "@/components/cardholder/otp/otp-screen";
import React from "react";

export default function OtpSucesssSection() {
  return (
    <OtpScreen
      state="success"
      onVerify={async (code) => {
        console.log("Verifying OTP:", code);
        return "success" as const;
      }}
    />
  );
}
