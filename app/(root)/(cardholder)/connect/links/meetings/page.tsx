import { getAuthInfo } from "@/actions/auth";
import MeetingPage from "@/components/cardholder/connect/meeting/connect-meeting-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
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
        const defaultProfile =
          json.data.profiles.find((p: any) => p.is_default === true) ??
          json.data.profiles[0];

        profileId = defaultProfile.id;
      } else {
        console.warn("⚠️ No profiles returned:", json);
      }
    } catch (err) {
      console.error("❌ Error fetching profiles:", err);
    }
  }

  console.log("ProfileId:", profileId);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-semibold">Manage Your Meeting Links</h1>
        <p className="text-white/60 text-sm mt-1 leading-relaxed">
          Add your preferred meeting platforms and make it easier for people to
          connect with you; whether for networking, professional discussions,
          collaborations, or quick check-ins.
        </p>
      </section>

      <section className="p-5">
        <MeetingPage
          accessToken={auth?.accessToken}
          profileId={profileId!}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
