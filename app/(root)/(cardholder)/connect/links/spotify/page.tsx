import { getAuthInfo } from "@/actions/auth";
import SpotifyPage from "@/components/cardholder/connect/spotify/connect-spotify-page";
import { URLS } from "@/lib/const";

export const dynamic = "force-dynamic";

export default async function SpotifyLinksPage() {
  const auth = await getAuthInfo();
  const isAuthed = !("error" in auth) && !auth.isExpired;

  const accessToken = auth?.accessToken;
  let profileId: string | null = null;

  //   console.log({ profileId });
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
          Share What{" "}
          <span className="bg-gradient-to-r from-primary/80 to-white bg-clip-text text-transparent">
            Moves You
          </span>
        </h1>

        <p className="text-white/60 text-sm mt-1 leading-relaxed">
          {`Add your favorite playlists, albums, or tracks. Whether you’re setting
          a mood or showing people what inspires you — your sound tells a story.`}
        </p>
      </section>

      <section className="p-5">
        <SpotifyPage
          accessToken={auth?.accessToken!}
          profileId={profileId!}
          isAuthed={isAuthed}
        />
      </section>
    </main>
  );
}
