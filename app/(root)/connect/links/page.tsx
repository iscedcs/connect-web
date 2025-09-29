// app/connect/links/page.tsx
"use client";

import LinkAddedSuccess from "@/components/connect/link-added-success";
import LinkForm from "@/components/connect/link-form";
import LinkPickerGrid from "@/components/connect/link-picker-grid";
import { useState } from "react";

type Step =
  | { view: "pick" }
  | { view: "form"; preset?: { label?: string; icon?: string } }
  | { view: "done" };

export default function LinksPage() {
  const [step, setStep] = useState<Step>({ view: "pick" });

  if (step.view === "done") {
    return (
      <LinkAddedSuccess
        avatarSrc="/assets/sample-link-avatar.jpg"
        message="Bitcoin address has been added."
        onCta={() => (window.location.href = "/profile")}
      />
    );
  }

  if (step.view === "form") {
    return (
      <LinkForm
        presetLabel={step.preset?.label}
        presetFavicon={step.preset?.icon}
        onSave={async () => setStep({ view: "done" })}
        backHref="/connect/links"
      />
    );
  }

  return (
    <LinkPickerGrid
      onPick={(key) => {
        const presets: Record<string, { label?: string; icon?: string }> = {
          btc: { label: "Bitcoin address", icon: "/icons/btc.png" },
          yt: { label: "YouTube", icon: "/icons/youtube.png" },
          x: { label: "X", icon: "/icons/x.png" },
        };
        setStep({ view: "form", preset: presets[key] ?? {} });
      }}
      backHref="/"
    />
  );
}
