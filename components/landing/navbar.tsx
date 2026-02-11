'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
	{ label: 'Features', href: '#features' },
	{ label: 'How it Works', href: '#how-it-works' },
	{ label: 'Modules', href: '#modules' },
	{ label: 'Use Cases', href: '#use-cases' },
];

export function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<>
			<motion.header
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
					scrolled ?
						'bg-black/80 backdrop-blur-xl border-b border-white/10'
					:	'bg-transparent'
				}`}
			>
				<nav className='flex items-center justify-between px-5 md:px-10 lg:px-16 py-4 max-w-[1400px] mx-auto'>
					<a
						href='#'
						className='flex items-center gap-2 group'
					>
						<div className='relative w-8 h-8 rounded-lg bg-[#7B93FF]/20 flex items-center justify-center'>
							<div className='w-3 h-3 rounded-full bg-[#7B93FF]' />
							<div className='absolute inset-0 rounded-lg bg-[#7B93FF]/10 group-hover:bg-[#7B93FF]/20 transition-colors' />
						</div>
						<span className='text-white font-semibold text-lg tracking-tight'>
							Connect
						</span>
					</a>

					{/* Desktop Nav */}
					<div className='hidden md:flex items-center gap-8'>
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className='text-sm text-zinc-400 hover:text-white transition-colors duration-200'
							>
								{link.label}
							</a>
						))}
					</div>

					<div className='hidden md:flex items-center gap-3'>
						<a
							href='/dashboard'
							className='text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2'
						>
							Log in
						</a>
						<a
							href='/dashboard'
							className='text-sm bg-[#7B93FF] text-[#030014] px-5 py-2.5 rounded-lg hover:bg-[#7B93FF]/90 transition-colors font-medium'
						>
							Get Started
						</a>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setMobileOpen(!mobileOpen)}
						className='md:hidden text-white p-2'
						aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
					>
						{mobileOpen ?
							<X size={20} />
						:	<Menu size={20} />}
					</button>
				</nav>
			</motion.header>

			{/* Mobile Nav Overlay */}
			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden'
					>
						<div className='flex flex-col items-center justify-center h-full gap-8'>
							{navLinks.map((link, i) => (
								<motion.a
									key={link.href}
									href={link.href}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.1 }}
									onClick={() => setMobileOpen(false)}
									className='text-2xl text-white font-medium'
								>
									{link.label}
								</motion.a>
							))}
							<motion.a
								href='/dashboard'
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								onClick={() => setMobileOpen(false)}
								className='mt-4 bg-[#7B93FF] text-[#030014] px-8 py-3 rounded-lg text-lg font-medium'
							>
								Get Started
							</motion.a>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
