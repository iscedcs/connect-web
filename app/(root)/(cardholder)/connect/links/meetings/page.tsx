import { getAuthInfo } from "@/actions/auth";
import MeetingPage from "@/components/cardholder/connect/meeting/connect-meeting-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const auth = await getAuthInfo();
  const isAuthed = !("error" in auth) && !auth.isExpired;

  const accessToken = auth?.accessToken;
  let profileId: string | null = null;

  if (accessToken) {
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
      }
    } catch (err) {
      console.error("❌ Error fetching profiles:", err);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="px-5 pt-10 pb-4 relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10">
          <div className="w-44 h-44 bg-primary/20 blur-[90px] absolute top-0 left-0 opacity-40"></div>
          <div className="w-32 h-32 bg-white/10 blur-2xl absolute bottom-6 right-6 opacity-25"></div>
        </div>

        <h1 className="text-3xl font-semibold leading-snug tracking-tight">
          Meeting
          <span className="ml-1 bg-gradient-to-r from-primary/80 to-white/90 text-transparent bg-clip-text">
            Links
          </span>
        </h1>

        <p className="text-white/60 mt-3 max-w-md text-sm leading-relaxed">
          Make it easy for people to schedule time with you. Add your meeting
          platforms, manage visibility, and set your default link for
          professional conversations, networking, and collaborations.
        </p>

        <div className="mt-6 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
      </section>

      {/* MAIN CONTENT */}
      <section className="p-5">
        <MeetingPage
          accessToken={accessToken}
          profileId={profileId!}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
