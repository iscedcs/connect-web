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
			<div className='space-y-6'>
				<div>
					<h2>1. Introduction</h2>
					<p>
						These Terms of Service (&quot;Terms&quot;) govern your access to and
						use of ISCE Connect, our websites, mobile applications, NFC cards,
						and related services (collectively, the &quot;Service&quot;) provided
						by ISCE Digital Concept (&quot;ISCE&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
					</p>
				</div>

				<div>
					<h2>2. The Connect Service</h2>
					<p>
						ISCE Connect allows individuals and businesses to create dynamic
						digital profiles, share contact details, links, files, and media,
						process digital interactions, and integrate with compatible smart devices
						and wearables.
					</p>
				</div>

				<div>
					<h2>3. User Responsibilities</h2>
					<ul className='list-disc pl-5 space-y-1.5'>
						<li>Provide accurate, current, and lawful account information.</li>
						<li>Maintain the security and confidentiality of your credentials.</li>
						<li>
							Do not misuse profiles, upload malicious content, or impersonate
							any individual or organization.
						</li>
						<li>
							Comply with all applicable local, national, and international laws
							and regulations.
						</li>
					</ul>
				</div>

				<div>
					<h2>4. Content Ownership and Licensing</h2>
					<p>
						You retain all intellectual property rights and ownership of any
						content you submit or display on your profile. By uploading content,
						you grant ISCE a non-exclusive, worldwide, royalty-free license to
						host, display, and distribute your content solely for operating,
						maintaining, and improving the Service.
					</p>
				</div>

				<div>
					<h2>5. Suspension and Termination</h2>
					<p>
						We may suspend or terminate your account or access to the Service at
						any time if you breach these Terms, violate applicable law, or engage
						in fraudulent or abusive activities. You may terminate your account
						at any time via your account settings.
					</p>
				</div>

				<div>
					<h2>6. Governing Law</h2>
					<p>
						These Terms and any dispute arising out of or related to them shall
						be governed by and construed in accordance with the laws of the
						Federal Republic of Nigeria.
					</p>
				</div>
			</div>
		</LegalLayout>
	);
}
