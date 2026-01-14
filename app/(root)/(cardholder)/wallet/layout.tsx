import { generateMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Wallet",
  description:
    "Manage your digital wallet. View balance, transaction history, send payments, and top up your account.",
  keywords: ["wallet", "payments", "transactions", "balance", "digital wallet"],
});

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
