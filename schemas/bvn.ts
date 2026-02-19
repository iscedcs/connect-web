import { z } from 'zod';

export const bvnSchema = z.object({
	bvn: z
		.string()
		.transform((s) => s.replace(/\D/g, '')) // keep digits
		.refine((digits) => digits.length === 11, {
			message: 'BVN must be 11 digits',
		}),
	accountNumber: z
		.string()
		.transform((s) => s.replace(/\D/g, ''))
		.refine((digits) => digits.length === 10, {
			message: 'Account number must be 10 digits',
		}),
	bankCode: z.string().min(1, { message: 'Please select a bank' }),
});

export type BvnInput = z.infer<typeof bvnSchema>;
