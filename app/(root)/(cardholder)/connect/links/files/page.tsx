import { getAuthInfo } from "@/actions/auth";
import FilesPage from "@/components/cardholder/connect/files/connect-files-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function FilesManagementPage() {
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
      <section className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-semibold">
          Upload & Share Your{" "}
          <span className="bg-gradient-to-r from-primary/80 to-white bg-clip-text text-transparent">
            Files
          </span>
        </h1>

        <p className="text-white/60 text-sm mt-1 leading-relaxed">
          Upload documents, brochures, portfolios, or any file you want your
          audience to access. Simple, clean, and secure storage powered by ISCE.
        </p>
      </section>

      <section className="p-5">
        <FilesPage
          accessToken={accessToken}
          profileId={profileId!}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
