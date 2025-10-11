"use client";

import ConnectSuccessScreen from "@/components/cardholder/taporscantoconnect/connected-to-device-screen";

export default function Page() {
  return (
    <ConnectSuccessScreen
      cardImage="/assets/card.jpg"
      onContinue={() => console.log("Continue → next step")}
    />
  );
}
