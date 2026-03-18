import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { generateMetadata as generateMetadataUtil } from "@/lib/metadata";

const interTight = Inter_Tight({
  variable: "--inter-tight",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = generateMetadataUtil({
  title: undefined, // Will use default app name
  description:
    "A dynamic digital lifestyle platform for seamless connectivity and modern lifestyle management.",
  keywords: [
    "ISCE Connect",
    "digital lifestyle",
    "contact management",
    "NFC",
    "QR code",
    "digital wallet",
    "wearables",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Connect" />
      </head>
      <body
        className={`${interTight} ${syne.variable} antialiased min-h-svh bg-black`}
      >
        <NextTopLoader color="#ffffff" showSpinner={false} />
        {children}

        <Toaster
          position="bottom-right"
          richColors
          expand
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}

// 444444;
// bg-primary: 000000;
// text-primary:6F6F70

// 868686;
// 151515;
