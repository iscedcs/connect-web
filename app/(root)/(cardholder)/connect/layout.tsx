import { generateMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Connect",
  description:
    "Connect with others using NFC tap or QR code scan. Share your contact information, links, and digital profile seamlessly.",
  keywords: ["connect", "NFC", "QR code", "tap", "scan", "share contact"],
});

export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
