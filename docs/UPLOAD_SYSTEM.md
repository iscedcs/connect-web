# ISCE Upload System — Implementation Guide

How file uploads work in connect-web (Next.js App Router) using DigitalOcean Spaces (S3-compatible). Use this document to replicate the upload system in other ISCE projects.

---

## Architecture Overview

```
Client Component
  │  calls uploadImage() or uploadAsset()
  ▼
lib/client-upload.ts          ← wraps file in FormData, calls csrfFetch()
  ▼
lib/csrf-client.ts            ← reads csrf_token cookie, attaches X-CSRF-Token header
  ▼
app/api/upload/route.ts       ← Next.js API route (auth + validation + upload)
  │  1. Authenticates via getAuthInfo() (reads accessToken cookie, verifies JWT)
  │  2. Validates file type (PDF, JPEG, PNG, GIF, WebP)
  │  3. Validates file size (max 10MB)
  │  4. Reads `folder` query param (default: 'documents')
  ▼
lib/storage.ts                ← "use server" — creates S3Client, uploads to DO Spaces
  │  1. Converts File → Buffer
  │  2. Generates key: `${folder}/${timestamp}-${sanitised_filename}`
  │  3. PutObjectCommand with ACL: 'public-read'
  ▼
DigitalOcean Spaces           ← file stored at ${ENDPOINT}/${BUCKET}/${key}
  ▼
Response: { url: string, key: string }
```

**Two-tier pattern:** File is uploaded to DO Spaces first via the Next.js API route, then the returned `url` is sent to the NestJS backend (e.g. connect-nest) in a separate API call to persist it in the database.

---

## Environment Variables

| Variable                | Example Value                         | Purpose                                                                                  |
| ----------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `DO_SPACES_ENDPOINT`    | `https://fra1.digitaloceanspaces.com` | S3-compatible endpoint URL. Used to create the S3Client and to build the final file URL. |
| `DO_SPACES_REGION`      | `fra1`                                | DigitalOcean Spaces region.                                                              |
| `DO_SPACES_KEY`         | `DO00XXXXXXXXXXXXXX`                  | Access key ID for DO Spaces.                                                             |
| `DO_SPACES_SECRET`      | `secret-key-here`                     | Secret access key for DO Spaces.                                                         |
| `DO_SPACES_BUCKET`      | `isce-image`                          | Bucket name.                                                                             |
| `DO_SPACES_DOCS_PREFIX` | `documents`                           | Default folder prefix when no folder is specified.                                       |

All variables are **server-side only** (no `NEXT_PUBLIC_` prefix). They are accessed in `lib/storage.ts` which is a `"use server"` module.

### .env example

```env
DO_SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
DO_SPACES_REGION=fra1
DO_SPACES_KEY=DO00XXXXXXXXXXXXXX
DO_SPACES_SECRET=your-secret-key
DO_SPACES_BUCKET=isce-image
DO_SPACES_DOCS_PREFIX=documents
```

---

## Required Dependencies

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## File-by-File Implementation

### 1. `lib/storage.ts` — Core S3 Upload Engine

Server-only module. Handles upload, delete, and signed URL generation.

```typescript
'use server';

import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
	endpoint: process.env.DO_SPACES_ENDPOINT,
	region: process.env.DO_SPACES_REGION,
	credentials: {
		accessKeyId: process.env.DO_SPACES_KEY || '',
		secretAccessKey: process.env.DO_SPACES_SECRET || '',
	},
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || '';

export async function uploadFile(
	file: File,
	folder = process.env.DO_SPACES_DOCS_PREFIX,
) {
	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
		const key = `${folder}/${Date.now()}-${safeName}`;

		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: file.type,
			ACL: 'public-read',
		});

		await s3Client.send(command);

		const fileUrl = `${process.env.DO_SPACES_ENDPOINT}/${BUCKET_NAME}/${key}`;

		return { success: true, url: fileUrl, key: key, error: null };
	} catch (error) {
		console.error('Error uploading file:', error);
		return {
			success: false,
			url: null,
			key: null,
			error: 'Failed to upload file',
		};
	}
}

export async function deleteFile(key: string) {
	try {
		const command = new DeleteObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});
		await s3Client.send(command);
		return { success: true, error: null };
	} catch (error) {
		console.error('Error deleting file:', error);
		return { success: false, error: 'Failed to delete file' };
	}
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
	try {
		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});
		const url = await getSignedUrl(s3Client, command, { expiresIn });
		return { success: true, url, error: null };
	} catch (error) {
		console.error('Error generating signed URL:', error);
		return {
			success: false,
			url: null,
			error: 'Failed to generate download URL',
		};
	}
}
```

**Key details:**

- Filenames are sanitised: special characters → `_`
- Key format: `{folder}/{timestamp}-{filename}` (prevents collisions)
- ACL is `public-read` — files are immediately accessible via URL
- Final URL format: `https://fra1.digitaloceanspaces.com/isce-image/profiles/1740000000000-photo.jpg`

---

### 2. `app/api/upload/route.ts` — Upload API Route

Receives multipart form data, validates, and delegates to `uploadFile`.

```typescript
import { uploadFile } from '@/lib/storage';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuthInfo } from '@/actions/auth';

export async function POST(request: NextRequest) {
	try {
		// 1. Authenticate
		const auth = await getAuthInfo();
		if ('error' in auth || auth.isExpired) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		// 2. Extract file from FormData
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json(
				{ error: 'No file provided' },
				{ status: 400 },
			);
		}

		// 3. Validate file type
		const allowedTypes = [
			'application/pdf',
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
		];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{
					error: 'Invalid file type. Only PDFs and images are allowed.',
				},
				{ status: 400 },
			);
		}

		// 4. Validate file size (10MB max)
		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: 'File size exceeds 10MB limit' },
				{ status: 400 },
			);
		}

		// 5. Upload to DO Spaces
		const folder =
			request.nextUrl.searchParams.get('folder') || 'documents';
		const result = await uploadFile(file, folder);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ url: result.url, key: result.key });
	} catch (error) {
		console.error('Upload error:', error);
		return NextResponse.json(
			{ error: 'Failed to upload file' },
			{ status: 500 },
		);
	}
}
```

**Validation rules:**
| Rule | Value |
|---|---|
| Allowed MIME types | `application/pdf`, `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| Max file size | 10 MB |
| Default folder | `documents` |
| Auth required | Yes (JWT in httpOnly cookie) |

---

### 3. `lib/client-upload.ts` — Client-Side Upload Functions

Two convenience wrappers used by components. Both use `csrfFetch` for CSRF protection.

```typescript
import { csrfFetch } from '@/lib/csrf-client';

// For profile/cover photos — typed folder parameter
export async function uploadImage(file: File, folder: 'profiles' | 'covers') {
	const fd = new FormData();
	fd.append('file', file);
	const res = await csrfFetch(`/api/upload?folder=${folder}`, {
		method: 'POST',
		body: fd,
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json?.error || 'Upload failed');
	return json as { url: string; key: string };
}

// For arbitrary assets — any folder string
export async function uploadAsset(
	file: File,
	folder: string,
): Promise<{ url: string; key: string }> {
	const fd = new FormData();
	fd.append('file', file);
	const res = await csrfFetch(
		`/api/upload?folder=${encodeURIComponent(folder)}`,
		{ method: 'POST', body: fd },
	);
	const json = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(
			json?.error || `Upload failed with status ${res.status}`,
		);
	}
	return json as { url: string; key: string };
}
```

---

### 4. `lib/csrf-client.ts` — CSRF Wrapper (required for uploads)

All state-changing client requests must go through this wrapper.

```typescript
export function getCsrfToken(): string | undefined {
	if (typeof document === 'undefined') return undefined;
	const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
	return match ? decodeURIComponent(match[1]) : undefined;
}

export async function csrfFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const method = (init?.method || 'GET').toUpperCase();
	const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

	if (!safeMethods.includes(method)) {
		const csrfToken = getCsrfToken();
		if (csrfToken) {
			const headers = new Headers(init?.headers);
			headers.set('X-CSRF-Token', csrfToken);
			init = { ...init, headers };
		}
	}

	return fetch(input, init);
}
```

---

### 5. `lib/spaces/checksum.ts` — File Integrity (optional)

Used by the file upload modal to generate a SHA-256 checksum for documents.

```typescript
export async function generateChecksum(file: File) {
	const buffer = await file.arrayBuffer();
	const hash = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hash));
	const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return `sha256:${hex}`;
}
```

---

## Usage Examples

### Upload a profile photo

```typescript
'use client';

import { uploadImage } from '@/lib/client-upload';

async function handleProfilePhotoChange(file: File) {
	try {
		const { url, key } = await uploadImage(file, 'profiles');
		// url = "https://fra1.digitaloceanspaces.com/isce-image/profiles/1740000000000-photo.jpg"
		// Now send `url` to your backend to save in database
	} catch (err) {
		console.error('Upload failed:', err);
	}
}
```

### Upload a document with checksum

```typescript
'use client';

import { uploadAsset } from '@/lib/client-upload';
import { generateChecksum } from '@/lib/spaces/checksum';

async function handleDocumentUpload(file: File, profileId: string) {
	try {
		const [{ url, key }, checksum] = await Promise.all([
			uploadAsset(file, `profiles/${profileId}/files`),
			generateChecksum(file),
		]);

		// Send metadata to backend
		await csrfFetch(`${CONNECT_API_URL}/api/files`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				profileId,
				name: file.name,
				url,
				key,
				checksum,
				size: file.size,
				mediaType: file.type,
			}),
		});
	} catch (err) {
		console.error('Upload failed:', err);
	}
}
```

---

## Folder Conventions

| Folder                           | Used For                  |
| -------------------------------- | ------------------------- |
| `profiles`                       | Profile photos            |
| `covers`                         | Cover/banner photos       |
| `profiles/{profileId}/portfolio` | Artisan portfolio images  |
| `profiles/{profileId}/files`     | Document/file attachments |
| `documents`                      | Default fallback folder   |

---

## Next.js Image Configuration

If you render uploaded images with `<Image>`, add DO Spaces domains to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'fra1.digitaloceanspaces.com',
			},
			{
				protocol: 'https',
				hostname: 'isce-image.fra1.digitaloceanspaces.com',
			},
			{
				protocol: 'https',
				hostname: 'isce-image.fra1.cdn.digitaloceanspaces.com',
			},
		],
	},
};
```

The CDN hostname (`isce-image.fra1.cdn.digitaloceanspaces.com`) provides cached delivery and should be preferred for public-facing images.

---

## Replication Checklist

To add uploads to a new ISCE project:

1. **Install deps:** `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
2. **Add env vars:** Copy the 6 `DO_SPACES_*` variables to your `.env`
3. **Copy `lib/storage.ts`** — the core upload engine (no changes needed)
4. **Create `app/api/upload/route.ts`** — adapt auth check to your project's auth pattern
5. **Create `lib/client-upload.ts`** — adapt to use your project's fetch wrapper (csrfFetch or equivalent)
6. **Update `next.config.ts`** — add DO Spaces hostnames to `images.remotePatterns`
7. **(Optional)** Copy `lib/spaces/checksum.ts` if you need file integrity verification
