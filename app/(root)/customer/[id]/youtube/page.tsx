import { LeftIcon, RightIcon } from "@/lib/icons";
import { fetchPublicProfile } from "@/lib/services/public-profile";
import Link from "next/link";
import { InlineRenderer } from "@/components/customer/inline-renderers/inline-renderer";

function isYouTubeUrl(url?: string) {
  return Boolean(url && /youtube\.com|youtu\.be/i.test(url));
}

function isYouTubeVideoUrl(url?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    return (
      (host.includes("youtube.com") &&
        (parsed.searchParams.has("v") ||
          path.startsWith("/shorts/") ||
          path.startsWith("/embed/"))) ||
      host.includes("youtu.be")
    );
  } catch {
    return false;
  }
}

export default async function PublicYouTubePage({ params }: any) {
  const { id } = await params;
  const profileData = await fetchPublicProfile(id);

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black text-white p-6">Profile not found</div>
    );
  }

  const fromSocials = (profileData.socials ?? [])
    .filter((item: any) => isYouTubeUrl(item.url))
    .map((item: any) => ({
      id: item.id,
      title: item.title || "YouTube",
      url: item.url,
      icon: item.icon,
      platform: "youtube",
    }));

  const fromVideos = (profileData.videos ?? [])
    .filter((item: any) => isYouTubeUrl(item.url))
    .map((item: any) => ({
      id: item.id,
      title: item.title || "YouTube Video",
      url: item.url,
      icon: item.icon,
      platform: "youtube",
    }));

  const fromLinks = (profileData.links ?? [])
    .filter((item: any) => isYouTubeUrl(item.url))
    .map((item: any) => ({
      id: item.id,
      title: item.title || "YouTube Link",
      url: item.url,
      icon: item.icon,
      platform: "youtube",
    }));

  const dedupedMap = new Map<string, any>();
  [...fromSocials, ...fromVideos, ...fromLinks].forEach((item: any) => {
    const key = item.url || item.id;
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, item);
    }
  });
  const youtubeItems = Array.from(dedupedMap.values());

  return (
    <main className="min-h-screen bg-black text-white px-4 pt-6 pb-20">
      <div className="mb-6">
        <Link href={`/customer/${id}`} className="text-white/50 text-sm">
          <LeftIcon />
        </Link>

        <h1 className="text-3xl font-extrabold mt-2">YouTube</h1>
        <p className="text-white/60 text-sm mt-1">
          Videos and channels shared by {profileData.profile?.name}
        </p>
      </div>

      <section className="space-y-3">
        {youtubeItems.length === 0 && (
          <p className="text-white/50 text-sm">No YouTube links found</p>
        )}

        {youtubeItems.map((item: any) => {
          const isVideo = isYouTubeVideoUrl(item.url);
          if (!isVideo) {
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl bg-[#121212] p-4 hover:bg-[#1a1a1a] transition"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.title || "YouTube Channel"}
                  </p>
                  <p className="text-[10px] text-white/50 truncate max-w-[240px]">
                    {item.url}
                  </p>
                </div>
                <span className="text-white/50">
                  <RightIcon />
                </span>
              </a>
            );
          }

          return (
            <div key={item.id} className="rounded-xl bg-[#121212] p-3">
              <p className="text-sm font-medium mb-2">{item.title || "YouTube Video"}</p>
              <InlineRenderer item={item} />
            </div>
          );
        })}
      </section>
    </main>
  );
}
