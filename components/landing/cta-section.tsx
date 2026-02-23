'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getSignUpUrl } from '@/lib/client-auth-urls';

export function CtaSection() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	return (
		<section
			id='cta'
			ref={ref}
			className='relative py-20 md:py-32 px-5 md:px-10'
		>
			<div className='max-w-[1000px] mx-auto relative overflow-hidden'>
				{/* Glow */}
				<div className='absolute inset-0 -m-20 bg-[#7B93FF]/5 blur-[100px] rounded-full pointer-events-none' />

				<motion.div
					variants={staggerContainer}
					initial='hidden'
					animate={isInView ? 'visible' : 'hidden'}
					className='relative rounded-3xl border border-white/10 bg-zinc-900/50 p-8 md:p-16 text-center overflow-hidden'
				>
					{/* Subtle grid */}
					<div
						className='absolute inset-0 pointer-events-none opacity-[0.03]'
						aria-hidden='true'
						style={{
							backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
							backgroundSize: '40px 40px',
						}}
					/>

					{/* Corner accents */}
					<div className='absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#7B93FF]/20 rounded-tl-3xl' />
					<div className='absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#7B93FF]/20 rounded-br-3xl' />

					<motion.div
						variants={fadeInUp}
						className='relative'
					>
						<div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7B93FF]/30 bg-[#7B93FF]/5 text-xs md:text-sm text-[#7B93FF] mb-6'>
							<Sparkles size={14} />
							Join the future of networking
						</div>

						<h2 className='text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance'>
							Ready to Ditch
							<br />
							<span className='text-[#7B93FF]'>Paper Cards?</span>
						</h2>

						<p className='mt-5 md:mt-6 text-base md:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed'>
							Join thousands of professionals who have upgraded to
							Connect. Create your digital profile in minutes —
							share via QR code, NFC smart devices, or a simple
							link. Start free, no device required.
						</p>

						<div className='mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4'>
							<a
								href={getSignUpUrl()}
								className='group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#7B93FF] text-[#030014] px-8 py-4 rounded-xl text-sm md:text-base font-medium hover:bg-[#7B93FF]/90 transition-all duration-200'
							>
								Create Your Profile Free
								<ArrowRight
									size={16}
									className='group-hover:translate-x-1 transition-transform'
								/>
							</a>
							<a
								href='https://isce.tech/store'
								className='w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/10 bg-transparent text-white px-8 py-4 rounded-xl text-sm md:text-base font-medium hover:bg-white/5 transition-colors duration-200'
							>
								Explore Smart Devices
							</a>
						</div>

						<p className='mt-5 text-xs text-zinc-500'>
							No credit card required. Free plan available.
						</p>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
