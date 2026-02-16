// app/devices/page.tsx (server component)
import { getAuthInfo } from '@/actions/auth';
import DevicesList from '@/components/pages/cardholder/devices/deviceList';
import { getUserDevices } from '@/lib/services/device';
import { getDeviceBindings } from '@/lib/services/device-profile';
import { generateMetadata } from '@/lib/metadata';
import { URLS } from '@/lib/const';

const CONNECT_API = process.env.NEXT_PUBLIC_CONNECT_API_URL;

export const metadata = generateMetadata({
	title: 'Devices',
	description:
		'Manage your connected devices. Link devices to profiles, view bindings, and configure NFC-enabled devices and wearables.',
	keywords: [
		'devices',
		'NFC',
		'wearables',
		'connectivity',
		'manage devices',
		'profiles',
	],
});

export default async function DevicesPage() {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo || authInfo.isExpired) {
		return <div className='text-white p-6'>Redirecting to login...</div>;
	}

	const userId = authInfo.user.id;
	const accessToken = authInfo.accessToken;

	// Fetch devices and bindings + profiles in parallel
	const [devices, bindingsData, profilesRes] = await Promise.all([
		getUserDevices(userId!, accessToken),
		getDeviceBindings(accessToken),
		fetch(`${CONNECT_API}${URLS.multi_profile.all}`, {
			headers: { authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		})
			.then((r) => r.json())
			.catch(() => null),
	]);

	const profiles = profilesRes?.data?.profiles ?? [];
	const bindings = bindingsData?.bindings ?? [];

	return (
		<main className='min-h-screen bg-black text-white p-6'>
			<DevicesList
				devices={devices}
				userId={userId!}
				accessToken={accessToken}
				profiles={profiles}
				bindings={bindings}
			/>
		</main>
	);
}
