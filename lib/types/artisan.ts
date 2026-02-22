// ─── Enums ──────────────────────────────────────────────

export type ArtisanStatus =
	| 'PENDING_REVIEW'
	| 'ACTIVE'
	| 'SUSPENDED'
	| 'DEACTIVATED';

export type BookingStatus =
	| 'PENDING'
	| 'CONFIRMED'
	| 'IN_PROGRESS'
	| 'COMPLETED'
	| 'CANCELLED'
	| 'NO_SHOW';

export type PromotionType = 'SPONSORED' | 'BOOST';

export type PromotionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

// ─── Core Models ────────────────────────────────────────

export interface ArtisanCategory {
	id: string;
	name: string;
	slug: string;
	description?: string;
	icon?: string;
	artisanCount?: number;
}

export interface ArtisanService {
	id: string;
	artisanId: string;
	name: string;
	description?: string;
	price: number;
	currency: string;
	duration?: number;
	isActive: boolean;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface PortfolioItem {
	id: string;
	artisanId: string;
	type: string;
	url: string;
	thumbnail?: string;
	caption?: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface ArtisanProfile {
	id: string;
	profileId: string;
	userId: string;
	bio?: string;
	status: ArtisanStatus;
	customCategory?: string;
	termsAcceptedAt?: string;
	activatedAt?: string;
	suspendedReason?: string;
	averageRating: number;
	totalReviews: number;
	totalBookings: number;
	totalEarnings: number;
	workingHours?: WorkingHoursEntry[];
	createdAt: string;
	updatedAt: string;
	categories?: ArtisanCategoryMap[];
	services?: ArtisanService[];
	portfolio?: PortfolioItem[];
	profile?: {
		id: string;
		firstName: string;
		lastName: string;
		displayPicture?: string;
		slug?: string;
		city?: string;
		state?: string;
		location?: string;
		bio?: string;
	};
}

export interface ArtisanCategoryMap {
	id: string;
	artisanId: string;
	categoryId: string;
	isPrimary: boolean;
	category: ArtisanCategory;
}

export interface WorkingHoursEntry {
	day: number;
	open: string;
	close: string;
	isOpen: boolean;
}

export interface Booking {
	id: string;
	artisanId: string;
	customerUserId: string;
	customerProfileId?: string;
	serviceId?: string;
	customerName?: string;
	customerPhone?: string;
	status: BookingStatus;
	note?: string;
	scheduledDate: string;
	scheduledTime?: string;
	duration?: number;
	agreedPrice?: number;
	currency: string;
	commissionAmount?: number;
	paymentReference?: string;
	isPaid: boolean;
	paidAt?: string;
	cancelledBy?: string;
	cancellationReason?: string;
	cancelledAt?: string;
	startedAt?: string;
	completedAt?: string;
	createdAt: string;
	updatedAt: string;
	artisan?: ArtisanProfile;
	service?: ArtisanService;
}

export interface Review {
	id: string;
	artisanId: string;
	reviewerUserId: string;
	bookingId?: string;
	reviewerName?: string;
	rating: number;
	comment?: string;
	isVisible: boolean;
	createdAt: string;
	reviewer?: {
		firstName: string;
		lastName: string;
		displayPicture?: string;
	};
}

export interface Promotion {
	id: string;
	artisanId: string;
	type: PromotionType;
	status: PromotionStatus;
	amount: number;
	currency: string;
	paymentReference?: string;
	startsAt: string;
	endsAt: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
}

// ─── API Response Types ─────────────────────────────────

export interface ArtisanRequirements {
	hasProfile: boolean;
	hasWallet: boolean;
	categories: ArtisanCategory[];
	minimumFields: string[];
}

export interface EarningsData {
	totalEarnings: number;
	totalBookings: number;
	averageRating: number;
	totalReviews: number;
	recentTransactions: {
		id: string;
		amount: number;
		type: string;
		agreedPrice: number;
		commissionAmount: number;
		completedAt: string;
		createdAt: string;
	}[];
}

export interface DirectoryFilters {
	category?: string;
	search?: string;
	location?: string;
	minRating?: number;
	page?: number;
	limit?: number;
	sortBy?: string;
}

export interface DirectoryResponse {
	artisans: ArtisanDirectoryCard[];
	total: number;
	page: number;
	totalPages: number;
}

export interface ArtisanDirectoryCard {
	id: string;
	bio?: string;
	averageRating: number;
	totalReviews: number;
	totalBookings: number;
	categories: ArtisanCategoryMap[];
	profile?: {
		id: string;
		firstName: string;
		lastName: string;
		displayPicture?: string;
		slug?: string;
		city?: string;
		state?: string;
		location?: string;
		bio?: string;
	};
	services: {
		id: string;
		name: string;
		price?: number;
		currency: string;
	}[];
	portfolio: {
		id: string;
		url: string;
		type: string;
		thumbnail?: string;
		caption?: string;
	}[];
}

// ─── DTO Types (for forms) ──────────────────────────────

export interface RegisterArtisanDto {
	profileId: string;
	categoryIds: string[];
	customCategory?: string;
	bio?: string;
	services: CreateServiceDto[];
	workingHours?: WorkingHoursEntry[];
	termsAccepted: boolean;
}

export interface UpdateArtisanDto {
	profileId: string;
	bio?: string;
	workingHours?: WorkingHoursEntry[];
}

export interface CreateServiceDto {
	name: string;
	description?: string;
	price: number;
	currency?: string;
	duration?: number;
}

export interface CreateBookingDto {
	serviceId?: string;
	scheduledDate: string;
	scheduledTime?: string;
	duration?: number;
	agreedPrice?: number;
	note?: string;
	customerName?: string;
	customerPhone?: string;
}

export interface CreateReviewDto {
	bookingId?: string;
	rating: number;
	comment?: string;
}

export interface CreatePromotionDto {
	profileId: string;
	type: PromotionType;
	durationDays: number;
}
