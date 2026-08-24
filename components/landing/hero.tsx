"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, fadeIn } from "@/lib/animations";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { getSignUpUrl } from "@/lib/client-auth-urls";

export function Hero() {
	return (
		<section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 md:px-10">
			{/* Multi-layer aurora background */}
			<div
				className="absolute inset-0 pointer-events-none"
				aria-hidden="true"
			>
				{/* Primary blue aurora — center */}
				<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] md:w-[1100px] md:h-[1100px] rounded-full bg-[#7B93FF]/[0.07] blur-[140px]" />
				{/* Purple aurora — top-left */}
				<div className="absolute -top-20 -left-20 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-[#C77DFF]/[0.05] blur-[120px]" />
				{/* Faint blue bottom */}
				<div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#7B93FF]/[0.04] blur-[100px]" />
			</div>

			{/* Grid pattern — fades to edges */}
			<div
				className="absolute inset-0 pointer-events-none"
				aria-hidden="true"
				style={{
					backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
					backgroundSize: "64px 64px",
					maskImage:
						"radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
					WebkitMaskImage:
						"radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
				}}
			/>

			<motion.div
				variants={staggerContainer}
				initial="hidden"
				animate="visible"
				className="relative z-10 text-center max-w-5xl mx-auto"
			>
				{/* Main headline */}
				<motion.h1
					variants={fadeInUp}
					className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-balance"
					style={{ fontFamily: "var(--font-syne), sans-serif" }}
				>
					<span className="text-white">Your Identity.</span>
					<br />
					<span
						style={{
							background:
								"linear-gradient(135deg, #7B93FF 0%, #A5B8FF 50%, #C77DFF 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
						}}
					>
						One Tap. One Scan.
					</span>
				</motion.h1>

				{/* Subheadline */}
				<motion.p
					variants={fadeInUp}
					className="mt-5 md:mt-8 text-base md:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-pretty"
				>
					Connect replaces paper business cards with a powerful
					digital profile. Share via NFC smart devices, QR codes, or a
					simple link — no app needed on their end.
				</motion.p>

				{/* CTA Buttons */}
				<motion.div
					variants={fadeInUp}
					className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
				>
					<a
						href={getSignUpUrl()}
						className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 text-[#030014] px-7 py-3.5 rounded-xl text-sm md:text-base font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(123,147,255,0.4)]"
						style={{
							background:
								"linear-gradient(135deg, #7B93FF 0%, #A5B8FF 100%)",
						}}
					>
						<span className="relative z-10 flex items-center gap-2">
							Create Your Profile Free
							<ArrowRight
								size={16}
								className="group-hover:translate-x-1 transition-transform"
							/>
						</span>
					</a>
					<a
						href="#features"
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/10 bg-white/[0.03] text-white px-7 py-3.5 rounded-xl text-sm md:text-base font-medium hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200"
					>
						See How It Works
					</a>
				</motion.div>

				{/* Stats row */}
				<motion.div
					variants={fadeIn}
					className="mt-16 md:mt-20 flex items-center justify-center gap-0 max-w-xs sm:max-w-lg mx-auto"
				>
					{[
						{ value: "10K+", label: "Active Users" },
						{ value: "50K+", label: "Connections Made" },
						{ value: "99.9%", label: "Uptime" },
					].map((stat, i) => (
						<div key={stat.label} className="flex items-stretch">
							<div className="text-center px-4 sm:px-8 md:px-10">
								<div
									className="text-2xl md:text-3xl lg:text-4xl font-black text-white"
									style={{
										fontFamily:
											"var(--font-syne), sans-serif",
									}}
								>
									{stat.value}
								</div>
								<div className="text-xs md:text-sm text-zinc-500 mt-1">
									{stat.label}
								</div>
							</div>
							{i < 2 && (
								<div className="w-px bg-white/10 self-stretch" />
							)}
						</div>
					))}
				</motion.div>
			</motion.div>

			{/* Scroll indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.5, duration: 0.8 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2"
			>
				<motion.div
					animate={{ y: [0, 8, 0] }}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					<ChevronDown size={20} className="text-zinc-500" />
				</motion.div>
			</motion.div>
		</section>
	);
}
