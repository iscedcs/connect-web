import LegalLayout from '@/components/legal/legal-layout';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Terms of Service',
	description:
		'Terms governing your use of ISCE Connect and related services.',
	keywords: ['terms', 'service', 'legal'],
});

export default function TermsPage() {
	return (
		<LegalLayout
			title='Terms of Service'
			lastUpdated='January 2025'
		>
			<div className='space-y-3'>
				<h2>1. Introduction</h2>
				<p>
					These Terms govern your use of ISCE Connect and related
					services within the ISCE ecosystem.
				</p>

				<h2>2. The Connect Service</h2>
				<p>
					Connect allows users to create digital profiles, share
					contact information, links, files, and integrate with events
					and Smart devices.
				</p>

				<h2>3. User Responsibilities</h2>
				<ul className='space-y-1'>
					<li>Provide accurate and lawful information</li>
					<li>Maintain control of your account credentials</li>
					<li>Do not misuse profiles or impersonate others</li>
				</ul>

				<h2>4. Content Ownership</h2>
				<p>
					You retain ownership of content you upload. You grant ISCE a
					limited licence to host and display it to operate the
					platform.
				</p>

				<h2>5. Termination</h2>
				<p>
					We may suspend or terminate access for violations, legal
					requirements, or security reasons.
				</p>

				<h2>6. Governing Law</h2>
				<p>
					These Terms are governed by the laws of the Federal Republic
					of Nigeria.
				</p>
			</div>
		</LegalLayout>
	);
}
