import React from 'react';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/actions/auth';

export default async function ReferralRootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	if (await isAuthenticated()) {
		redirect('/dashboard');
	}

	return <>{children}</>;
}
