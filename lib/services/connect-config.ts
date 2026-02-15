import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';

const BASE =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;

export interface ModuleConfig {
	id: string;
	type: string;
	enabled?: boolean;
	order?: number;
	visibility?: 'public' | 'private';
	settings?: Record<string, unknown>;
}

export interface ConnectConfigTheme {
	mode: 'light' | 'dark';
	primary: string;
	accent: string;
}

export interface ConnectConfig {
	id: string;
	profileId: string;
	modules: ModuleConfig[];
	theme: ConnectConfigTheme | null;
	branding: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
}

function configUrl(profileId: string) {
	return `${BASE}${URLS.connect_config.get.replace('{profileId}', profileId)}`;
}

function updateUrl(profileId: string) {
	return `${BASE}${URLS.connect_config.update.replace('{profileId}', profileId)}`;
}

function reorderUrl(profileId: string) {
	return `${BASE}${URLS.connect_config.reorder.replace('{profileId}', profileId)}`;
}

export async function fetchConnectConfig({
	profileId,
	accessToken,
}: {
	profileId: string;
	accessToken: string;
}): Promise<ConnectConfig | null> {
	try {
		const res = await http.get(configUrl(profileId), {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return res.data?.data?.config ?? null;
	} catch {
		return null;
	}
}

export async function updateConnectConfig({
	profileId,
	accessToken,
	data,
}: {
	profileId: string;
	accessToken: string;
	data: {
		modules?: ModuleConfig[];
		theme?: ConnectConfigTheme;
		branding?: Record<string, unknown>;
	};
}): Promise<ConnectConfig | null> {
	try {
		const res = await http.patch(updateUrl(profileId), data, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return res.data?.data?.config ?? null;
	} catch {
		return null;
	}
}

export async function reorderModules({
	profileId,
	accessToken,
	moduleIds,
}: {
	profileId: string;
	accessToken: string;
	moduleIds: string[];
}): Promise<ConnectConfig | null> {
	try {
		const res = await http.patch(
			reorderUrl(profileId),
			{ module_ids: moduleIds },
			{ headers: { Authorization: `Bearer ${accessToken}` } },
		);
		return res.data?.data?.config ?? null;
	} catch {
		return null;
	}
}
