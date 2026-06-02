import { getAuthInfo } from "@/actions/auth";
import ConnectDesktopShell from "@/components/shared/layout/desktop/desktop-shell";
import MobileBottomNav from "@/components/shared/layout/mobile/mobile-bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authInfo = await getAuthInfo();
  const user = !("error" in authInfo) ? authInfo.user : null;

  return (
    <ConnectDesktopShell user={user}>
      {/* Mobile: constrain to card width + bottom nav padding */}
      <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 pb-16 lg:pb-0">
        {children}
      </div>
      <MobileBottomNav />
    </ConnectDesktopShell>
  );
}
