import { getAuthInfo } from "@/actions/auth";
import LinkPage from "@/components/cardholder/connect/links/connect-links-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function LinkManagementPage() {
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
      <section className="px-5 pt-10 pb-4 relative">
        {/* Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="w-44 h-44 bg-primary/25 blur-3xl rounded-full absolute top-0 left-0 opacity-40"></div>
          <div className="w-32 h-32 bg-white/10 blur-2xl rounded-full absolute bottom-4 right-4 opacity-25"></div>
        </div>

        <h1 className="text-3xl font-semibold leading-snug tracking-tight">
          Manage Your
          <span className="ml-1 bg-gradient-to-r from-primary/80 to-white/90 bg-clip-text text-transparent">
            Profile Links
          </span>
        </h1>

        <p className="text-white/60 text-sm mt-3 max-w-md leading-relaxed">
          Showcase your work, social presence, and important destinations. Add
          links that tell your story and help others discover the best of you.
        </p>

        <div className="mt-6 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
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
