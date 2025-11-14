import { getAuthInfo } from "@/actions/auth";
import LinkPage from "@/components/cardholder/connect/links/connect-links-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function LinkManagementPage() {
  const auth = await getAuthInfo();
  const isAuthed = !("error" in auth) && !auth.isExpired;

  const accessToken = auth?.accessToken;
  let profileId: string | null = null;

  if (!accessToken) {
    console.warn("⚠️ No access token found.");
  } else {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${URLS.multi_profile.all}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (json?.data?.profiles?.length) {
        const defaultProfile = json.data.profiles.find(
          (p: any) => p.is_default === true
        );
        profileId = defaultProfile?.id || json.data.profiles[0].id;
      } else {
        console.warn("⚠️ No profiles returned:", json);
      }
    } catch (err) {
      console.error("❌ Error fetching profiles:", err);
    }
  }
  console.log("✅ Final resolved profileId:", profileId);
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-semibold">Manage your Links</h1>
        <p className="text-white/60 text-sm mt-1">
          Add or edit links that appear on your Connect profile.
        </p>
      </section>

      <section className="p-5">
        <LinkPage
          accessToken={accessToken}
          profileId={profileId!}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
