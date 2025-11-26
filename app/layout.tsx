import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

const interTight = Inter_Tight({
  variable: "--inter-tight",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Connect by ISCE",
  description: "A dynamic digital lifestyle platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interTight} antialiased min-h-svh max-w-md mx-auto bg-black`}>
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
