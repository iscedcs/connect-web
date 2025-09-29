"use client";
import WearablesScreen from "@/components/wearables/wearable-devices";
import React from "react";

export default function WearableClientSection() {
  return <WearablesScreen onConnect={() => console.log("Connect pressed")} />;
}
