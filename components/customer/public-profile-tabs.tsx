'use client';

import { useState } from 'react';
import { EventCard } from '@/components/customer/event-card';
import { RightIcon } from '@/lib/icons';
import {
	getFaviconFromUrl,
	getFileType,
} from '@/lib/connect-links/get-favicon';
import { FILE_TYPE_FILTERS } from '@/lib/connect-files/file-types';
import { SOCIAL_PLATFORMS } from '@/lib/connect-social/detect-platform';
import Link from 'next/link';
import { InlineRenderer } from './inline-renderers/inline-renderer';
import { DockIcon } from 'lucide-react';

/** ---------------------------------------
 * FETCH A DEVICE HOLDER PUBLIC CONNECT AND EVENT TABS
 -----------------------------------------*/
export default function PublicProfileTabs({
	connectItems,
	events,
	id,
	canShowEventsTab = false,
	basePath = '/customer',
}: {
	connectItems: any[];
	events: any[];
	id?: any;
	canShowEventsTab?: boolean;
	/** Route prefix — '/customer' for device-based, '/p' for slug-based */
	basePath?: '/customer' | '/p';
}) {
	const [activeTab, setActiveTab] = useState<'connect' | 'events'>('connect');
	const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

	const isYouTubeUrl = (url?: string) =>
		Boolean(url && /youtube\.com|youtu\.be/i.test(url));

	const isYouTubeVideoUrl = (url?: string) => {
		if (!url) return false;
		try {
			const parsed = new URL(url);
			const host = parsed.hostname.toLowerCase();
			const path = parsed.pathname.toLowerCase();
			return (
				(host.includes('youtube.com') &&
					(parsed.searchParams.has('v') ||
						path.startsWith('/shorts/') ||
						path.startsWith('/embed/'))) ||
				host.includes('youtu.be')
			);
		} catch {
			return false;
		}
	};

	// Filter social items using the detected platform property
	const socialItems = connectItems.filter((item) => {
		const platform = item.platform?.toLowerCase();
		return (
			platform &&
			platform !== 'youtube' &&
			SOCIAL_PLATFORMS.includes(platform)
		);
	});

	const youtubeItems = connectItems.filter((item) => {
		const platform = item.platform?.toLowerCase();
		return platform === 'youtube' || isYouTubeUrl(item.url);
	});

	// Filter items that should go in "Others" section (non-social items from socials)
	const otherSocialItems = connectItems.filter((item) => {
		// Items with originalPlatform came from socials array
		if (item.originalPlatform) {
			const platform = item.platform?.toLowerCase();
			return !platform || !SOCIAL_PLATFORMS.includes(platform);
		}
		return false;
	});

	// Non-social connect items (files, forms, links, etc.)
	const nonSocialItems = connectItems.filter((item) => {
		// Exclude items that came from socials array
		return !item.originalPlatform && !isYouTubeUrl(item.url);
	});

	const fileItems = connectItems.filter(
		(item) =>
			item.url && /\.(pdf|doc|docx|png|jpg|jpeg|webp)$/i.test(item.url),
	);

	const groupedFiles = FILE_TYPE_FILTERS.map((type) => ({
		...type,
		files: fileItems.filter((f) => getFileType(f.url) === type.id),
	})).filter((group) => group.files.length > 0);

	const spotifyItems = connectItems.filter(
		(item) =>
			item.url?.includes('open.spotify.com') ||
			item.title?.toLowerCase() === 'spotify',
	);
	const fileCategoryItems = groupedFiles.flatMap((group) => group.files);

	const getItemKey = (item: any) => `${item?.id ?? ''}::${item?.url ?? ''}`;
	const categorizedItemKeys = new Set(
		[
			...socialItems,
			...spotifyItems,
			...youtubeItems,
			...fileCategoryItems,
		].map(getItemKey),
	);

	const otherItems = [...otherSocialItems, ...nonSocialItems].filter(
		(item) => !categorizedItemKeys.has(getItemKey(item)),
	);
	const hasConnectContent = connectItems.length > 0;
	function resolvePublicUrl(url: string, deviceId: string) {
		if (!url) return '#';

		// Public forms from backend: /forms/{id}
		if (url.startsWith('/forms/')) {
			return `${basePath}/${deviceId}${url}`;
		}

		return url;
	}

	return (
		<>
			<section className='mt-6 px-4 flex gap-8 text-base'>
				<button
					onClick={() => setActiveTab('connect')}
					className={`pb-2 ${
						activeTab === 'connect' ?
							'font-semibold border-b-2 border-white'
						:	'text-white/50'
					}`}
				>
					Connect
				</button>

				{canShowEventsTab && (
					<button
						onClick={() => setActiveTab('events')}
						className={`pb-2 ${
							activeTab === 'events' ?
								'font-semibold border-b-2 border-white'
							:	'text-white/50'
						}`}
					>
						Events
					</button>
				)}
			</section>

			{activeTab === 'connect' && (
				<section className='mt-6 px-4'>
					{!hasConnectContent && (
						<div className='rounded-2xl border border-white/10 bg-[#121212] p-6 text-center'>
							<div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5'>
								<DockIcon className='w-5 h-5 text-white/70' />
							</div>
							<h3 className='text-lg font-semibold text-white'>
								Nothing to showcase yet
							</h3>
							<p className='mt-2 text-sm text-white/60'>
								This profile does not have anything to showcase
								yet.
							</p>
						</div>
					)}

					{socialItems.length > 0 && (
						<section className='mb-6'>
							<div className='flex items-center justify-between'>
								<h3 className='text-2xl font-extrabold text-white mb-3'>
									Socials
								</h3>
								<Link
									href={`${basePath}/${id}/socials`}
									className='text-sm text-white/60'
								>
									View all
								</Link>
							</div>

							<div className='grid grid-cols-4 gap-4'>
								{socialItems.map((item) => (
									<a
										key={item.id}
										href={item.url}
										target='_blank'
										rel='noopener noreferrer'
										className='flex flex-col items-center justify-center gap-1'
									>
										<div className='w-14 h-14 rounded-full bg-black/60 flex items-center justify-center'>
											<img
												src={
													item.icon ||
													getFaviconFromUrl(
														item.url,
														64,
													)
												}
												alt={item.title}
												className='w-7 h-7 object-contain'
											/>
										</div>	
										<span className='text-[10px] text-white/60 truncate max-w-[60px]'>
											{item.title}
										</span>
									</a>
								))}
							</div>
						</section>
					)}

					{spotifyItems.length > 0 && (
						<section className='mb-8'>
							<div className='flex items-center justify-between'>
								<h3 className='text-2xl font-extrabold text-white mb-3'>
									Spotify
								</h3>

								<Link
									href={`${basePath}/${id}/spotify`}
									className='text-sm text-white/60 hover:text-white transition'
								>
									View all
								</Link>
							</div>

							<div className='space-y-3'>
								{spotifyItems.slice(0, 3).map((item) => (
									<div
										key={item.id}
										className='flex flex-col'
									>
										<button
											onClick={() =>
												setExpandedItemId(
													expandedItemId === item.id ?
														null
													:	item.id,
												)
											}
											className='flex items-center gap-4 bg-[#0f0f0f] rounded-xl p-4 hover:bg-[#1a1a1a] transition text-left'
										>
											<span className='w-12 h-12 rounded-full bg-black flex items-center justify-center'>
												<img
													src={getFaviconFromUrl(
														item.url,
														64,
													)}
													alt='Spotify'
													className='w-6 h-6'
												/>
											</span>

											<div className='flex-1 truncate'>
												<p className='text-sm font-medium truncate'>
													{item.title || 'Spotify'}
												</p>
											</div>

											<span
												className={`text-white/60 transition-transform ${
													expandedItemId === item.id ?
														'rotate-90'
													:	''
												}`}
											>
												<RightIcon />
											</span>
										</button>

										{expandedItemId === item.id && (
											<InlineRenderer item={item} />
										)}
									</div>
								))}
							</div>
						</section>
					)}

					{youtubeItems.length > 0 && (
						<section className='mb-8'>
							<div className='flex items-center justify-between'>
								<h3 className='text-2xl font-extrabold text-white mb-3'>
									YouTube
								</h3>

								<Link
									href={`${basePath}/${id}/youtube`}
									className='text-sm text-white/60 hover:text-white transition'
								>
									View all
								</Link>
							</div>

							<div className='space-y-3'>
								{youtubeItems.slice(0, 3).map((item) => {
									const isVideo = isYouTubeVideoUrl(item.url);
									if (!isVideo) {
										return (
											<a
												key={item.id}
												href={item.url}
												target='_blank'
												rel='noopener noreferrer'
												aria-label={
													item.title ||
													'Open YouTube channel'
												}
												className='flex w-fit flex-col items-center justify-center gap-1'
											>
												<span className='w-14 h-14 rounded-full bg-black/60 flex items-center justify-center hover:bg-[#1a1a1a] transition'>
													<img
														src={getFaviconFromUrl(
															item.url,
															64,
														)}
														alt='YouTube'
														className='w-7 h-7 object-contain'
													/>
												</span>
											</a>
										);
									}

									return (
										<div
											key={item.id}
											className='flex flex-col'
										>
											<button
												onClick={() =>
													setExpandedItemId(
														(
															expandedItemId ===
																item.id
														) ?
															null
														:	item.id,
													)
												}
												className='flex items-center gap-4 bg-[#0f0f0f] rounded-xl p-4 hover:bg-[#1a1a1a] transition text-left'
											>
												<span className='w-12 h-12 rounded-full bg-black flex items-center justify-center'>
													<img
														src={getFaviconFromUrl(
															item.url,
															64,
														)}
														alt='YouTube'
														className='w-6 h-6'
													/>
												</span>
												<div className='flex-1 truncate'>
													<p className='text-sm font-medium truncate'>
														{item.title ||
															'YouTube'}
													</p>
												</div>
												<span
													className={`text-white/60 transition-transform ${
														(
															expandedItemId ===
															item.id
														) ?
															'rotate-90'
														:	''
													}`}
												>
													<RightIcon />
												</span>
											</button>

											{expandedItemId === item.id && (
												<InlineRenderer item={item} />
											)}
										</div>
									);
								})}
							</div>
						</section>
					)}

					{groupedFiles.length > 0 && (
						<section className='mb-8'>
							<div className='flex items-center justify-between'>
								<h3 className='text-2xl font-extrabold text-white mb-3'>
									Files
								</h3>
								<Link
									href={`${basePath}/${id}/files`}
									className='text-sm text-white/60'
								>
									View all
								</Link>
							</div>

							<div className='space-y-4'>
								{groupedFiles.map((group) => (
									<div key={group.id}>
										<p className='text-sm text-white/60 mb-2'>
											{group.label}
										</p>

										<div className='space-y-2'>
											{group.files
												.slice(0, 3)
												.map((file) => (
													<div
														key={file.id}
														className='flex flex-col'
													>
														<button
															onClick={() =>
																setExpandedItemId(
																	(
																		expandedItemId ===
																			file.id
																	) ?
																		null
																	:	file.id,
																)
															}
															className='flex items-center gap-3 bg-[#0f0f0f] rounded-xl p-3 hover:bg-[#1a1a1a] transition text-left'
														>
															<span className='w-10 h-10 rounded-full bg-black flex items-center justify-center'>
																<DockIcon />
															</span>
															<div className='flex-1 truncate'>
																<p className='text-sm truncate'>
																	{file.title}
																</p>
															</div>
															<span
																className={`text-white/60 transition-transform ${
																	(
																		expandedItemId ===
																		file.id
																	) ?
																		'rotate-90'
																	:	''
																}`}
															>
																<RightIcon />
															</span>{' '}
														</button>

														{expandedItemId ===
															file.id && (
															<InlineRenderer
																item={file}
															/>
														)}
													</div>
												))}
										</div>
									</div>
								))}
							</div>
						</section>
					)}

					{/* Others section - includes non-social items and email/text/website links */}
					{otherItems.length > 0 && (
						<div className='bg-[#151515] rounded-[22px]  p-4 pt-1'>
							<h3 className='text-2xl font-extrabold text-white mb-3'>
								Others
							</h3>
							{otherItems.map((item) => (
								<div
									key={item.id}
									className='flex flex-col'
								>
									<button
										onClick={() => {
											setExpandedItemId(
												expandedItemId === item.id ?
													null
												:	item.id,
											);
										}}
										className='flex items-center justify-between py-4 group text-left'
									>
										<div className='flex items-start gap-4 flex-1'>
											<span className='w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0'>
												<img
													src={item.icon}
													alt=''
													className='w-6 h-6 object-contain'
												/>
											</span>

											<div className='flex-1'>
												<p className='text-sm text-white'>
													{item.title || item.label}
												</p>
												<p className='text-2.5 text-white/50 truncate max-w-[180px]'>
													{item.username ||
														resolvePublicUrl(
															item.url,
															id,
														)}
												</p>
											</div>
										</div>

										<span
											className={`text-white/60 transition-transform ${
												expandedItemId === item.id ?
													'rotate-90'
												:	''
											}`}
										>
											<RightIcon />
										</span>
									</button>

									{expandedItemId === item.id && (
										<InlineRenderer
											item={item}
											id={id}
										/>
									)}
								</div>
							))}
						</div>
					)}
				</section>
			)}

			{activeTab === 'events' && (
				<section className='px-4 mt-6 space-y-2'>
					{events.length === 0 && (
						<p className='text-white/40 text-sm'>No events found</p>
					)}

					{events.map((event: any) => (
						<EventCard
							key={event.id}
							event={event}
						/>
					))}
				</section>
			)}
		</>
	);
}
