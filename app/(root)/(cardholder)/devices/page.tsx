// app/devices/page.tsx (server component)
import { getAuthInfo } from "@/actions/auth";
import DevicesList from "@/components/pages/cardholder/devices/deviceList";
import { getUserDevices } from "@/lib/services/device";

export default async function DevicesPage() {
  const authInfo = await getAuthInfo();

  if ("error" in authInfo || authInfo.isExpired) {
    return <div className="text-white p-6">Redirecting to login...</div>;
  }

  const userId = authInfo.user.id;
  const accessToken = authInfo.accessToken;

  const devices = await getUserDevices(userId!, accessToken);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <DevicesList
        devices={devices}
        userId={userId!}
        accessToken={accessToken}
      />
    </main>
  );
}
