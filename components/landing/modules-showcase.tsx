'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import {
	User,
	Link2,
	Video,
	Share2,
	Calendar,
	CalendarCheck,
	Music,
	FileText,
	ClipboardList,
} from 'lucide-react';

const modules = [
	{
		icon: User,
		name: 'Contact',
		description:
			'Share phone numbers, emails, websites, and addresses. Your digital business card.',
		color: 'from-blue-500/20 to-blue-600/5',
	},
	{
		icon: Link2,
		name: 'Links',
		description:
			'Curate a list of important links - portfolios, projects, publications, and more.',
		color: 'from-cyan-500/20 to-cyan-600/5',
	},
	{
		icon: Video,
		name: 'Videos',
		description:
			'Showcase video content directly on your profile. Perfect for creators and marketers.',
		color: 'from-red-500/20 to-red-600/5',
	},
	{
		icon: Share2,
		name: 'Socials',
		description:
			'Consolidate your online presence - LinkedIn, Twitter, Instagram, TikTok, and more.',
		color: 'from-purple-500/20 to-purple-600/5',
	},
	{
		icon: Calendar,
		name: 'Meetings',
		description:
			'Link your calendar tools to let connections book time directly from your profile.',
		color: 'from-green-500/20 to-green-600/5',
	},
	{
		icon: CalendarCheck,
		name: 'Appointments',
		description:
			'Manage bookings for consultants, coaches, therapists, and service professionals.',
		color: 'from-emerald-500/20 to-emerald-600/5',
	},
	{
		icon: Music,
		name: 'Spotify',
		description:
			'Share your favorite music, playlists, and podcasts. Add personality to your profile.',
		color: 'from-green-500/20 to-green-600/5',
	},
	{
		icon: FileText,
		name: 'Files',
		description:
			'Distribute resumes, portfolios, price lists, and marketing materials with ease.',
		color: 'from-amber-500/20 to-amber-600/5',
	},
	{
		icon: ClipboardList,
		name: 'Forms',
		description:
			'Collect leads, feedback, and registrations with custom forms on your profile.',
		color: 'from-pink-500/20 to-pink-600/5',
	},
];

export function ModulesShowcase() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });
	const [activeModule, setActiveModule] = useState(0);

	return (
		<section
			id='modules'
			ref={ref}
			className='relative py-20 md:py-32 px-5 md:px-10'
		>
			{/* Background accent */}
			<div
				className='absolute inset-0 pointer-events-none overflow-hidden'
				aria-hidden='true'
			>
				<div className='absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#7B93FF]/[0.03] blur-[150px] rounded-full' />
			</div>

			<div className='max-w-[1200px] mx-auto relative'>
				<motion.div
					variants={staggerContainer}
					initial='hidden'
					animate={isInView ? 'visible' : 'hidden'}
					className='text-center mb-14 md:mb-20'
				>
					<motion.p
						variants={fadeInUp}
						className='text-[#7B93FF] text-sm font-medium tracking-widest uppercase mb-3'
					>
						Modules
					</motion.p>
					<motion.h2
						variants={fadeInUp}
						className='text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance'
					>
						Your Profile,
						<br className='hidden md:block' />
						<span className='text-zinc-400'> Your Rules.</span>
					</motion.h2>
					<motion.p
						variants={fadeInUp}
						className='mt-4 md:mt-6 text-base md:text-lg text-zinc-400 max-w-xl mx-auto'
					>
						Mix and match 9 powerful modules to build a profile that
						truly represents you.
					</motion.p>
				</motion.div>

				{/* Interactive module display */}
				<motion.div
					variants={staggerContainer}
					initial='hidden'
					animate={isInView ? 'visible' : 'hidden'}
					className='grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8'
				>
					{/* Module list */}
					<motion.div
						variants={fadeInUp}
						className='lg:col-span-2 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none'
					>
						{modules.map((mod, i) => {
							const Icon = mod.icon;
							return (
								<button
									key={mod.name}
									onClick={() => setActiveModule(i)}
									className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap lg:whitespace-normal transition-all duration-300 min-w-fit lg:min-w-0 ${
										activeModule === i ?
											'bg-[#7B93FF]/10 border border-[#7B93FF]/30 text-white'
										:	'bg-transparent border border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.03]'
									}`}
								>
									<Icon
										size={18}
										className={
											activeModule === i ?
												'text-[#7B93FF]'
											:	'text-zinc-400'
										}
									/>
									<span className='text-sm font-medium'>
										{mod.name}
									</span>
								</button>
							);
						})}
					</motion.div>

					{/* Module detail */}
					<motion.div
						variants={fadeInUp}
						className='lg:col-span-3'
					>
						<motion.div
							key={activeModule}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className='relative rounded-2xl border border-white/10 bg-zinc-900/50 p-8 md:p-10 min-h-[280px] md:min-h-[320px] flex flex-col justify-between overflow-hidden'
						>
							{/* Background gradient */}
							<div
								className={`absolute inset-0 bg-gradient-to-br ${modules[activeModule].color} opacity-50`}
							/>

							<div className='relative'>
								<div className='flex items-center gap-3 mb-6'>
									{(() => {
										const Icon = modules[activeModule].icon;
										return (
											<div className='w-12 h-12 rounded-xl bg-[#7B93FF]/10 flex items-center justify-center'>
												<Icon
													size={22}
													className='text-[#7B93FF]'
												/>
											</div>
										);
									})()}
									<h3 className='text-2xl md:text-3xl font-bold text-white'>
										{modules[activeModule].name}
									</h3>
								</div>

								<p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-lg'>
									{modules[activeModule].description}
								</p>
							</div>

							{/* Module visual indicator */}
							<div className='relative mt-8 flex items-center gap-2'>
								{modules.map((_, i) => (
									<div
										key={`indicator-${modules[i].name}`}
										className={`h-1 rounded-full transition-all duration-300 ${
											i === activeModule ?
												'w-8 bg-[#7B93FF]'
											:	'w-2 bg-white/10'
										}`}
									/>
								))}
							</div>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
