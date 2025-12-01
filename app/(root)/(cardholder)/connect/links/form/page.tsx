import { getAuthInfo } from "@/actions/auth";
import FormPage from "@/components/cardholder/connect/forms/connect-forms-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function FormsLinksPage() {
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
          <div className="w-40 h-40 bg-primary/25 blur-[100px] absolute top-0 left-0"></div>
          <div className="w-28 h-28 bg-white/10 blur-xl absolute bottom-4 right-4"></div>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight leading-snug">
          Create & Manage
          <span className="ml-1 bg-gradient-to-r from-primary/80 to-white/90 bg-clip-text text-transparent">
            Forms
          </span>
        </h1>

        <p className="text-white/60 text-sm mt-3 max-w-md leading-relaxed">
          Build custom forms, questionnaires, surveys, or booking forms that
          visitors can submit.
        </p>

        <div className="mt-6 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
      </section>

      <section className="p-5">
        <FormPage
          accessToken={auth?.accessToken}
          profileId={profileId!}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
