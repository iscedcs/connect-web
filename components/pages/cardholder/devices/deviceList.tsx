// components/pages/devices/devices-list.tsx
"use client";

import { useState } from "react";
import { DEVICE_TYPE, URLS } from "@/lib/const";
import { getDeviceName } from "@/lib/utils";
import { RefreshIcon, DeleteIcon, DisconnectIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { CreditCard, Watch, Tag, Cog, Pencil } from "lucide-react";
import { DevicesListSkeleton } from "@/components/shared/skeleton/deviceList";
import { toast } from "sonner";
import UpdateDeviceModal from "@/components/shared/models/updateDeviceModel";

type Device = DeviceInterface;

export default function DevicesList({
  devices: initialDevices,
  userId,
  accessToken,
}: {
  devices: Device[];
  userId: string;
  accessToken: string;
}) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<Device | null>(null);

  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);

    const res = await fetch(`/api/device?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const json = await res.json();
    setDevices(json?.data ?? []);
    setLoading(false);
  };

  return (
    <>
      {activeModal && (
        <UpdateDeviceModal
          open={!!activeModal}
          onClose={() => setActiveModal(null)}
          device={activeModal}
          accessToken={accessToken}
          onUpdated={handleRefresh}
        />
      )}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">My Devices</h1>
        <Button onClick={handleRefresh} variant="ghost">
          <RefreshIcon className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <DevicesListSkeleton />
      ) : devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-white/70 mb-4">No connected devices found.</p>
          <Button className="rounded-full px-6 py-2">Connect a device</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {devices.map((device) => {
            const isExpanded = selected === device.id;
            const icon =
              device.type === DEVICE_TYPE.CARD ? (
                <CreditCard className="h-5 w-5" />
              ) : device.type === DEVICE_TYPE.WRISTBAND ? (
                <Watch className="h-5 w-5" />
              ) : device.type === DEVICE_TYPE.STICKER ? (
                <Tag className="h-5 w-5" />
              ) : (
                <Cog className="h-5 w-5" />
              );

            return (
              <div
                key={device.id}
                className="border border-white/10 rounded-2xl p-4">
                <button
                  onClick={() => setSelected(isExpanded ? null : device.id)}
                  className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center">
                      {icon}
                    </div>
                    <div>
                      <h2 className="text-base font-medium">
                        {getDeviceName(device.type)}
                      </h2>
                      <p className="text-xs text-white/60">
                        Added {device.assignedAt}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-white/50">
                    {device.lastUsedAt}
                  </span>
                </button>

                {isExpanded && (
                  <div className="grid grid-cols-3 gap-3 text-center mt-6">
                    <button className="flex flex-col items-center gap-2">
                      <span className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                        <DisconnectIcon className="w-5 h-5" />
                      </span>
                      <span className="text-xs">Disconnect</span>
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="flex flex-col items-center gap-2">
                      <span className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                        <RefreshIcon className="w-5 h-5" />
                      </span>
                      <span className="text-xs">Refresh</span>
                    </button>

                    <button
                      onClick={() => setActiveModal(device)}
                      className="flex flex-col items-center gap-2">
                      <span className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                        <Pencil className="w-5 h-5" />
                      </span>
                      <span className="text-xs">Update</span>
                    </button>
                    {/* <button className="flex flex-col items-center gap-2">
                      <span className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                        <DeleteIcon className="w-5 h-5" />
                      </span>
                      <span className="text-xs">Delete</span>
                    </button> */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
