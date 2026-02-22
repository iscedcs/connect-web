import { getAuthInfo } from '@/actions/auth';
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from '../const';
import type {
	ArtisanProfile,
	ArtisanRequirements,
	ArtisanService,
	Booking,
	CreateBookingDto,
	CreatePromotionDto,
	CreateReviewDto,
	CreateServiceDto,
	DirectoryFilters,
	DirectoryResponse,
	ArtisanDirectoryCard,
	ArtisanCategory,
	EarningsData,
	PortfolioItem,
	Promotion,
	RegisterArtisanDto,
	Review,
	UpdateArtisanDto,
} from '../types/artisan';

// ─── Helpers ────────────────────────────────────────────

async function safeJson(res: Response): Promise<Record<string, any> | null> {
	const contentType = res.headers.get('content-type') || '';
	if (!contentType.toLowerCase().includes('application/json')) return null;
	try {
		return await res.json();
	} catch {
		return null;
	}
}

function buildUrl(template: string, params: Record<string, string>): string {
	let url = template;
	for (const [key, value] of Object.entries(params)) {
		url = url.replace(`{${key}}`, encodeURIComponent(value));
	}
	return url;
}

async function getAuth() {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) return null;
	return auth;
}

function headers(accessToken: string, json = true): HeadersInit {
	const h: HeadersInit = { Authorization: `Bearer ${accessToken}` };
	if (json) h['Content-Type'] = 'application/json';
	return h;
}

const BASE = () => NEXT_PUBLIC_CONNECT_API_ORIGIN || '';

// ═══════════════════════════════════════════════════════════
// REGISTRATION & PROFILE
// ═══════════════════════════════════════════════════════════

export async function getArtisanRequirements(): Promise<ArtisanRequirements | null> {
	const auth = await getAuth();
	if (!auth) return null;
	try {
		const res = await fetch(`${BASE()}${URLS.artisan.requirements}`, {
			headers: headers(auth.accessToken),
			cache: 'no-store',
		});
		const json = await safeJson(res);
		return json?.data ?? null;
	} catch {
		return null;
	}
}

export async function registerArtisan(
	data: RegisterArtisanDto,
): Promise<{ success: boolean; data?: ArtisanProfile; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const res = await fetch(`${BASE()}${URLS.artisan.register}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
			body: JSON.stringify(data),
		});
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Registration failed',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function getMyArtisanProfile(
	profileId: string,
): Promise<ArtisanProfile | null> {
	const auth = await getAuth();
	if (!auth) return null;
	try {
		const url = buildUrl(URLS.artisan.me, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			headers: headers(auth.accessToken),
			cache: 'no-store',
		});
		const json = await safeJson(res);
		return json?.data ?? null;
	} catch {
		return null;
	}
}

export async function updateArtisanProfile(
	data: UpdateArtisanDto,
): Promise<{ success: boolean; data?: ArtisanProfile; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const res = await fetch(`${BASE()}${URLS.artisan.update}`, {
			method: 'PATCH',
			headers: headers(auth.accessToken),
			body: JSON.stringify(data),
		});
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Update failed',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function deactivateArtisan(
	profileId: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.deactivate, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function reactivateArtisan(
	profileId: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.reactivate, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

// ═══════════════════════════════════════════════════════════
// SERVICES CRUD
// ═══════════════════════════════════════════════════════════

export async function getArtisanServices(
	profileId: string,
): Promise<ArtisanService[]> {
	const auth = await getAuth();
	if (!auth) return [];
	try {
		const url = buildUrl(URLS.artisan.services, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			headers: headers(auth.accessToken),
			cache: 'no-store',
		});
		const json = await safeJson(res);
		return json?.data ?? [];
	} catch {
		return [];
	}
}

export async function createArtisanService(
	profileId: string,
	data: CreateServiceDto,
): Promise<{ success: boolean; data?: ArtisanService; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.create_service, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
			body: JSON.stringify(data),
		});
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Failed to create service',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function updateArtisanService(
	profileId: string,
	serviceId: string,
	data: Partial<CreateServiceDto>,
): Promise<{ success: boolean; data?: ArtisanService; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.update_service, {
			profileId,
			serviceId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'PATCH',
			headers: headers(auth.accessToken),
			body: JSON.stringify(data),
		});
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Failed to update service',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function deleteArtisanService(
	profileId: string,
	serviceId: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.delete_service, {
			profileId,
			serviceId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'DELETE',
			headers: headers(auth.accessToken),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

// ═══════════════════════════════════════════════════════════
// PORTFOLIO CRUD
// ═══════════════════════════════════════════════════════════

export async function getArtisanPortfolio(
	profileId: string,
): Promise<PortfolioItem[]> {
	const auth = await getAuth();
	if (!auth) return [];
	try {
		const url = buildUrl(URLS.artisan.portfolio, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			headers: headers(auth.accessToken),
			cache: 'no-store',
		});
		const json = await safeJson(res);
		return json?.data ?? [];
	} catch {
		return [];
	}
}

export async function addPortfolioItem(
	profileId: string,
	data: {
		url: string;
		type?: string;
		thumbnail?: string;
		caption?: string;
		order?: number;
	},
): Promise<{ success: boolean; data?: PortfolioItem; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.add_portfolio, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
			body: JSON.stringify(data),
		});
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Failed to add item',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function updatePortfolioItem(
	profileId: string,
	itemId: string,
	data: Partial<{
		url: string;
		type: string;
		thumbnail: string;
		caption: string;
		order: number;
	}>,
): Promise<{ success: boolean; data?: PortfolioItem; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.update_portfolio, {
			profileId,
			itemId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'PATCH',
			headers: headers(auth.accessToken),
			body: JSON.stringify(data),
		});
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Failed to update item',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function deletePortfolioItem(
	profileId: string,
	itemId: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.delete_portfolio, {
			profileId,
			itemId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'DELETE',
			headers: headers(auth.accessToken),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

// ═══════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════

export async function updateArtisanCategories(
	categoryIds: string[],
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const res = await fetch(`${BASE()}${URLS.artisan.update_categories}`, {
			method: 'PATCH',
			headers: headers(auth.accessToken),
			body: JSON.stringify({ categoryIds }),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

// ═══════════════════════════════════════════════════════════
// BOOKINGS — ARTISAN SIDE
// ═══════════════════════════════════════════════════════════

export async function getArtisanBookings(
	profileId: string,
	filters?: { status?: string; page?: number; limit?: number },
): Promise<{
	bookings: Booking[];
	total: number;
	page: number;
	totalPages: number;
}> {
	const auth = await getAuth();
	if (!auth) return { bookings: [], total: 0, page: 1, totalPages: 0 };
	try {
		const url = buildUrl(URLS.artisan.bookings, { profileId });
		const searchParams = new URLSearchParams();
		if (filters?.status) searchParams.set('status', filters.status);
		if (filters?.page) searchParams.set('page', String(filters.page));
		if (filters?.limit) searchParams.set('limit', String(filters.limit));
		const qs = searchParams.toString();
		const res = await fetch(`${BASE()}${url}${qs ? `?${qs}` : ''}`, {
			headers: headers(auth.accessToken),
			cache: 'no-store',
		});
		const json = await safeJson(res);
		return json?.data ?? { bookings: [], total: 0, page: 1, totalPages: 0 };
	} catch {
		return { bookings: [], total: 0, page: 1, totalPages: 0 };
	}
}

export async function confirmBooking(
	profileId: string,
	bookingId: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.confirm_booking, {
			profileId,
			bookingId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function startBooking(
	profileId: string,
	bookingId: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.start_booking, {
			profileId,
			bookingId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function completeBooking(
	profileId: string,
	bookingId: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.complete_booking, {
			profileId,
			bookingId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function cancelBookingAsArtisan(
	profileId: string,
	bookingId: string,
	reason: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.cancel_booking, {
			profileId,
			bookingId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
			body: JSON.stringify({ reason }),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

// ═══════════════════════════════════════════════════════════
// BOOKINGS — CUSTOMER SIDE
// ═══════════════════════════════════════════════════════════

export async function bookArtisan(
	artisanId: string,
	profileId: string,
	data: CreateBookingDto,
): Promise<{ success: boolean; data?: Booking; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.book_artisan, { artisanId });
		const res = await fetch(
			`${BASE()}${url}?profileId=${encodeURIComponent(profileId)}`,
			{
				method: 'POST',
				headers: headers(auth.accessToken),
				body: JSON.stringify(data),
			},
		);
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Booking failed',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function getMyBookings(filters?: {
	page?: number;
	limit?: number;
}): Promise<{
	bookings: Booking[];
	total: number;
	page: number;
	totalPages: number;
}> {
	const auth = await getAuth();
	if (!auth) return { bookings: [], total: 0, page: 1, totalPages: 0 };
	try {
		const searchParams = new URLSearchParams();
		if (filters?.page) searchParams.set('page', String(filters.page));
		if (filters?.limit) searchParams.set('limit', String(filters.limit));
		const qs = searchParams.toString();
		const res = await fetch(
			`${BASE()}${URLS.artisan.my_bookings}${qs ? `?${qs}` : ''}`,
			{
				headers: headers(auth.accessToken),
				cache: 'no-store',
			},
		);
		const json = await safeJson(res);
		return json?.data ?? { bookings: [], total: 0, page: 1, totalPages: 0 };
	} catch {
		return { bookings: [], total: 0, page: 1, totalPages: 0 };
	}
}

export async function cancelBookingAsCustomer(
	bookingId: string,
	reason: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.cancel_my_booking, { bookingId });
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
			body: JSON.stringify({ reason }),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

// ═══════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════

export async function submitReview(
	artisanId: string,
	data: CreateReviewDto,
): Promise<{ success: boolean; data?: Review; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.submit_review, { artisanId });
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
			body: JSON.stringify(data),
		});
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Review failed',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

// ═══════════════════════════════════════════════════════════
// PROMOTIONS
// ═══════════════════════════════════════════════════════════

export async function createPromotion(
	data: CreatePromotionDto,
): Promise<{ success: boolean; data?: Promotion; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const res = await fetch(`${BASE()}${URLS.artisan.create_promotion}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
			body: JSON.stringify(data),
		});
		const json = await safeJson(res);
		if (!res.ok)
			return {
				success: false,
				message: json?.message || 'Promotion failed',
			};
		return { success: true, data: json?.data };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

export async function getMyPromotions(profileId: string): Promise<Promotion[]> {
	const auth = await getAuth();
	if (!auth) return [];
	try {
		const url = buildUrl(URLS.artisan.my_promotions, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			headers: headers(auth.accessToken),
			cache: 'no-store',
		});
		const json = await safeJson(res);
		return json?.data ?? [];
	} catch {
		return [];
	}
}

export async function cancelPromotion(
	profileId: string,
	promotionId: string,
): Promise<{ success: boolean; message?: string }> {
	const auth = await getAuth();
	if (!auth) return { success: false, message: 'Not authenticated' };
	try {
		const url = buildUrl(URLS.artisan.cancel_promotion, {
			profileId,
			promotionId,
		});
		const res = await fetch(`${BASE()}${url}`, {
			method: 'POST',
			headers: headers(auth.accessToken),
		});
		const json = await safeJson(res);
		return { success: res.ok, message: json?.message };
	} catch {
		return { success: false, message: 'Network error' };
	}
}

// ═══════════════════════════════════════════════════════════
// EARNINGS
// ═══════════════════════════════════════════════════════════

export async function getArtisanEarnings(
	profileId: string,
): Promise<EarningsData | null> {
	const auth = await getAuth();
	if (!auth) return null;
	try {
		const url = buildUrl(URLS.artisan.earnings, { profileId });
		const res = await fetch(`${BASE()}${url}`, {
			headers: headers(auth.accessToken),
			cache: 'no-store',
		});
		const json = await safeJson(res);
		return json?.data ?? null;
	} catch {
		return null;
	}
}

// ═══════════════════════════════════════════════════════════
// DIRECTORY (PUBLIC)
// ═══════════════════════════════════════════════════════════

export async function getDirectoryArtisans(
	filters?: DirectoryFilters,
): Promise<DirectoryResponse> {
	try {
		const searchParams = new URLSearchParams();
		if (filters?.category) searchParams.set('category', filters.category);
		if (filters?.search) searchParams.set('search', filters.search);
		if (filters?.location) searchParams.set('location', filters.location);
		if (filters?.minRating)
			searchParams.set('minRating', String(filters.minRating));
		if (filters?.page) searchParams.set('page', String(filters.page));
		if (filters?.limit) searchParams.set('limit', String(filters.limit));
		if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
		const qs = searchParams.toString();
		const res = await fetch(
			`${BASE()}${URLS.directory.artisans}${qs ? `?${qs}` : ''}`,
			{ next: { revalidate: 60 } },
		);
		const json = await safeJson(res);
		return json?.data ?? { artisans: [], total: 0, page: 1, totalPages: 0 };
	} catch {
		return { artisans: [], total: 0, page: 1, totalPages: 0 };
	}
}

export async function getFeaturedArtisans(
	limit = 10,
): Promise<ArtisanDirectoryCard[]> {
	try {
		const res = await fetch(
			`${BASE()}${URLS.directory.featured}?limit=${limit}`,
			{ next: { revalidate: 300 } },
		);
		const json = await safeJson(res);
		return json?.data ?? [];
	} catch {
		return [];
	}
}

export async function getArtisanPublicProfile(
	artisanId: string,
): Promise<ArtisanProfile | null> {
	try {
		const url = buildUrl(URLS.directory.artisan_profile, { artisanId });
		const res = await fetch(`${BASE()}${url}`, {
			next: { revalidate: 60 },
		});
		const json = await safeJson(res);
		return json?.data ?? null;
	} catch {
		return null;
	}
}

export async function getArtisanPublicReviews(
	artisanId: string,
	page = 1,
	limit = 20,
): Promise<{
	reviews: Review[];
	total: number;
	page: number;
	totalPages: number;
}> {
	try {
		const url = buildUrl(URLS.directory.artisan_reviews, { artisanId });
		const res = await fetch(`${BASE()}${url}?page=${page}&limit=${limit}`, {
			next: { revalidate: 60 },
		});
		const json = await safeJson(res);
		return json?.data ?? { reviews: [], total: 0, page: 1, totalPages: 0 };
	} catch {
		return { reviews: [], total: 0, page: 1, totalPages: 0 };
	}
}

export async function getDirectoryCategories(): Promise<ArtisanCategory[]> {
	try {
		const res = await fetch(`${BASE()}${URLS.directory.categories}`, {
			next: { revalidate: 3600 },
		});
		const json = await safeJson(res);
		return json?.data ?? [];
	} catch {
		return [];
	}
}
