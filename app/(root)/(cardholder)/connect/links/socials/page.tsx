import { getAuthInfo } from "@/actions/auth";
import SocialPage from "@/components/cardholder/connect/socials/connect-social-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function SocialLinksPage() {
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
      {/* Hero */}
      <section className="px-5 pt-10 pb-4 relative">
        <div className="absolute inset-0 -z-10">
          <div className="w-48 h-48 bg-primary/20 blur-[90px] rounded-full absolute top-0 left-0"></div>
          <div className="w-36 h-36 bg-white/10 blur-2xl rounded-full absolute bottom-4 right-4"></div>
        </div>

        <h1 className="text-3xl font-semibold leading-snug tracking-tight">
          Social
          <span className="ml-1 bg-gradient-to-r from-primary/80 to-white/90 bg-clip-text text-transparent">
            Profiles
          </span>
        </h1>

        <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-md">
          Bring your online identity together in one place. Add your
          professional networks, creative platforms, and social presence for
          people to easily find and follow you.
        </p>

        <div className="mt-6 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
      </section>

      {/* Content */}
      <section className="p-5">
        <SocialPage
          accessToken={auth?.accessToken}
          profileId={profileId!}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
