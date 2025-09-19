"use client";

import Link from "next/link";
import {
  PencilLine,
  UserRound,
  Bell,
  UserPlus,
  LifeBuoy,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
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

type Row = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const rows: Row[] = [
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
  { href: "/logout", label: "Sign out from this device", Icon: SignOutIcon },
];

export default function AccountSettingsList() {
  return (
    <div className="mt-4">
      <h4 className="text-sm text-gray-300 mb-3">Account settings</h4>
      <div className="divide-y divide-neutral-800 rounded-2xl overflow-hidden bg-neutral-900">
        {rows.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between px-4 py-4 hover:bg-neutral-800 active:bg-neutral-800">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-200" />
              <span className="text-sm">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
