import SaveContactForm from '@/components/customer/save-contact-form';

export default async function SlugSaveContactPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	return (
		<main className='h-[100svh] bg-black'>
			<SaveContactForm
				profileId={slug}
				lookupMode='slug'
			/>
		</main>
	);
}
