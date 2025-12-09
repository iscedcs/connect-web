"use client";

import { DEVICE_TYPE } from "@/lib/const";
import {
  DeleteIcon,
  DisconnectIcon,
  RefreshIcon,
  ToggleIcon,
} from "@/lib/icons";
import { getDeviceName } from "@/lib/utils";
import { CreditCard, Cog } from "lucide-react";
import { useState } from "react";

export default function DevicesConnectedCard({
  manageHref = "/devices",
  enabled = true,
  onToggle,
  devices,
  onDisconnect,
  onRefresh,
  onDelete,
}: {
  manageHref?: string;
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  devices: DeviceInterface[];
  onDisconnect?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedDeviceId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#151515] rounded-3xl p-6 text-white">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-normal">Devices</h3>
          <a
            href={manageHref}
            className="text-sm text-[#6F6F70] inline-flex items-center gap-1">
            Manage your devices <span>›</span>
          </a>
        </div>

        <div onClick={() => onToggle?.(!enabled)} className="cursor-pointer">
          <ToggleIcon />
        </div>
      </div>

      {/* Device List */}
      <div className="mt-6 space-y-6">
        {devices.map((d) => {
          const isExpanded = expandedDeviceId === d.id;

          return (
            <div key={d.id} className="w-full transition-all">
              {/* Device Row */}
              <button
                onClick={() => toggleExpand(d.id)}
                className="w-full flex items-start gap-3 text-left rounded-xl px-2 py-1 transition-all active:scale-[0.98]">
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-full bg-[#1C1C1C] flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isExpanded ? "scale-[1.05]" : "scale-100"
                  }`}>
                  {d.type === DEVICE_TYPE.CARD ? (
                    <CreditCard className="h-5 w-5 stroke-[#868686]" />
                  ) : (
                    <Cog className="h-5 w-5 stroke-[#868686]" />
                  )}
                </div>

                {/* TEXT + TIMESTAMP + DIVIDER */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-normal">
                        {getDeviceName(d.type)}
                      </p>
                      <p className="text-[10px] text-[#868686] leading-tight">
                        {d.label}
                      </p>
                    </div>

                    <p className="text-[10px] text-[#868686] ml-4 mt-[2px]">
                      {d.assignedAt}
                    </p>
                  </div>

                  {!isExpanded && (
                    <div className="border-b border-white/10 mt-4 w-full"></div>
                  )}
                </div>
              </button>

              {/* Expanded Actions */}
              {isExpanded && (
                <div className="mt-5 grid grid-cols-3 gap-4 text-center animate-in fade-in slide-in-from-top-2 duration-200">
                  {[
                    {
                      label: "Disconnect",
                      icon: (
                        <DisconnectIcon className="w-5 h-5 stroke-[#868686]" />
                      ),
                      fn: onDisconnect,
                    },
                    {
                      label: "Refresh",
                      icon: (
                        <RefreshIcon className="w-5 h-5 stroke-[#868686]" />
                      ),
                      fn: onRefresh,
                    },
                    {
                      label: "Delete",
                      icon: <DeleteIcon className="w-5 h-5 stroke-[#868686]" />,
                      fn: onDelete,
                    },
                  ].map((act, i) => (
                    <button
                      key={i}
                      onClick={() => act.fn?.(d.id)}
                      className="flex flex-col items-center gap-2">
                      <span className="w-12 h-12 rounded-full bg-[#1C1C1C] flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.15)]">
                        {act.icon}
                      </span>
                      <span className="text-xs text-white/70">{act.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
