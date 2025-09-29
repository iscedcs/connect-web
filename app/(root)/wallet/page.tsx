// app/wallet/page.tsx
"use client";

import WalletHistoryList, {
  WalletTxn,
} from "@/components/wallet/wallet-history-list";

const items: WalletTxn[] = [
  {
    id: "1",
    title: "Wallet Top-up",
    date: "Oct 14, 2024",
    time: "04:31 PM",
    amount: "+₦100,000.00",
    iconSrc: "/assets/Vector.svg",
  },
  {
    id: "2",
    title: "Payment to Eniola",
    date: "Oct 11, 2024",
    time: "12:31 PM",
    amount: "-₦100,000.00",
    iconSrc: "/assets/Vector.svg",
  },
  {
    id: "3",
    title: "QR Payment to Divine",
    date: "Oct 10, 2024",
    time: "08:45 AM",
    amount: "-₦50,000.00",
    iconSrc: "/assets/Vector.svg",
  },
  {
    id: "4",
    title: "Payment to Ezekiel",
    date: "Oct 10, 2024",
    time: "12:31 PM",
    amount: "-₦100,000.00",
    iconSrc: "/assets/Vector.svg",
  },
  {
    id: "5",
    title: "QR Payment to Emma",
    date: "Oct 10, 2024",
    time: "08:45 AM",
    amount: "-₦50,000.00",
    iconSrc: "/assets/Vector.svg",
  },
];

export default function Page() {
  return (
    <WalletHistoryList
      balance="₦25,688,467.00"
      accountNumber="0242011292 - Paul Oyeniran"
      items={items}
      onShowMore={() => console.log("Show more")}
      onTopUp={() => console.log("Top-up")}
      onSend={() => console.log("Send")}
      onTransactions={() => console.log("Transactions")}
    />
  );
}
