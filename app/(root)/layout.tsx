import { NotificationsListener } from "@/components/shared/notifications-listener";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NotificationsListener />
      {children}
    </>
  );
}
