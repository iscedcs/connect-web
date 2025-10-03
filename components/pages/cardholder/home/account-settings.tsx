"use client";

import {
  AccountSettingsIcon,
  ContactIcon,
  EditIcon,
  InviteIcon,
  NotificationIcon,
  PrivacyIcon,
  SignOutIcon,
  TermsIcon,
} from "@/lib/icons";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Row = {
  href?: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent) => void;
};

const baseRows: Row[] = [
  { href: "/profile/edit", label: "Edit profile", Icon: EditIcon },
  { href: "/account", label: "Account settings", Icon: AccountSettingsIcon },
  {
    href: "/notifications",
    label: "Notification settings",
    Icon: NotificationIcon,
  },
  { href: "/invite", label: "Invite a friend", Icon: InviteIcon },
  { href: "/support", label: "Contact support", Icon: ContactIcon },
  { href: "/terms", label: "Terms of service", Icon: TermsIcon },
  { href: "/privacy", label: "Privacy policy", Icon: PrivacyIcon },
];

export default function AccountSettingsList({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const authRow: Row = isAuthenticated
    ? {
        href: "/auth/logout",
        label: "Sign out from this device",
        Icon: SignOutIcon,
      }
    : {
        label: "Sign in to this device",
        Icon: SignOutIcon,
        onClick: (e) => {
          e.preventDefault();
          const back = window.location.href;
          router.push(`/auth/login?redirect=${encodeURIComponent(back)}`);
        },
      };
  const rows = [...baseRows, authRow];
  return (
    <div className="mt-4">
      <h4 className="text-xl font-extrabold text-gray-300 mb-3">
        Account settings
      </h4>
      <div className=" rounded-2xl overflow-hidden">
        {rows.map(({ href, label, Icon, onClick }) =>
          href ? (
            <Link
              key={label}
              href={href!}
              className="flex items-center justify-between px-4 py-4 hover:bg-neutral-800 active:bg-neutral-800">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-200" />
                <span className="text-sm">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          ) : (
            <Link
              key={label}
              href="#"
              onClick={onClick}
              className="flex items-center justify-between px-4 py-4 hover:bg-neutral-800 active:bg-neutral-800">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-200" />
                <span className="text-sm">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          )
        )}
      </div>
    </div>
  );
}
