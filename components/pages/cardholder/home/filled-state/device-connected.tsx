"use client";

import { Switch } from "@/components/ui/switch";
import {
  DeleteIcon,
  DisconnectIcon,
  RefreshIcon,
  ToggleIcon,
} from "@/lib/icons";
import { CircleX, RefreshCw, Trash2 } from "lucide-react";

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
  devices: Device[];
  onDisconnect?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
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
        {devices.map((d, i) => (
          <div key={d.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                  {d.iconSrc ? (
                    <img
                      src={d.iconSrc}
                      alt=""
                      className="w-5 h-5 object-cover"
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                  )}
                </div>
                <div>
                  <p className="text-base">{d.name}</p>
                  <p className="text-[10px] text-white/60">{d.address}</p>
                </div>
              </div>
              <span className="text-[10px] text-white/60">
                {d.lastSeenLabel ?? "Now"}
              </span>
            </div>

            {/* Divider */}
            {i < devices.length - 1 && (
              <div className="mt-3 h-px bg-white/10" />
            )}

            {/* Actions (only on last row like your mock, but we’ll show for both) */}
            {i === devices.length - 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
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
        ))}
      </div>
    </div>
  );
}
