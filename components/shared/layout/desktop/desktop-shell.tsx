import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DesktopNavbar from "./desktop-navbar";
import DesktopSidebar from "./desktop-sidebar";

interface ConnectDesktopShellProps {
  children: React.ReactNode;
  user: UserInfo | null;
}

/**
 * Desktop shell — wraps all protected cardholder routes.
 *
 * Layout:
 *   - lg+: sidebar (left) + inset with topbar + scrollable main
 *   - <lg: transparent pass-through (mobile layout handled per-page)
 *
 * The max-w-md mobile constraint lives inside each page's
 * content area, NOT here, so desktop gets full-width.
 */
export default function ConnectDesktopShell({
  children,
  user,
}: ConnectDesktopShellProps) {
  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:block">
          <DesktopSidebar user={user} />
        </div>

        {/* Main area */}
        <SidebarInset className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Top navbar — desktop only */}
          <div className="hidden lg:block">
            <DesktopNavbar user={user} />
          </div>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto w-full relative">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
