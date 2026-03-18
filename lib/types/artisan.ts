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
	price: number | null;
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
		name: string;
		profilePicture?: string;
		slug?: string;
		location?: string;
		description?: string;
		position?: string;
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
	paymentMethod?: PaymentMethod;
	paymentTiming?: PaymentTiming;
	clientPaymentConfirmed?: boolean;
	clientPaymentConfirmedAt?: string;
	artisanPaymentConfirmed?: boolean;
	artisanPaymentConfirmedAt?: string;
	paymentDisputed?: boolean;
	paymentDisputedBy?: PaymentDisputedBy;
	paymentDisputeReason?: string;
	paymentDisputedAt?: string;
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
    name: string;
    profilePhoto?: string | null;
  } | null;
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
		name: string;
		profilePhoto?: string;
		slug?: string;
		location?: string;
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

// ─── Thread / Conversation Types ────────────────────────

export type ThreadStatus = 'OPEN' | 'PROPOSAL_SENT' | 'BOOKED' | 'CLOSED';
export type ThreadMessageType = 'TEXT' | 'PROPOSAL' | 'SYSTEM';
export type SenderRole = 'CLIENT' | 'ARTISAN';
export type PaymentMethod = 'WALLET' | 'OFFLINE';
export type PaymentTiming = 'UPFRONT' | 'ON_COMPLETION';
export type PaymentDisputedBy = 'CLIENT' | 'ARTISAN';

export interface ProposalData {
	serviceId?: string;
	serviceName?: string;
	price: number;
	currency: string;
	date: string;
	time?: string;
	duration?: number;
	paymentPreference?: string;
	paymentTiming?: string;
	note?: string;
}

export interface ThreadMessage {
	id: string;
	threadId: string;
	senderUserId: string;
	senderRole: SenderRole;
	type: ThreadMessageType;
	content: string;
	proposalData?: ProposalData;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface BookingThread {
	id: string;
	artisanId: string;
	serviceId?: string;
	clientUserId: string;
	clientProfileId?: string;
	clientName?: string;
	clientPhone?: string;
	status: ThreadStatus;
	lastMessageAt: string;
	closedAt?: string;
	closedBy?: string;
	createdAt: string;
	updatedAt: string;
	artisan?: ArtisanProfile;
	service?: ArtisanService;
	messages?: ThreadMessage[];
	booking?: Booking;
	// last message preview (from list queries)
	lastMessage?: ThreadMessage;
}

export interface ThreadListResponse {
	threads: BookingThread[];
	total: number;
	page: number;
	totalPages: number;
}

export interface ThreadDetailResponse extends BookingThread {
	messages: ThreadMessage[];
}

export interface UnreadCountResponse {
	count: number;
}

// ─── Thread DTOs (for forms) ────────────────────────────

export interface CreateThreadDto {
	artisanId: string;
	serviceId?: string;
	message: string;
	clientName?: string;
	clientPhone?: string;
	clientProfileId?: string;
}

export interface SendMessageDto {
	content: string;
}

export interface SendProposalDto {
	serviceId?: string;
	price: number;
	currency?: string;
	date?: string;
	time?: string;
	duration?: number;
	paymentPreference?: string;
	paymentTiming?: string;
	note?: string;
}

export interface AcceptProposalDto {
	messageId: string;
}

export interface DeclineProposalDto {
	messageId: string;
	reason?: string;
}

export interface ConfirmPaymentDto {
	reference?: string;
	note?: string;
}

export interface DisputePaymentDto {
	reason: string;
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
