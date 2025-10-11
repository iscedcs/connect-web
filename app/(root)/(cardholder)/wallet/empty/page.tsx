// app/wallet/empty/page.tsx
"use client";

import WalletEmptyState from "@/components/cardholder/wallet/empty-wallet-state";

export default function Page() {
  return (
    <WalletEmptyState
      balance="₦0.00"
      accountNumber="0242011292 - Paul Oyeniran"
      onTopUp={() => console.log("Top-up")}
      onSend={() => console.log("Send")}
      onTransactions={() => console.log("Transactions")}
    />
  );
}
