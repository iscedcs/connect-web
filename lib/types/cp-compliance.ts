/**
 * Compliance / post-signup KYC types (ENG-410).
 *
 * The backend module (ENG-416) does not exist yet — no `compliance` module
 * is present on any connect-nest branch as of writing. Everything here is
 * the frontend's assumed contract, built so the UI can ship in parallel.
 * When ENG-416 lands, reconcile this file and `URLS.compliance` with the
 * real response; the parsing in `normalizeRequirements` is deliberately
 * tolerant so a near-miss in field naming degrades rather than crashes.
 */

/** The three fields ENG-410 moves out of business signup. */
export type ComplianceRequirementKey =
	| 'identificationType'
	| 'idNumber'
	| 'address'
	| 'dob';

export interface ComplianceRequirement {
	key: ComplianceRequirementKey | string;
	/** Human label; falls back to a derived one when the API omits it. */
	label: string;
	/** Optional helper text shown under the field on the form. */
	description?: string;
	required?: boolean;
}

export interface ComplianceStatus {
	/** True when nothing is outstanding. */
	complete: boolean;
	missing: ComplianceRequirement[];
}

const LABELS: Record<string, string> = {
	identificationType: 'Identification type',
	idNumber: 'Identification number',
	address: 'Personal address',
	dob: 'Date of birth',
};

const DESCRIPTIONS: Record<string, string> = {
	identificationType: 'NIN, BVN, CAC or TIN',
	idNumber: 'The number on the ID you selected',
	address: 'Your registered personal address',
	dob: 'Used to verify your identity',
};

function humanize(key: string): string {
	if (LABELS[key]) return LABELS[key];
	return key
		.replace(/([A-Z])/g, ' $1')
		.replace(/[_-]/g, ' ')
		.replace(/^./, (c) => c.toUpperCase())
		.trim();
}

/**
 * Accepts the shapes the endpoint could plausibly return and produces one
 * canonical `ComplianceStatus`:
 *
 *   { missing: ["dob", "address"] }
 *   { missing: [{ key: "dob", label: "Date of birth" }] }
 *   { data: { incomplete: [...], complete: false } }
 *
 * Returning `complete: true` on an unrecognised shape would hide the banner
 * and silently drop the compliance gate, so anything unparseable is treated
 * as "nothing known to be missing" only when the payload actually said so.
 */
export function normalizeRequirements(payload: unknown): ComplianceStatus {
	const root = (payload ?? {}) as Record<string, unknown>;
	const body = (root.data ?? root) as Record<string, unknown>;

	const rawList =
		(body.missing as unknown[]) ??
		(body.incomplete as unknown[]) ??
		(body.incompleteRequirements as unknown[]) ??
		(body.requirements as unknown[]) ??
		[];

	const missing: ComplianceRequirement[] = (Array.isArray(rawList) ? rawList : [])
		.map((item) => {
			if (typeof item === 'string') {
				return {
					key: item,
					label: humanize(item),
					description: DESCRIPTIONS[item],
					required: true,
				};
			}
			if (item && typeof item === 'object') {
				const obj = item as Record<string, unknown>;
				const key = String(obj.key ?? obj.field ?? obj.name ?? '');
				if (!key) return null;
				return {
					key,
					label: String(obj.label ?? humanize(key)),
					description:
						typeof obj.description === 'string'
							? obj.description
							: DESCRIPTIONS[key],
					required: obj.required !== false,
				};
			}
			return null;
		})
		.filter(Boolean) as ComplianceRequirement[];

	const explicitComplete =
		typeof body.complete === 'boolean'
			? body.complete
			: typeof body.isComplete === 'boolean'
				? (body.isComplete as boolean)
				: undefined;

	return {
		complete: explicitComplete ?? missing.length === 0,
		missing,
	};
}

/** Identification types accepted by the auth service's business signup DTO. */
export const IDENTIFICATION_TYPES = ['NIN', 'BVN', 'CAC', 'TIN'] as const;
export type IdentificationType = (typeof IDENTIFICATION_TYPES)[number];
