import { getCurrentUser } from "@/actions/auth";
import ProfileClient from "@/components/profileClient";
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "@/lib/const";

async function getConnectProfile() {
  const res = await fetch(
    `${NEXT_PUBLIC_CONNECT_API_ORIGIN}${URLS.profile.profile}`,
    {
      cache: "no-store",
      headers: { accept: "application/json" },
    }
  );
  if (res.status === 404 || res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load profile");

  const json = await res.json();
  return json?.data?.profile ?? null;
}

export default async function ProfilePage() {
  const connectProfile = await getConnectProfile();
  const authUser = await getCurrentUser();

  return <ProfileClient connectProfile={connectProfile} authUser={authUser} />;
}
