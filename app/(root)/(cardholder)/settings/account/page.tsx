import { getAuthInfo } from "@/actions/auth";
import ProfileList from "@/components/settings/account/profile-list";
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "@/lib/const";

export default async function AccountSettingsPage() {
  const auth = await getAuthInfo();
  const accessToken = auth?.accessToken;

  const res = await fetch(
    `${NEXT_PUBLIC_CONNECT_API_ORIGIN}${URLS.multi_profile.all}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  const json = await res.json();
  const profiles = json?.data?.profiles ?? [];

  return (
    <main className="min-h-screen bg-black text-white p-4 pt-24">
      <h1 className="text-2xl font-bold">Account profiles</h1>
      <p className="text-white/50 text-sm mt-1">
        Manage your public contact card profiles.
      </p>

      <div className="mt-8">
        <ProfileList profiles={profiles} accessToken={accessToken!} />
      </div>
    </main>
  );
}
