import { z } from 'zod';

export const artisanRegistrationSchema = z.object({
	bio: z
		.string()
		.max(1000, 'Bio must be under 1000 characters')
		.optional()
		.or(z.literal('')),
	categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
	customCategory: z
		.string()
		.max(100, 'Custom category must be under 100 characters')
		.optional()
		.or(z.literal('')),
	termsAccepted: z.boolean().refine((v) => v, 'You must accept the terms'),
});

export type ArtisanRegistrationInput = z.infer<
	typeof artisanRegistrationSchema
>;

export const artisanServiceSchema = z.object({
	name: z
		.string()
		.min(2, 'Service name is required')
		.max(100, 'Name must be under 100 characters'),
	description: z
		.string()
		.max(500, 'Description must be under 500 characters')
		.optional()
		.or(z.literal('')),
	price: z.coerce.number().min(0, 'Price cannot be negative'),
	currency: z.string().default('NGN'),
	duration: z.coerce
		.number()
		.min(15, 'Duration must be at least 15 minutes')
		.max(1440, 'Duration cannot exceed 24 hours')
		.optional(),
});

export type ArtisanServiceInput = z.infer<typeof artisanServiceSchema>;

export const artisanBookingSchema = z.object({
	serviceId: z.string().optional().or(z.literal('')),
	scheduledDate: z.string().min(1, 'Select a date'),
	scheduledTime: z.string().optional().or(z.literal('')),
	note: z
		.string()
		.max(1000, 'Note must be under 1000 characters')
		.optional()
		.or(z.literal('')),
	agreedPrice: z.coerce.number().min(0).optional(),
	customerName: z.string().optional().or(z.literal('')),
	customerPhone: z.string().optional().or(z.literal('')),
});

export type ArtisanBookingInput = z.infer<typeof artisanBookingSchema>;

export const artisanReviewSchema = z.object({
	bookingId: z.string().optional().or(z.literal('')),
	rating: z.coerce
		.number()
		.min(1, 'Rating must be at least 1')
		.max(5, 'Rating cannot exceed 5'),
	comment: z
		.string()
		.max(500, 'Review must be under 500 characters')
		.optional()
		.or(z.literal('')),
});

export type ArtisanReviewInput = z.infer<typeof artisanReviewSchema>;
