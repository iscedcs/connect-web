import LegalLayout from '@/components/legal/legal-layout';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Privacy Policy',
	description:
		'Read how ISCE Connect collects, uses, and protects your personal data.',
	keywords: ['privacy', 'policy', 'data protection'],
});

export default function PrivacyPage() {
	return (
		<LegalLayout
			title='Privacy Policy'
			lastUpdated='January 2025'
		>
			<div className='space-y-3'>
				<h2>1. Overview</h2>
				<p>
					This Privacy Policy explains how ISCE collects, uses, and
					protects personal data across Authentication, Connect, and
					Events services.
				</p>

				<h2>2. Data We Collect</h2>
				<ul>
					<li>
						Account and identity information{' '}
						<span className='font-bold'>(email, phone)</span>
					</li>
					<li>Profile information you choose to share</li>
					<li>Device and usage data for security and analytics</li>
				</ul>

				<h2>3. How We Use Your Data</h2>
				<ul>
					<li>To provide authentication and access to services</li>
					<li>To secure accounts and prevent fraud</li>
					<li>To improve platform reliability</li>
				</ul>

				<h2>4. Your Rights</h2>
				<p>
					Under Nigerian data protection laws, you may request access,
					correction, or deletion of your personal data.
				</p>

				<h2>5. Contact</h2>
				<p>
					Privacy-related enquiries can be sent to:
					<br />
					<strong>privacy@isce.tech</strong>
				</p>
			</div>
		</LegalLayout>
	);
}
