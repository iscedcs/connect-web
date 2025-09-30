import OtpClientSection from '@/components/pages/home/otpclientsection';

interface PageProps {
	searchParams: {
		cardid?: string;
		type?: string;
	};
}

export default function Page({ searchParams }: PageProps) {
	return (
		<OtpClientSection
			cardId={searchParams.cardid}
			deviceType={searchParams.type}
		/>
	);
}
