"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Gift,
	Copy,
	Check,
	Sparkles,
	ArrowRight,
	ShieldCheck,
	CreditCard,
	Wallet,
	Share2,
	CheckCircle2,
	ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSignInUrl, getSignUpUrl } from "@/lib/client-auth-urls";

interface ReferralInviteClientProps {
	slug: string;
	inviterName?: string | null;
	inviterPhoto?: string | null;
	inviterBio?: string | null;
}

export default function ReferralInviteClient({
	slug,
	inviterName,
	inviterPhoto,
	inviterBio,
}: ReferralInviteClientProps) {
	const cleanUsername = slug.replace(/^@/, "");
	const displayName =
		inviterName ||
		cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
	const initial = displayName.charAt(0).toUpperCase();

	const [copied, setCopied] = useState(false);

	// Persist the referral code in localStorage so signup flows can read it
	useEffect(() => {
		try {
			localStorage.setItem("isce_referral_code", cleanUsername);
		} catch {
			// localStorage might be unavailable in private browsing / iframe
		}
	}, [cleanUsername]);

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(cleanUsername);
			setCopied(true);
			toast.success("Referral code copied!");
			setTimeout(() => setCopied(false), 2500);
		} catch {
			toast.error("Failed to copy referral code");
		}
	};

	return (
		<div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
			{/* Ambient Glowing Backdrops */}
			<div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
			<div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

			{/* Top Navbar */}
			<header className="relative z-20 border-b border-white/10 bg-black/50 backdrop-blur-md">
				<div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
							<ExternalLink className="w-4 h-4 text-primary-foreground" />
						</div>
						<span className="font-bold text-base tracking-tight text-white">
							ISCE Connect
						</span>
					</Link>

					<a href={getSignInUrl('/dashboard', cleanUsername)}>
						<Button
							size="sm"
							variant="secondary"
							className="rounded-full px-4 text-xs font-semibold"
						>
							Sign In
						</Button>
					</a>
				</div>
			</header>

			{/* Hero / Invite Card */}
			<main className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-20 space-y-12">
				<div className="text-center space-y-6">
					{/* Inviter Profile Preview Card */}
					<div className="max-w-md mx-auto rounded-3xl border border-white/15 bg-neutral-900 p-6  shadow-2xl relative overflow-hidden">
						<div className="absolute inset-0  pointer-events-none" />

						<div className="relative z-10 flex flex-col items-center text-center space-y-4">
							{/* Avatar */}
							<div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white/20 bg-neutral-800 flex items-center justify-center shadow-xl">
								{inviterPhoto ?
									<Image
										src={inviterPhoto}
										alt={displayName}
										width={80}
										height={80}
										className="h-full w-full object-cover"
									/>
								:	<span className="text-2xl font-bold text-white">
										{initial}
									</span>
								}
							</div>

							<div>
								<h1 className="text-xl font-bold text-white">
									{displayName}
								</h1>
								<p className="text-xs font-mono text-primary mt-0.5">
									@{cleanUsername}
								</p>
							</div>

							<p className="text-sm text-neutral-300 leading-relaxed max-w-sm">
								{inviterBio ||
									`"Join me on ISCE Connect to manage your digital cards, contacts, and smart wallet effortlessly."`}
							</p>

							{/* Applied Referral Code Banner */}
							<div className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-center justify-between gap-3">
								<div className="flex items-center gap-2.5 text-left">
									<CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
									<div>
										<p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">
											Referral Applied
										</p>
										<p className="font-mono text-sm font-bold text-white">
											{cleanUsername}
										</p>
									</div>
								</div>

								<Button
									size="sm"
									variant="ghost"
									onClick={handleCopyCode}
									className="h-8 px-2.5 text-xs text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg"
								>
									{copied ?
										<Check className="size-3.5 text-emerald-400" />
									:	<>
											<Copy className="size-3.5 mr-1" />
											<span>Copy</span>
										</>
									}
								</Button>
							</div>
						</div>
					</div>

					{/* Main CTAs */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
						<a
							href={getSignUpUrl('/dashboard', cleanUsername)}
							className="w-full sm:w-auto"
						>
							<Button className="w-full sm:w-auto h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-xl shadow-primary/25 gap-2">
								<span>Accept Invite & Sign Up</span>
								<ArrowRight className="size-4" />
							</Button>
						</a>
						<Link href="/" className="w-full sm:w-auto">
							<Button
								variant="outline"
								className="w-full sm:w-auto h-12 px-6 rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-medium"
							>
								Explore ISCE Connect
							</Button>
						</Link>
					</div>
				</div>

				{/* Feature Highlights Grid */}
				<div className="space-y-6 pt-6">
					<div className="text-center space-y-1">
						<h2 className="text-xl font-semibold text-white">
							What you get with ISCE Connect
						</h2>
						<p className="text-xs text-neutral-400">
							Everything you need to network and transact in one
							app
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
								<CreditCard className="size-5" />
							</div>
							<h3 className="font-semibold text-white text-base">
								Smart NFC Cards
							</h3>
							<p className="text-xs text-neutral-400 leading-relaxed">
								Share your profile, social links, portfolio, and
								documents instantly with a single tap or QR
								scan.
							</p>
						</div>

						<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-3">
							<div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
								<Wallet className="size-5" />
							</div>
							<h3 className="font-semibold text-white text-base">
								Integrated Wallet
							</h3>
							<p className="text-xs text-neutral-400 leading-relaxed">
								Receive payments, transfer funds, and manage
								your digital Naira wallet with dedicated virtual
								accounts.
							</p>
						</div>

						<div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-3">
							<div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
								<ShieldCheck className="size-5" />
							</div>
							<h3 className="font-semibold text-white text-base">
								Verified Identity
							</h3>
							<p className="text-xs text-neutral-400 leading-relaxed">
								Showcase verified skills, customer reviews, and
								multi-profile identities across personal and
								business roles.
							</p>
						</div>
					</div>
				</div>

				{/* 3-Step Walkthrough */}
				<div className="rounded-3xl border border-white/10 bg-neutral-900/40 p-8 space-y-6">
					<h3 className="text-center text-base font-semibold text-white">
						How to get started
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
						<div className="space-y-2">
							<div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs">
								1
							</div>
							<h4 className="text-sm font-semibold text-white">
								Create your account
							</h4>
							<p className="text-xs text-neutral-400">
								Sign up using @{cleanUsername}’s referral code
								in under 60 seconds.
							</p>
						</div>
						<div className="space-y-2">
							<div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs">
								2
							</div>
							<h4 className="text-sm font-semibold text-white">
								Customize profile
							</h4>
							<p className="text-xs text-neutral-400">
								Add your contact details, social handles, and
								payment links.
							</p>
						</div>
						<div className="space-y-2">
							<div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs">
								3
							</div>
							<h4 className="text-sm font-semibold text-white">
								Connect & transact
							</h4>
							<p className="text-xs text-neutral-400">
								Share your smart identity with anyone and earn
								referral rewards.
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
