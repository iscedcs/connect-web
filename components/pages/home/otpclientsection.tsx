"use client";
import OtpScreen from "@/components/otp/otp-screen";
import React from "react";

export default function OtpClientSection() {
  return (
    <OtpScreen
      state="idle"
      onResend={() => console.log("resend…")}
      onVerify={async (code) => (code === "944517" ? "success" : "error")}
    />
  );
}
