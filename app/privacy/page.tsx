import LegalLayout from '@/components/legal/legal-layout';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Privacy Policy',
	description:
		'Read how ISCE Connect collects, uses, and protects your personal data.',
	keywords: ['privacy', 'policy', 'data protection', 'security'],
});

export default function PrivacyPage() {
	return (
		<LegalLayout
			title='Privacy Policy'
			lastUpdated='January 2025'
		>
			<div className='space-y-6'>
				<div>
					<h2>1. Overview</h2>
					<p>
						This Privacy Policy describes how ISCE Digital Concept (&quot;ISCE&quot;,
						&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, stores, and
						safeguards your personal information across our Authentication, Connect,
						and ecosystem services. We are dedicated to respecting your privacy and protecting
						your personal data in compliance with the Nigeria Data Protection Act (NDPA)
						and applicable data protection laws.
					</p>
				</div>

				<div>
					<h2>2. Data We Collect</h2>
					<p className='mb-2'>We collect information that you directly provide or generate through using our platform:</p>
					<ul className='list-disc pl-5 space-y-1.5'>
						<li>
							<strong>Account and Identity Information:</strong> Full name, email address,
							phone number, username, and authentication credentials.
						</li>
						<li>
							<strong>Profile and Contact Content:</strong> Bio, occupation, profile avatars,
							links, social handles, uploaded documents, and contact details you choose to share.
						</li>
						<li>
							<strong>Device and Hardware Data:</strong> NFC card identifiers, paired wearables,
							and device hardware types.
						</li>
						<li>
							<strong>Usage and Telemetry Data:</strong> Tap and scan counts, referral interactions,
							browser type, IP address, and system diagnostic logs.
						</li>
					</ul>
				</div>

				<div>
					<h2>3. How We Use Your Data</h2>
					<ul className='list-disc pl-5 space-y-1.5'>
						<li>To operate, manage, and provide access to your digital profile and services.</li>
						<li>To verify identity, authenticate sessions, and protect against fraud or abuse.</li>
						<li>To deliver notifications, security updates, and transaction alerts.</li>
						<li>To analyze platform performance and improve our features.</li>
					</ul>
				</div>

				<div>
					<h2>4. Data Sharing and Security</h2>
					<p>
						We implement industry-standard cryptographic protocols, HTTPS encryption, and
						role-based access controls to safeguard your personal data. We do not sell your personal
						information to third parties. Data is shared only with service providers strictly necessary
						for platform functionality (e.g., authentication, push notifications, and hosting).
					</p>
				</div>

				<div>
					<h2>5. Your Rights</h2>
					<p>
						Under applicable data protection laws, including the NDPA, you have the right
						to access, rectify, or request deletion of your personal data, as well as the right
						to withdraw consent or restrict processing. You can manage most profile details
						directly from your account settings.
					</p>
				</div>

				<div>
					<h2>6. Contact Us</h2>
					<p>
						If you have any questions, concerns, or requests regarding this Privacy Policy or
						our data practices, please contact our Data Protection team at:
						<br />
						<a
							href='mailto:privacy@isce.tech'
							className='text-[#7B93FF] hover:underline font-medium'
						>
							privacy@isce.tech
						</a>
					</p>
				</div>
			</div>
		</LegalLayout>
	);
}
