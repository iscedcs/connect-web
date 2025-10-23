"use client";

import { DEVICE_TYPE } from "@/lib/const";
import {
  DeleteIcon,
  DisconnectIcon,
  RefreshIcon,
  ToggleIcon,
} from "@/lib/icons";
import { getDeviceName } from "@/lib/utils";
import { ChevronDown, ChevronUp, Cog, CreditCard } from "lucide-react";
import { useState } from "react";

type Device = {
  id: string;
  name: string; // e.g., "Wristband"
  address: string; // e.g., "Block 2 H Cl, Festac..."
  iconSrc?: string; // device avatar
  lastSeenLabel?: string; // e.g., "Now"
};

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
    <div className="bg-neutral-900 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Devices</h3>
          <a
            href={manageHref}
            className="text-sm text-white/70 inline-flex items-center gap-1">
            Manage your devices <span>›</span>
          </a>
        </div>
        <ToggleIcon />
      </div>

      {/* List */}
      <div className="mt-4 space-y-4">
        {devices.map((d, i) => {
          const isExpanded = expandedDeviceId === d.id;
          return (
            <div key={d.id} className=" transition-all duration-300">
              {/* Device row */}
              <button
                onClick={() => toggleExpand(d.id)}
                className="flex items-start justify-between  w-full text-left">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {d.type === DEVICE_TYPE.CARD ? (
                      <CreditCard className="h-5 w-5" />
                    ) : (
                      <Cog className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-base">{getDeviceName(d.type)}</p>
                    <p className="text-[10px] text-white/60">{d.label}</p>
                  </div>
                </div>
              </button>
              <div
                className={`h-px bg-white/10 transition-all ${
                  isExpanded ? "opacity-100 mt-1 mb-4" : "opacity-0 mt-0 mb-0"
                }`}
              />

              {/* Expandable actions */}
              {isExpanded && (
                <div className="mt-4  grid grid-cols-3 gap-3 text-center animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => onDisconnect?.(d.id)}
                    className="flex flex-col items-center gap-2">
                    <span className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                      <DisconnectIcon className="w-5 h-5" />
                    </span>
                    <span className="text-xs">Disconnect</span>
                  </button>
                  <button
                    onClick={() => onRefresh?.(d.id)}
                    className="flex flex-col items-center gap-2">
                    <span className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                      <RefreshIcon className="w-5 h-5" />
                    </span>
                    <span className="text-xs">Refresh</span>
                  </button>
                  <button
                    onClick={() => onDelete?.(d.id)}
                    className="flex flex-col items-center gap-2">
                    <span className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                      <DeleteIcon className="w-5 h-5" />
                    </span>
                    <span className="text-xs">Delete</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
