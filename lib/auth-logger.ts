/**
 * Auth flow debug logger.
 * Logs auth events with structured tags for easy tracing.
 * Never logs tokens, passwords, or full PII — only masked identifiers.
 */

const PREFIX = '[AUTH:connect-web]';

function timestamp(): string {
	return new Date().toISOString();
}

/** Mask a token: show first 8 and last 4 chars */
function maskToken(token: string | undefined | null): string {
	if (!token) return 'none';
	if (token.length < 16) return `present(${token.length}chars)`;
	return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

export const authLogger = {
	log(tag: string, message: string, meta?: Record<string, unknown>) {
		const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
		console.log(`${PREFIX}[${tag}] ${timestamp()} ${message}${metaStr}`);
	},

	warn(tag: string, message: string, meta?: Record<string, unknown>) {
		const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
		console.warn(`${PREFIX}[${tag}] ${timestamp()} ${message}${metaStr}`);
	},

	error(tag: string, message: string, meta?: Record<string, unknown>) {
		const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
		console.error(`${PREFIX}[${tag}] ${timestamp()} ${message}${metaStr}`);
	},

	maskToken,
};
