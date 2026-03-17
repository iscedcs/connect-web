import { URLS } from '@/lib/const';

export async function getConnectModules(
	profileId: string,
	accessToken: string,
) {
	const base =
		process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;

	async function fetchList(url: string) {
		try {
			const res = await fetch(`${base}${url}`, {
				headers: { Authorization: `Bearer ${accessToken}` },
				cache: 'no-store',
			});
			const json = await res.json();
			return json?.data || {};
		} catch {
			return {};
		}
	}

	const [
    contact,
    links,
    videos,
    socials,
    meetings,
    appointments,
    spotify,
    files,
    forms,
  ] = await Promise.all([
    fetchList(URLS.profile_contact.all.replace("{profileId}", profileId)),
    fetchList(URLS.links.all.replace("{profileId}", profileId)),
    fetchList(URLS.videos.all.replace("{profileId}", profileId)),
    fetchList(URLS.profile_social.all.replace("{profileId}", profileId)),
    fetchList(URLS.meetings.all.replace("{profileId}", profileId)),
    fetchList(URLS.appointments.all.replace("{profileId}", profileId)),
    fetchList(URLS.spotify.all.replace("{profileId}", profileId)),
    fetchList(URLS.files.all.replace("{profileId}", profileId)),
    fetchList(URLS.forms.all.replace("{profileId}", profileId)),
  ]);

  return {
    contact,
    links,
    videos,
    socials,
    meetings,
    appointments,
    spotify,
    files,
    forms,
  };
}
