"use client";

import {
  BarChart2,
  LayoutDashboard,
  Link as LinkIcon,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  matchPrefix?: string;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
    matchPrefix: "/dashboard",
  },
  {
    label: "Connect",
    href: "/connect/links",
    icon: LinkIcon,
    matchPrefix: "/connect",
  },
  {
    label: "Profiles",
    href: "/profiles",
    icon: Users,
    matchPrefix: "/profiles",
  },
  { label: "Wallet", href: "/wallet", icon: Wallet, matchPrefix: "/wallet" },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    matchPrefix: "/analytics",
  },
];

function isActive(pathname: string, item: MobileNavItem): boolean {
  const prefix = item.matchPrefix ?? item.href;
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/**
 * Fixed bottom navigation bar for mobile viewports.
 * Hidden on desktop (lg+) via `hidden lg:hidden` — only shown on small screens.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-0",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon
                className={cn("w-5 h-5 shrink-0", active && "stroke-[2.5]")}
              />
              <span
                className={cn(
                  "text-[10px] leading-tight font-medium truncate",
                  active && "font-semibold",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
