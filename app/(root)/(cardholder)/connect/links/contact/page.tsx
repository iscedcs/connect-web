import { getAuthInfo } from "@/actions/auth";
import ContactPage from "@/components/cardholder/connect/contact/connect-contact-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function ContactManagementPage() {
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

  if (!profileId)
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <p className="text-white/70 text-center max-w-sm leading-relaxed">
          No Connect profile found for this account. Please create a profile to
          continue.
        </p>
      </main>
    );

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Glow */}
      <section className="px-5 pt-10 pb-4 relative">
        <div className="absolute inset-0 -z-10">
          <div className="w-40 h-40 bg-primary/20 blur-3xl rounded-full absolute top-0 left-0 opacity-35"></div>
          <div className="w-28 h-28 bg-white/10 blur-2xl rounded-full absolute bottom-4 right-4 opacity-20"></div>
        </div>

        <h1 className="text-3xl font-semibold leading-snug tracking-tight">
          Manage Your
          <span className="ml-1 bg-gradient-to-r from-primary/80 to-white/90 bg-clip-text text-transparent">
            Contact Details
          </span>
        </h1>

        <p className="text-white/60 text-sm mt-3 max-w-md leading-relaxed">
          Add phone numbers, email addresses, and other touchpoints that help
          people reach you directly — both professionally and personally.
        </p>

        <div className="mt-6 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
      </section>

      <section className="p-5">
        <ContactPage
          accessToken={accessToken}
          profileId={profileId}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
