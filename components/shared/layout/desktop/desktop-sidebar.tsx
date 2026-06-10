"use client";

import {
  BarChart2,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Music,
  Settings,
  Share2,
  Users,
  Video,
  Wallet,
  Watch,
  Palette,
  Contact2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "Connect",
    items: [
      { label: "Links", href: "/connect/links", icon: LinkIcon },
      { label: "Social Profiles", href: "/connect/socials", icon: Share2 },
      { label: "Videos", href: "/connect/videos", icon: Video },
      { label: "Meetings", href: "/connect/meetings", icon: CalendarDays },
      { label: "Files", href: "/connect/files", icon: FileText },
      { label: "Forms", href: "/connect/forms", icon: ClipboardList },
      { label: "Spotify", href: "/connect/spotify", icon: Music },
      {
        label: "Appointments",
        href: "/connect/appointments",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profiles", href: "/profiles", icon: Users },
      { label: "Contacts", href: "/contacts", icon: Contact2 },
      { label: "Analytics", href: "/analytics", icon: BarChart2 },
      { label: "Wearables", href: "/wearables", icon: Watch },
    ],
  },
  {
    label: "Finance",
    items: [{ label: "Wallet", href: "/wallet", icon: Wallet }],
  },
  {
    label: "Settings",
    items: [
      { label: "Account Settings", href: "/settings/account", icon: Settings },
      {
        label: "Connect Config",
        href: "/settings/connect-config",
        icon: Palette,
      },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

interface DesktopSidebarProps {
  user: UserInfo | null;
}

export default function DesktopSidebar({ user }: DesktopSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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

  function handleSignOut() {
    router.push("/auth/logout");
  }

  return (
    <Sidebar className="border-r border-border bg-background">
      {/* Header — logo / brand */}
      <SidebarHeader className="px-4 py-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            ISCE Connect
          </span>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-2">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="gap-2.5 text-sm"
                    >
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer — user info + logout */}
      <SidebarFooter className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {user?.displayPicture?.startsWith('http') ? (
              <Image
                src={user.displayPicture}
                alt={displayName}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {initials}
              </span>
            )}
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {displayName}
            </p>
            {user?.email && (
              <p className="text-xs text-muted-foreground truncate leading-tight">
                {user.email}
              </p>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
