import { getAuthInfo } from "@/actions/auth";
import AppointmentPage from "@/components/cardholder/connect/appointments/connect-appointment-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function AppointmentLinksPage() {
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
        const defaultProfile = json.data.profiles.find(
          (p: any) => p.is_default === true
        );

        profileId = defaultProfile?.id || json.data.profiles[0].id;
      }
    } catch (err) {
      console.error("❌ Error fetching profiles:", err);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <section className="px-5 pt-10 pb-4 relative">
        {/* Soft Glow Accent */}
        <div className="absolute inset-0 -z-10">
          <div className="w-40 h-40 bg-primary/20 blur-3xl rounded-full absolute top-0 left-0 opacity-40"></div>
          <div className="w-32 h-32 bg-white/10 blur-2xl rounded-full absolute bottom-4 right-4 opacity-20"></div>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight leading-snug">
          Appointment Scheduling
          <span className="ml-1 bg-gradient-to-r from-primary/80 to-white/90 bg-clip-text text-transparent">
            Made Simple
          </span>
        </h1>

        <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-md">
          Your time is valuable. Create dedicated booking links, manage their
          visibility, and guide people to the right conversation — whether it's
          a discovery call, consultation, or follow-up session.
        </p>

        {/* Divider */}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
      </section>

      {/* CONTENT */}
      <section className="p-5 pb-14">
        <AppointmentPage
          accessToken={auth?.accessToken}
          profileId={profileId!}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
