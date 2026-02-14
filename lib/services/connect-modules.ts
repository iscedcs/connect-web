import { URLS } from "@/lib/const";

export async function getConnectModules(
  profileId: string,
  accessToken: string
) {
  const base = process.env.NEXT_PUBLIC_CONNECT_API_URL;

  async function fetchList(url: string) {
    try {
      const res = await fetch(`${base}${url}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const json = await res.json();
      return json?.data || {};
    } catch {
      return {};
    }
  }

  return {
    contact: await fetchList(
      URLS.profile_contact.all.replace("{profileId}", profileId)
    ),
    links: await fetchList(URLS.links.all.replace("{profileId}", profileId)),
    videos: await fetchList(URLS.videos.all.replace("{profileId}", profileId)),
    socials: await fetchList(
      URLS.profile_social.all.replace("{profileId}", profileId)
    ),
    meetings: await fetchList(
      URLS.meetings.all.replace("{profileId}", profileId)
    ),
    appointments: await fetchList(
      URLS.appointments.all.replace("{profileId}", profileId)
    ),
    spotify: await fetchList(
      URLS.spotify.all.replace("{profileId}", profileId)
    ),
    files: await fetchList(URLS.files.all.replace("{profileId}", profileId)),
    forms: await fetchList(URLS.forms.all.replace("{profileId}", profileId)),
  };
}
