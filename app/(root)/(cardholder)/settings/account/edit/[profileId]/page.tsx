import { getAuthInfo } from "@/actions/auth";
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "@/lib/const";
import ProfileClient from "@/components/profileClient";

async function getProfile(profileId: string, accessToken: string) {
  const res = await fetch(
    `${NEXT_PUBLIC_CONNECT_API_ORIGIN}${URLS.multi_profile.one.replace(
      "{profileId}",
      profileId
    )}`,
    {
      cache: "no-store",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.profile ?? null;
}

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const auth = await getAuthInfo();
  const accessToken = auth?.accessToken;

  const profile = await getProfile((await params).profileId!, accessToken!);

  return (
    <ProfileClient
      connectProfile={profile}
      authUser={auth?.user}
      profileId={(await params).profileId}
      accessToken={accessToken}
    />
  );
}
