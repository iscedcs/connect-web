import { fetchPublicProfileBySlug } from '@/lib/services/public-profile';
import { fetchPublicForm } from '@/lib/services/forms';
import PublicFormClient from '@/components/customer/forms/public-form-client';

export default async function SlugPublicFormPage({
	params,
}: {
	params: Promise<{ slug: string; formId: string }>;
}) {
	const { slug, formId } = await params;

	const profileLookup = await fetchPublicProfileBySlug(slug);
	if (!profileLookup.data)
		return <div className='p-6 text-white'>Profile not found</div>;

	const profile = profileLookup.data.profile;

	const formRes = await fetchPublicForm({
		profileId: profile.id,
		formId,
	});

	if (!formRes?.form || !formRes.form.is_visible) {
		return <div className='p-6 text-white/60'>Form not available</div>;
	}

	return (
		<PublicFormClient
			profile={profile}
			profileId={profile.id}
			form={formRes.form}
		/>
	);
}
