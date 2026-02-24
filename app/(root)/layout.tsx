import { NotificationsListener } from '@/components/shared/notifications-listener';

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className={`max-w-md mx-auto`}>
			<NotificationsListener />
			{children}
		</div>
	);
}
