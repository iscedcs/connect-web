'use client';

import { Button } from '@/components/ui/button';
import type {
  ArtisanProfile,
  Booking,
  EarningsData,
} from "@/lib/types/artisan";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Clock,
  Image as ImageIcon,
  Megaphone,
  MessageSquare,
  Settings,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react";
import Link from "next/link";

interface ArtisanDashboardClientProps {
  artisan: ArtisanProfile;
  recentBookings: {
    bookings: Booking[];
    total: number;
    page: number;
    totalPages: number;
  };
  earnings: EarningsData | null;
  accessToken: string;
  profileId: string;
}

export default function ArtisanDashboardClient({
  artisan,
  recentBookings,
  earnings,
}: ArtisanDashboardClientProps) {
  const bookings = recentBookings?.bookings ?? [];
  const isPending = artisan.status === "PENDING_REVIEW";
  const isSuspended = artisan.status === "SUSPENDED";
  const isDeactivated = artisan.status === "DEACTIVATED";
  const isActive = artisan.status === "ACTIVE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">
              {artisan.profile?.name || "Your Artisan Profile"}
            </h1>
            <StatusBadge status={artisan.status} />
          </div>
        </div>
        <Link href="/connect/artisan/settings">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Settings className="size-5" />
          </Button>
        </Link>
      </div>

      {/* Status banner */}
      {isPending && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-300">
            Your artisan profile is pending approval. You&apos;ll be notified
            once it&apos;s reviewed.
          </p>
        </div>
      )}
      {isSuspended && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm text-red-300">
            Your artisan profile is currently suspended. Contact support for
            more info.
          </p>
        </div>
      )}
      {isDeactivated && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-white/60">
            Your artisan profile is deactivated. Reactivate it from settings to
            start receiving bookings.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      {isActive && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Star className="size-4 text-amber-400 fill-amber-400" />}
            label="Rating"
            value={
              artisan.averageRating > 0
                ? Number(artisan.averageRating).toFixed(1)
                : "—"
            }
            sub={`${artisan.totalReviews} reviews`}
          />
          <StatCard
            icon={<CalendarCheck className="size-4 text-blue-400" />}
            label="Bookings"
            value={String(recentBookings?.total ?? artisan.totalBookings)}
            sub="total bookings"
          />
          <StatCard
            icon={<TrendingUp className="size-4 text-emerald-400" />}
            label="Total Earnings"
            value={
              earnings ? `₦${earnings.totalEarnings.toLocaleString()}` : "—"
            }
            sub="NGN"
          />
          <StatCard
            icon={<Clock className="size-4 text-purple-400" />}
            label="Reviews"
            value={String(artisan.totalReviews)}
            sub="total reviews"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
          Manage
        </h2>
        <div className="space-y-2">
          <QuickLink
            href="/connect/artisan/threads"
            icon={<MessageSquare className="size-5" />}
            label="Messages"
          />
          <QuickLink
            href="/connect/artisan/bookings"
            icon={<CalendarCheck className="size-5" />}
            label="Bookings"
            badge={
              bookings.filter(
                (b) => b.status === "PENDING" || b.status === "CONFIRMED",
              ).length || undefined
            }
          />
          <QuickLink
            href="/connect/artisan/services"
            icon={<Wrench className="size-5" />}
            label="Services"
            count={artisan.services?.length}
          />
          <QuickLink
            href="/connect/artisan/portfolio"
            icon={<ImageIcon className="size-5" />}
            label="Portfolio"
            count={artisan.portfolio?.length}
          />
          <QuickLink
            href="/connect/artisan/earnings"
            icon={<TrendingUp className="size-5" />}
            label="Earnings"
          />
          <QuickLink
            href="/connect/artisan/reviews"
            icon={<Star className="size-5" />}
            label="Reviews"
            count={artisan.totalReviews}
          />
          <QuickLink
            href="/connect/artisan/promote"
            icon={<Megaphone className="size-5" />}
            label="Promotions"
          />
        </div>
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Recent Bookings
            </h2>
            <Link
              href="/connect/artisan/bookings"
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {bookings.slice(0, 3).map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────

function StatusBadge({ status }: { status: string }) {
	const colorMap: Record<string, string> = {
		ACTIVE: 'bg-emerald-500/20 text-emerald-400',
		PENDING_REVIEW: 'bg-amber-500/20 text-amber-400',
		SUSPENDED: 'bg-red-500/20 text-red-400',
		DEACTIVATED: 'bg-white/10 text-white/50',
	};

	return (
		<span
			className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
				colorMap[status] || 'bg-white/10 text-white/50'
			}`}
		>
			{status}
		</span>
	);
}

function StatCard({
	icon,
	label,
	value,
	sub,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	sub: string;
}) {
	return (
		<div className='bg-white/5 rounded-xl p-4 border border-white/5'>
			<div className='flex items-center gap-2 mb-2'>
				{icon}
				<span className='text-[10px] text-white/40 uppercase tracking-wider'>
					{label}
				</span>
			</div>
			<p className='text-lg font-semibold text-white'>{value}</p>
			<p className='text-[10px] text-white/40 mt-0.5'>{sub}</p>
		</div>
	);
}

function QuickLink({
	href,
	icon,
	label,
	badge,
	count,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
	badge?: number;
	count?: number;
}) {
	return (
		<Link
			href={href}
			className='flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
		>
			<div className='text-white/60'>{icon}</div>
			<span className='flex-1 text-sm font-medium'>{label}</span>
			{badge != null && badge > 0 && (
				<span className='bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full'>
					{badge}
				</span>
			)}
			{count != null && !badge && (
				<span className='text-xs text-white/40'>{count}</span>
			)}
			<ArrowRight className='size-4 text-white/30' />
		</Link>
	);
}

function BookingRow({ booking }: { booking: Booking }) {
	const statusColors: Record<string, string> = {
		PENDING: 'text-amber-400',
		CONFIRMED: 'text-blue-400',
		IN_PROGRESS: 'text-purple-400',
		COMPLETED: 'text-emerald-400',
		CANCELLED: 'text-red-400',
		NO_SHOW: 'text-orange-400',
	};

	const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
	});

	return (
		<Link
			href={`/connect/artisan/bookings/${booking.id}`}
			className='flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors'
		>
			<div className='flex-1 min-w-0'>
				<p className='text-sm font-medium truncate'>
					{booking.service?.name ||
						booking.note?.slice(0, 40) ||
						'Booking'}
				</p>
				<p className='text-[10px] text-white/40 mt-0.5'>
					{date} ·{' '}
					<span
						className={
							statusColors[booking.status] || 'text-white/50'
						}
					>
						{booking.status.replace(/_/g, ' ')}
					</span>
				</p>
			</div>
			{booking.agreedPrice != null && (
				<span className='text-xs font-medium text-white/60'>
					₦{booking.agreedPrice.toLocaleString()}
				</span>
			)}
			<ArrowRight className='size-4 text-white/30 flex-shrink-0' />
		</Link>
	);
}
