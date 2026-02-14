'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Copy, Share2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import QRCode from 'qrcode';

type ShareLink = {
	title?: string;
	platform?: string;
	url?: string;
};

type Props = {
	profileId: string;
	profile: {
		name?: string;
		profilePhoto?: string;
		position?: string;
		title?: string;
		role?: string;
		bio?: string;
		description?: string;
	};
	contact?: {
		primary?: {
			email?: string;
			phone_number?: string;
		};
	};
	links?: ShareLink[];
	socials?: ShareLink[];
};

function toSafeText(value?: string) {
	if (!value) return '';
	return value.replace(/\r?\n/g, ' ').trim();
}

function buildVCard({
	name,
	title,
	role,
	bio,
	email,
	phone,
	profileUrl,
	links,
	socials,
}: {
	name?: string;
	title?: string;
	role?: string;
	bio?: string;
	email?: string;
	phone?: string;
	profileUrl: string;
	links: { title?: string; url?: string }[];
	socials: { title?: string; url?: string; platform?: string }[];
}) {
	const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

	if (name) lines.push(`FN:${toSafeText(name)}`);
	if (title) lines.push(`TITLE:${toSafeText(title)}`);
	if (role) lines.push(`ROLE:${toSafeText(role)}`);
	if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
	if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);

	if (profileUrl) lines.push(`URL:${profileUrl}`);
	links.forEach((link) => link.url && lines.push(`URL:${link.url}`));
	socials.forEach((social) => social.url && lines.push(`URL:${social.url}`));

	lines.push('END:VCARD');
	return lines.join('\n');
}

export default function ShareQrDialog({
	profileId,
	profile,
	contact,
	links,
	socials,
}: Props) {
	const [open, setOpen] = useState(false);
	const [offlineQr, setOfflineQr] = useState<string | null>(null);
	const [onlineQr, setOnlineQr] = useState<string | null>(null);
	const [shareCopied, setShareCopied] = useState(false);
	const [shareError, setShareError] = useState('');
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: 'center',
		containScroll: 'trimSnaps',
	});
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	const baseUrl =
		process.env.NEXT_PUBLIC_URL ||
		(typeof window !== 'undefined' ? window.location.origin : '');

	const profileUrl = `${baseUrl}/customer/${profileId}`;
	const shareText =
		profile?.name ?
			`Check out ${profile.name}'s profile`
		:	'View this profile';
	const encodedUrl = encodeURIComponent(profileUrl);
	const encodedText = encodeURIComponent(shareText);
	const whatsappUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
	const xUrl = `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
	const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
	const emailUrl = `mailto:?subject=${encodeURIComponent(
		'Profile',
	)}&body=${encodedText}%20${profileUrl}`;

	const offlinePayload = useMemo(() => {
		const topLink =
			links
				?.filter((link) => link?.url)
				.map((link) => ({
					title: link.title || link.platform || 'Link',
					url: link.url,
				}))
				.slice(0, 1) ?? [];

		const topSocial =
			socials
				?.filter((social) => social?.url)
				.map((social) => ({
					title: social.title || social.platform || 'Social',
					platform: social.platform,
					url: social.url,
				}))
				.slice(0, 1) ?? [];

		return buildVCard({
			name: profile?.name,
			title: profile?.title ?? profile?.position,
			role: profile?.role,
			bio: profile?.bio ?? profile?.description,
			email: contact?.primary?.email,
			phone: contact?.primary?.phone_number,
			profileUrl,
			links: topLink,
			socials: topSocial,
		});
	}, [
		contact?.primary?.email,
		contact?.primary?.phone_number,
		links,
		profile,
		profileUrl,
		socials,
	]);

	useEffect(() => {
		if (!open) return;

		let cancelled = false;

		async function buildQrs() {
			setOfflineQr(null);
			setOnlineQr(null);

			try {
				const [offlineDataUrl, onlineDataUrl] = await Promise.all([
					QRCode.toDataURL(offlinePayload, { width: 240, margin: 1 }),
					QRCode.toDataURL(profileUrl, { width: 240, margin: 1 }),
				]);

				if (!cancelled) {
					setOfflineQr(offlineDataUrl);
					setOnlineQr(onlineDataUrl);
				}
			} catch {
				if (!cancelled) {
					setOfflineQr('');
					setOnlineQr('');
				}
			}
		}

		buildQrs();

		return () => {
			cancelled = true;
		};
	}, [offlinePayload, open, profileUrl]);

	useEffect(() => {
		if (!emblaApi) return;
		setScrollSnaps(emblaApi.scrollSnapList());
		onSelect();
		emblaApi.on('select', onSelect);
		return () => {
			emblaApi.off('select', onSelect);
		};
	}, [emblaApi, onSelect]);

	const scrollTo = useCallback(
		(index: number) => emblaApi?.scrollTo(index),
		[emblaApi],
	);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(profileUrl);
			setShareCopied(true);
			setShareError('');
			window.setTimeout(() => setShareCopied(false), 1500);
		} catch {
			setShareError('Copy failed');
			window.setTimeout(() => setShareError(''), 1500);
		}
	}, [profileUrl]);

	const handleShare = useCallback(async () => {
		try {
			if (navigator.share) {
				await navigator.share({
					title: profile?.name ?? 'Profile',
					text: 'View this profile',
					url: profileUrl,
				});
				setShareError('');
			} else {
				await handleCopy();
			}
		} catch {
			setShareError('Share failed');
			window.setTimeout(() => setShareError(''), 1500);
		}
	}, [handleCopy, profile?.name, profileUrl]);

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant='ghost'
					size='icon'
					className='h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
					aria-label='Share profile QR codes'
				>
					<Share2 className='h-4 w-4' />
				</Button>
			</DialogTrigger>
			<DialogContent className='border-white/10 bg-neutral-950/95 text-white sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>Share profile</DialogTitle>
					<DialogDescription className='text-white/60'>
						Swipe to switch between QR codes.
					</DialogDescription>
				</DialogHeader>

				<div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2'>
					<div className='h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/10'>
						{profile?.profilePhoto ?
							<img
								src={profile.profilePhoto}
								alt={profile?.name ?? 'Profile photo'}
								className='h-full w-full object-cover'
							/>
						:	null}
					</div>
					<div className='min-w-0'>
						<p className='text-sm font-semibold truncate'>
							{profile?.name}
						</p>
						<p className='text-xs text-white/60 truncate'>
							{profile?.position || 'Contact card'}
						</p>
					</div>
				</div>

				<div
					className='overflow-hidden'
					ref={emblaRef}
				>
					<div className='flex gap-4'>
						<div className='min-w-0 flex-[0_0_100%]'>
							<div className='rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 shadow-sm shadow-black/30'>
								<div className='flex items-center justify-between'>
									<p className='text-sm font-semibold'>
										Contact Card
									</p>
									<span className='text-2.5 uppercase tracking-wider text-emerald-300/90'>
										Offline
									</span>
								</div>
								<div className='mt-4 rounded-xl bg-white p-3'>
									{offlineQr ?
										<img
											src={offlineQr}
											alt='Offline QR code'
											className='w-full'
										/>
									:	<div className='h-[240px] w-full animate-pulse rounded-lg bg-neutral-200/70' />
									}
								</div>
								<p className='mt-3 text-xs text-white/60'>
									Scan to save contact info with one link and
									one social.
								</p>
							</div>
						</div>

						<div className='min-w-0 flex-[0_0_100%]'>
							<div className='rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 shadow-sm shadow-black/30'>
								<div className='flex items-center justify-between'>
									<p className='text-sm font-semibold'>
										Profile Link
									</p>
									<span className='text-2.5 uppercase tracking-wider text-sky-300/90'>
										Online
									</span>
								</div>
								<div className='mt-4 rounded-xl bg-white p-3'>
									{onlineQr ?
										<img
											src={onlineQr}
											alt='Online QR code'
											className='w-full'
										/>
									:	<div className='h-[240px] w-full animate-pulse rounded-lg bg-neutral-200/70' />
									}
								</div>
								<p className='mt-3 text-xs text-white/60'>
									Scan to open the full profile directly.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className='flex items-center justify-center gap-2'>
					{scrollSnaps.map((_, index) => (
						<button
							key={index}
							className={`h-2 w-2 rounded-full transition ${
								index === selectedIndex ? 'bg-white' : (
									'bg-white/30 hover:bg-white/50'
								)
							}`}
							onClick={() => scrollTo(index)}
							aria-label={`Go to slide ${index + 1}`}
						/>
					))}
				</div>

				<div className='flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2'>
					<div className='text-xs text-white/60'>
						{shareCopied ?
							'Link copied'
						:	shareError || 'Share profile link'}
					</div>
					<div className='flex items-center gap-2'>
						<Button
							variant='ghost'
							size='sm'
							className='h-9 rounded-full border border-white/10 bg-white/5 px-3 text-white/80 hover:bg-white/10 hover:text-white'
							onClick={handleShare}
						>
							<Share2 className='mr-2 h-4 w-4' />
							Share
						</Button>
						<Button
							variant='ghost'
							size='icon'
							className='h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
							onClick={handleCopy}
							aria-label='Copy profile link'
						>
							<Copy className='h-4 w-4' />
						</Button>
					</div>
				</div>

				<div className='flex flex-wrap items-center gap-2'>
					<Button
						asChild
						variant='ghost'
						size='sm'
						className='h-8 rounded-full border border-white/10 bg-white/5 px-3 text-white/80 hover:bg-white/10 hover:text-white'
					>
						<a
							href={whatsappUrl}
							target='_blank'
							rel='noreferrer'
						>
							WhatsApp
						</a>
					</Button>
					<Button
						asChild
						variant='ghost'
						size='sm'
						className='h-8 rounded-full border border-white/10 bg-white/5 px-3 text-white/80 hover:bg-white/10 hover:text-white'
					>
						<a
							href={xUrl}
							target='_blank'
							rel='noreferrer'
						>
							X
						</a>
					</Button>
					<Button
						asChild
						variant='ghost'
						size='sm'
						className='h-8 rounded-full border border-white/10 bg-white/5 px-3 text-white/80 hover:bg-white/10 hover:text-white'
					>
						<a
							href={linkedInUrl}
							target='_blank'
							rel='noreferrer'
						>
							LinkedIn
						</a>
					</Button>
					<Button
						asChild
						variant='ghost'
						size='sm'
						className='h-8 rounded-full border border-white/10 bg-white/5 px-3 text-white/80 hover:bg-white/10 hover:text-white'
					>
						<a href={emailUrl}>Email</a>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
