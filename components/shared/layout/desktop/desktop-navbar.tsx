"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  connect: "Connect",
  links: "Links",
  socials: "Social Profiles",
  videos: "Videos",
  meetings: "Meetings",
  files: "Files",
  forms: "Forms",
  spotify: "Spotify",
  appointments: "Appointments",
  artisan: "Artisan",
  profiles: "My Profiles",
  contacts: "Contacts",
  analytics: "Analytics",
  wearables: "Wearables",
  wallet: "Wallet",
  transactions: "Transactions",
  send: "Send Money",
  withdraw: "Withdraw",
  settings: "Settings",
  account: "Account Settings",
  "connect-config": "Connect Config",
  notifications: "Notifications",
  support: "Support",
  devices: "Devices",
  "manage-account": "Manage Account",
};

interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbSegment[] = [];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[segment] ?? segment;
    crumbs.push({
      label,
      href: currentPath,
      isLast: index === segments.length - 1,
    });
  });

  return crumbs;
}

interface DesktopNavbarProps {
  user: UserInfo | null;
}

export default function DesktopNavbar({ user }: DesktopNavbarProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email ||
      "User"
    : "User";

  const initials = user
    ? [user.firstName?.[0], user.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "U"
    : "U";

  useEffect(() => {
    async function loadUnreadCount() {
      try {
        const res = await fetch("/api/connect/notification/stats", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const count = json?.data?.stats?.unread ?? 0;
        setUnreadCount(count);
      } catch {
        // silently ignore — unread count is non-critical
      }
    }
    loadUnreadCount();
  }, [pathname]);

  return (
    <header className="flex h-14 items-center gap-2 border-b border-border bg-background px-4">
      {/* Left: sidebar trigger + breadcrumbs */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator orientation="vertical" className="h-4 shrink-0" />

        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap min-w-0">
            {breadcrumbs.map((crumb, index) => (
              <span
                key={crumb.href}
                className="flex items-center gap-1.5 min-w-0"
              >
                {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
                <BreadcrumbItem className="min-w-0">
                  {crumb.isLast ? (
                    <BreadcrumbPage className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      asChild
                      className="text-sm text-muted-foreground hover:text-foreground truncate max-w-[120px]"
                    >
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: notification bell + avatar dropdown */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground hover:ring-2 hover:ring-border transition-all"
              aria-label="Account menu"
            >
              {user?.displayPicture?.startsWith('http') ? (
                <Image
                  src={user.displayPicture}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground truncate">
                {displayName}
              </p>
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/account" className="cursor-pointer">
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/connect-config" className="cursor-pointer">
                Connect Config
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/auth/logout"
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
