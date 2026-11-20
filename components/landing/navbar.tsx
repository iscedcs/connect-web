'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getSignInUrl, getSignUpUrl } from '@/lib/client-auth-urls';

const navLinks = [
	{ label: 'Features', href: '/#features' },
	{ label: 'How it Works', href: '/#how-it-works' },
	{ label: 'Modules', href: '/#modules' },
	{ label: 'Use Cases', href: '/#use-cases' },
];

export function Navbar({
	isLoggedIn = false,
	alwaysSolid = false,
}: {
	isLoggedIn?: boolean;
	alwaysSolid?: boolean;
}) {
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
          scrolled || alwaysSolid
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <nav className="flex items-center justify-between px-5 md:px-10 lg:px-16 py-4 max-w-[1400px] mx-auto">
          <Link
            href="/"
            className="flex items-center group"
            aria-label="LYNCON home"
          >
            {/* Wordmark asset is 2068x488; height is fixed and width follows
                so the ratio holds at every breakpoint. White variant because
                the nav sits on black or a dark blur. */}
            <Image
              src="/assets/logo/white-transparent.png"
              alt="LYNCON"
              width={136}
              height={32}
              priority
              className="h-7 w-auto md:h-8 transition-opacity group-hover:opacity-80"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="text-sm bg-[#7B93FF] text-[#030014] px-5 py-2.5 rounded-lg hover:bg-[#7B93FF]/90 transition-colors font-medium"
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href={getSignInUrl()}
                  className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
                >
                  Log in
                </a>
                <a
                  href={getSignUpUrl()}
                  className="text-sm bg-[#7B93FF] text-[#030014] px-5 py-2.5 rounded-lg hover:bg-[#7B93FF]/90 transition-colors font-medium"
                >
                  Get Started
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl text-white font-medium"
                >
                  {link.label}
                </motion.a>
              ))}
              {!isLoggedIn && (
                <motion.a
                  href={getSignInUrl()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-zinc-300 hover:text-white border border-white/15 px-8 py-3 rounded-lg transition-colors w-64 text-center"
                >
                  Log in
                </motion.a>
              )}
              <motion.a
                href={isLoggedIn ? "/dashboard" : getSignUpUrl()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => setMobileOpen(false)}
                className="bg-[#7B93FF] text-[#030014] px-8 py-3 rounded-lg text-lg font-medium w-64 text-center"
              >
                {isLoggedIn ? "Dashboard" : "Get Started"}
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
