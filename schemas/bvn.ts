import { z } from 'zod';

/** A Nigerian mobile number once spaces and dashes are removed: 0803…, 234803… or +234803…. */
export const NIGERIAN_MOBILE_PATTERN = /^(\+?234|0)[789][01]\d{8}$/;

export function compactPhone(raw: string): string {
	return raw.replace(/[\s-]/g, '');
}

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
	phone: z
		.string()
		.transform((s) => compactPhone(s))
		.refine((s) => NIGERIAN_MOBILE_PATTERN.test(s), {
			message: 'Enter a Nigerian mobile number, e.g. 08031234567',
		}),
});

export type BvnInput = z.infer<typeof bvnSchema>;
