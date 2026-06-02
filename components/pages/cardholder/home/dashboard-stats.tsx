"use client";

import { BarChart2, Users, MessageSquare, Layers } from "lucide-react";

interface DashboardStatsProps {
  tapsThisWeek: number;
  contactsReceived: number;
  unreadMessages: number;
  activeModules: number;
}

interface StatCard {
  icon: React.ElementType;
  label: string;
  value: number;
  sublabel: string;
  iconColor: string;
  iconBg: string;
}

export default function DashboardStats({
  tapsThisWeek,
  contactsReceived,
  unreadMessages,
  activeModules,
}: DashboardStatsProps) {
  const stats: StatCard[] = [
    {
      icon: BarChart2,
      label: "Card Taps",
      value: tapsThisWeek,
      sublabel: "this week",
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/10",
    },
    {
      icon: Users,
      label: "Contacts",
      value: contactsReceived,
      sublabel: "received",
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/10",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      value: unreadMessages,
      sublabel: "unread",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    {
      icon: Layers,
      label: "Modules",
      value: activeModules,
      sublabel: "active",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex flex-col gap-3 rounded-2xl bg-neutral-900 border border-white/5 px-4 py-4"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.iconBg}`}
            >
              <Icon className={`size-4 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white leading-none tabular-nums">
                {stat.value}
              </p>
              <p className="text-[11px] text-white/40 mt-1.5 leading-tight">
                {stat.label}
                <span className="block text-white/25">{stat.sublabel}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
