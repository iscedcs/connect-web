import WearableClientSection from '@/components/pages/cardholder/home/wearableclientsection';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Wearables',
	description: 'Manage your Connect wearable devices and accessories.',
	keywords: ['wearables', 'devices', 'accessories'],
});

export default function WearablesPage() {
	return <WearableClientSection />;
}
