# Paystack Dynamic Virtual Account (DVA) — Implementation Guide

How Dedicated Virtual Accounts work in the ISCE ecosystem. Use this document to replicate the DVA + payment system in other projects.

---

## Overview

A **Dedicated Virtual Account (DVA)** is a unique bank account number assigned to a user via Paystack. When anyone sends money to that account number via bank transfer, Paystack notifies your backend via webhook, and you credit the user's wallet automatically.

The ISCE implementation lives primarily in **wallet-nest** (NestJS backend). Frontend projects (connect-web, isce-wallet) proxy requests to wallet-nest.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        DVA SETUP FLOW                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User submits BVN + Bank Details                                 │
│       │                                                          │
│       ▼                                                          │
│  1. resolveAccountNumber()     ← verify bank account exists      │
│       │                                                          │
│       ▼                                                          │
│  2. createCustomer()           ← create Paystack customer        │
│       │                          returns customer_code            │
│       ▼                                                          │
│  3. Hash BVN (SHA-256)         ← never store plaintext           │
│     Store bvnLastFour                                            │
│       │                                                          │
│       ▼                                                          │
│  4. validateCustomerIdentity() ← async BVN verification          │
│     Set kycStatus = BVN_SUBMITTED   (Paystack returns 202)       │
│       │                                                          │
│       ▼  (async — Paystack verifies BVN in background)           │
│                                                                  │
│  5. Webhook: customeridentification.success                      │
│       │                                                          │
│       ▼                                                          │
│  6. Upgrade wallet kycLevel → ONE                                │
│     Set singleTxLimit = ₦30,000                                  │
│       │                                                          │
│       ▼                                                          │
│  7. createDedicatedAccount()   ← creates virtual account         │
│     preferred_bank: "wema-bank"                                  │
│       │                                                          │
│       ▼                                                          │
│  8. Store virtualAccountNumber, virtualAccountBank on Wallet     │
│     User now has a permanent bank account number                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    DVA INCOMING PAYMENT FLOW                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  External sender → bank transfer to user's DVA (Wema Bank)       │
│       │                                                          │
│       ▼                                                          │
│  Paystack webhook: charge.success                                │
│       │  (no pre-existing transaction — this is a DVA transfer)  │
│       ▼                                                          │
│  1. Look up wallet via customer_code → WalletKyc → Wallet       │
│       │                                                          │
│       ▼                                                          │
│  2. Check for duplicate (same reference already processed)       │
│       │                                                          │
│       ▼                                                          │
│  3. Lock wallet row (SELECT FOR UPDATE)                          │
│       │                                                          │
│       ▼                                                          │
│  4. Calculate fees:                                              │
│     • Paystack fee: 1% capped at ₦300                           │
│     • Platform fee: 2% capped at ₦200                           │
│     • Net amount = gross - total fees                            │
│       │                                                          │
│       ▼                                                          │
│  5. Create COMPLETED FUNDING transaction                         │
│     Credit wallet balance with net amount                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Required (Server-side)

| Variable              | Example                    | Purpose                                                                                     |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| `PAYSTACK_SECRET_KEY` | `sk_test_486bb0cb35b2a...` | API authentication. Used for all server-to-server calls and webhook signature verification. |
| `PAYSTACK_PUBLIC_KEY` | `pk_test_ba60e2bad0fce...` | Client-side key. Returned via API for frontend Paystack.js/checkout initialization.         |
| `PAYSTACK_BASE_URL`   | `https://api.paystack.co`  | Paystack API base URL. Defaults to `https://api.paystack.co` if not set.                    |

### Optional (Cross-service notifications)

| Variable              | Example                 | Purpose                                                                                    |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `CONNECT_API_URL`     | `http://localhost:4990` | connect-nest backend URL. Used to send wallet activation notifications after DVA creation. |
| `INTERNAL_NOTIFY_KEY` | `some-internal-key`     | Shared secret for internal service-to-service notification calls.                          |

### .env example

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_486bb0cb35b2a10e0c5e13e00291f3e7919c1aff
PAYSTACK_PUBLIC_KEY=pk_test_ba60e2bad0fce5ffc0336fa8476893d281799555
PAYSTACK_BASE_URL=https://api.paystack.co

# Cross-service (optional)
CONNECT_API_URL=http://localhost:4990
INTERNAL_NOTIFY_KEY=your-internal-notify-key
```

---

## Required Dependencies

```bash
# NestJS backend
pnpm add axios

# Next.js frontend (if calling Paystack directly)
# No extra deps needed — uses native fetch
```

---

## Database Schema (Prisma)

### Enums

```prisma
enum KycStatus {
  UNVERIFIED       // Default — no KYC submitted
  BVN_SUBMITTED    // BVN sent to Paystack, awaiting verification
  BVN_VERIFIED     // Paystack confirmed BVN — DVA created
  REJECTED         // Paystack rejected BVN — user can retry
}

enum KycLevel {
  ZERO             // No KYC — wallet exists but no DVA
  ONE              // BVN verified — DVA assigned, ₦30,000 tx limit
  TWO              // BVN + ID — higher limits
  THREE            // Full KYC — no limits
}

enum TransactionType {
  FUNDING
  WITHDRAWAL
  TRANSFER_IN
  TRANSFER_OUT
  PAYMENT
  REFUND
  ESCROW_LOCK
  ESCROW_RELEASE
  ESCROW_REFUND
  FEE
  REVERSAL
}

enum TransactionFlow {
  CREDIT
  DEBIT
}

enum TransactionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REVERSED
}

enum WebhookLogStatus {
  RECEIVED
  PROCESSED
  FAILED
  IGNORED
}
```

### Models

```prisma
model Wallet {
  id                   String       @id @default(uuid())
  userId               String
  currency             String       @default("NGN")
  balance              Decimal      @default(0) @db.Decimal(18, 4)
  ledgerBalance        Decimal      @default(0) @db.Decimal(18, 4)
  status               WalletStatus @default(ACTIVE)

  // KYC & virtual account
  kycStatus            KycStatus    @default(UNVERIFIED)
  kycLevel             KycLevel     @default(ZERO)
  virtualAccountNumber String?      // DVA account number (e.g. "8012345678")
  virtualAccountBank   String?      // Bank name (e.g. "Wema Bank")
  virtualAccountRef    String?      // Paystack internal reference

  singleTxLimit        Decimal?     @db.Decimal(18, 4) // Set to 30000 at KYC ONE

  kyc                  WalletKyc?
  transactions         Transaction[]

  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt
  deletedAt            DateTime?

  @@unique([userId, currency])
  @@index([virtualAccountNumber])
}

model WalletKyc {
  id                   String   @id @default(uuid())
  wallet               Wallet   @relation(fields: [walletId], references: [id])
  walletId             String   @unique
  userId               String   @unique

  // BVN data — NEVER store plaintext
  bvnHash              String?  // SHA-256 hash of the BVN
  bvnLastFour          String?  // Last 4 digits for display only
  bvnVerified          Boolean  @default(false)
  bvnVerifiedAt        DateTime?

  // Paystack customer mapping
  paystackCustomerId   String?
  paystackCustomerCode String?  // e.g. "CUS_xxxxxxxxxx"

  metadata             Json?    // Stores accountNumber, bankCode, resolvedAccountName, etc.

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([paystackCustomerCode])
}

model Transaction {
  id              String            @id @default(uuid())
  wallet          Wallet            @relation(fields: [walletId], references: [id])
  walletId        String
  reference       String            @unique @default(uuid())
  type            TransactionType
  flow            TransactionFlow
  amount          Decimal           @db.Decimal(18, 4)
  fee             Decimal           @default(0) @db.Decimal(18, 4)
  balanceBefore   Decimal           @db.Decimal(18, 4)
  balanceAfter    Decimal           @db.Decimal(18, 4)
  status          TransactionStatus @default(PENDING)
  description     String?
  metadata        Json?

  sourceModule    SourceModule      @default(WALLET)
  sourceReference String?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([walletId])
  @@index([reference])
  @@index([status])
}

model WebhookLog {
  id           String           @id @default(uuid())
  provider     String           @default("paystack")
  event        String           // e.g. "charge.success"
  reference    String?
  customerCode String?
  status       WebhookLogStatus @default(RECEIVED)
  rawBody      Json             // Full event payload
  error        String?
  processedAt  DateTime?
  createdAt    DateTime         @default(now())

  @@index([event])
  @@index([reference])
  @@index([customerCode])
}
```

---

## File-by-File Implementation

### 1. Paystack Service — API Wrapper

Core service that wraps all Paystack HTTP calls. Uses axios with Bearer token auth.

```typescript
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';

// Response/type interfaces (see DTO section below)
import {
	PaystackResponse,
	PaystackInitData,
	PaystackVerifyData,
	PaystackBankData,
	PaystackResolveData,
	PaystackRecipientData,
	PaystackTransferData,
	PaystackDedicatedAccountData,
	PaystackWebhookEvent,
} from './dto/paystack.dto';

@Injectable()
export class PaystackService {
	private readonly logger = new Logger(PaystackService.name);
	private readonly baseUrl: string;
	private readonly secretKey: string;
	private readonly publicKey: string;

	constructor() {
		this.baseUrl =
			process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
		this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
		this.publicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
	}

	private get headers(): Record<string, string> {
		return {
			Authorization: `Bearer ${this.secretKey}`,
			'Content-Type': 'application/json',
		};
	}

	private handleError(error: AxiosError, operation: string): never {
		const data = error.response?.data as any;
		this.logger.error(
			`Paystack ${operation} failed:`,
			data || error.message,
		);
		throw new HttpException(
			{
				message: `Paystack: ${operation} failed`,
				error: data?.message || error.message,
			},
			error.response?.status || HttpStatus.BAD_GATEWAY,
		);
	}

	// ─── Transaction Operations ──────────────────────────

	/** Initialize a payment — returns authorization_url for checkout */
	async initializeTransaction(params: {
		email: string;
		amount: number; // amount in KOBO (₦1 = 100 kobo)
		reference?: string;
		callbackUrl?: string;
		metadata?: Record<string, any>;
		channels?: string[]; // e.g. ['card', 'bank_transfer']
	}): Promise<PaystackResponse<PaystackInitData>> {
		try {
			const body: Record<string, any> = {
				email: params.email,
				amount: params.amount,
			};
			if (params.reference) body.reference = params.reference;
			if (params.callbackUrl) body.callback_url = params.callbackUrl;
			if (params.metadata) body.metadata = params.metadata;
			if (params.channels) body.channels = params.channels;

			const response = await axios.post<
				PaystackResponse<PaystackInitData>
			>(`${this.baseUrl}/transaction/initialize`, body, {
				headers: this.headers,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Initialize transaction');
		}
	}

	/** Verify a transaction by reference */
	async verifyTransaction(
		reference: string,
	): Promise<PaystackResponse<PaystackVerifyData>> {
		try {
			const response = await axios.get<
				PaystackResponse<PaystackVerifyData>
			>(`${this.baseUrl}/transaction/verify/${reference}`, {
				headers: this.headers,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Verify transaction');
		}
	}

	// ─── Bank / Account Resolution ────────────────────────

	/** List banks supported by Paystack (Nigeria) */
	async listBanks(
		country = 'nigeria',
	): Promise<PaystackResponse<PaystackBankData[]>> {
		try {
			const response = await axios.get<
				PaystackResponse<PaystackBankData[]>
			>(`${this.baseUrl}/bank`, {
				headers: this.headers,
				params: { country, perPage: 100 },
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'List banks');
		}
	}

	/** Resolve a bank account number → account name */
	async resolveAccountNumber(
		accountNumber: string,
		bankCode: string,
	): Promise<PaystackResponse<PaystackResolveData>> {
		try {
			const response = await axios.get<
				PaystackResponse<PaystackResolveData>
			>(`${this.baseUrl}/bank/resolve`, {
				headers: this.headers,
				params: { account_number: accountNumber, bank_code: bankCode },
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Resolve account');
		}
	}

	// ─── Transfer Recipients + Payouts ─────────────────────

	/** Create a transfer recipient (bank account to send money to) */
	async createTransferRecipient(params: {
		name: string;
		accountNumber: string;
		bankCode: string;
		currency?: string;
	}): Promise<PaystackResponse<PaystackRecipientData>> {
		try {
			const response = await axios.post<
				PaystackResponse<PaystackRecipientData>
			>(
				`${this.baseUrl}/transferrecipient`,
				{
					type: 'nuban',
					name: params.name,
					account_number: params.accountNumber,
					bank_code: params.bankCode,
					currency: params.currency || 'NGN',
				},
				{ headers: this.headers },
			);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Create transfer recipient');
		}
	}

	/** Initiate a transfer (payout) to a bank account. Amount in KOBO. */
	async initiateTransfer(params: {
		amount: number;
		recipientCode: string;
		reason?: string;
		reference?: string;
	}): Promise<PaystackResponse<PaystackTransferData>> {
		try {
			const body: Record<string, any> = {
				source: 'balance',
				amount: params.amount,
				recipient: params.recipientCode,
			};
			if (params.reason) body.reason = params.reason;
			if (params.reference) body.reference = params.reference;

			const response = await axios.post<
				PaystackResponse<PaystackTransferData>
			>(`${this.baseUrl}/transfer`, body, { headers: this.headers });
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Initiate transfer');
		}
	}

	/** Verify a transfer by reference */
	async verifyTransfer(
		reference: string,
	): Promise<PaystackResponse<PaystackTransferData>> {
		try {
			const response = await axios.get<
				PaystackResponse<PaystackTransferData>
			>(`${this.baseUrl}/transfer/verify/${reference}`, {
				headers: this.headers,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Verify transfer');
		}
	}

	// ─── Dedicated Virtual Accounts (DVA) ──────────────────

	/** Create a dedicated (permanent) virtual account for a customer */
	async createDedicatedAccount(params: {
		customerCode: string;
		preferredBank?: string; // default: "wema-bank"
	}): Promise<PaystackResponse<PaystackDedicatedAccountData>> {
		try {
			const response = await axios.post<
				PaystackResponse<PaystackDedicatedAccountData>
			>(
				`${this.baseUrl}/dedicated_account`,
				{
					customer: params.customerCode,
					preferred_bank: params.preferredBank || 'wema-bank',
				},
				{ headers: this.headers },
			);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Create dedicated account');
		}
	}

	// ─── Customer Management (required for DVA) ────────────

	/** Create or fetch a Paystack customer */
	async createCustomer(params: {
		email: string;
		firstName?: string;
		lastName?: string;
		phone?: string;
	}): Promise<
		PaystackResponse<{ customer_code: string; id: number; email: string }>
	> {
		try {
			const response = await axios.post(
				`${this.baseUrl}/customer`,
				{
					email: params.email,
					first_name: params.firstName,
					last_name: params.lastName,
					phone: params.phone,
				},
				{ headers: this.headers },
			);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Create customer');
		}
	}

	/**
	 * Validate customer identity via BVN (bank_account type).
	 * Paystack returns 202 Accepted — result arrives via webhook:
	 * - customeridentification.success
	 * - customeridentification.failed
	 */
	async validateCustomerIdentity(params: {
		customerCode: string;
		country: string; // "NG"
		firstName: string;
		lastName: string;
		bvn: string;
		accountNumber: string;
		bankCode: string;
		middleName?: string;
	}): Promise<
		PaystackResponse<{ verified: boolean; verificationMessage: string }>
	> {
		try {
			const body: Record<string, any> = {
				country: params.country,
				type: 'bank_account',
				account_number: params.accountNumber,
				bvn: params.bvn,
				bank_code: params.bankCode,
				first_name: params.firstName,
				last_name: params.lastName,
			};
			if (params.middleName) body.middle_name = params.middleName;

			const response = await axios.post(
				`${this.baseUrl}/customer/${params.customerCode}/identification`,
				body,
				{ headers: this.headers },
			);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Validate customer identity');
		}
	}

	/** Fetch a Paystack customer to check identification status */
	async fetchCustomer(emailOrCode: string): Promise<
		PaystackResponse<{
			customer_code: string;
			id: number;
			email: string;
			identified: boolean;
			identifications: Array<{ type: string; status: string }>;
		}>
	> {
		try {
			const response = await axios.get(
				`${this.baseUrl}/customer/${emailOrCode}`,
				{ headers: this.headers },
			);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError, 'Fetch customer');
		}
	}

	// ─── Webhook Signature Verification ────────────────────

	/** Verify HMAC-SHA512 signature from Paystack webhook */
	verifyWebhookSignature(
		body: string | Buffer,
		signature: string,
	): PaystackWebhookEvent {
		const hash = crypto
			.createHmac('sha512', this.secretKey)
			.update(body)
			.digest('hex');
		if (hash !== signature) {
			throw new HttpException(
				'Invalid webhook signature',
				HttpStatus.UNAUTHORIZED,
			);
		}
		return JSON.parse(
			typeof body === 'string' ? body : body.toString('utf-8'),
		);
	}

	getPublicKey(): string {
		return this.publicKey;
	}
}
```

---

### 2. DTOs & Type Definitions

```typescript
// ─── Enums ───────────────────────────────────────────────
export enum PaystackChannel {
	CARD = 'card',
	BANK = 'bank',
	BANK_TRANSFER = 'bank_transfer',
	USSD = 'ussd',
	QR = 'qr',
	MOBILE_MONEY = 'mobile_money',
}

// ─── Response Types ──────────────────────────────────────
export interface PaystackResponse<T = any> {
	status: boolean;
	message: string;
	data: T;
}

export interface PaystackInitData {
	authorization_url: string;
	access_code: string;
	reference: string;
}

export interface PaystackVerifyData {
	id: number;
	status: 'success' | 'failed' | 'abandoned';
	reference: string;
	amount: number; // in kobo
	currency: string;
	channel: string;
	paid_at: string;
	customer: { id: number; email: string; customer_code: string };
	metadata: Record<string, any>;
	gateway_response: string;
}

export interface PaystackBankData {
	name: string;
	slug: string;
	code: string;
	longcode: string;
	type: string;
	country: string;
	currency: string;
	active: boolean;
}

export interface PaystackResolveData {
	account_number: string;
	account_name: string;
	bank_id: number;
}

export interface PaystackRecipientData {
	recipient_code: string;
	name: string;
	type: string;
	currency: string;
	details: {
		account_number: string;
		account_name: string;
		bank_code: string;
		bank_name: string;
	};
}

export interface PaystackTransferData {
	reference: string;
	status: 'pending' | 'success' | 'failed' | 'reversed';
	transfer_code: string;
	amount: number;
	currency: string;
	recipient: PaystackRecipientData;
}

export interface PaystackDedicatedAccountData {
	id: number;
	account_name: string;
	account_number: string;
	bank: { name: string; slug: string };
	assignment: { assignee_id: string; assignee_type: string };
}

// ─── Webhook Types ───────────────────────────────────────
export type PaystackEventType =
	| 'charge.success'
	| 'transfer.success'
	| 'transfer.failed'
	| 'transfer.reversed'
	| 'dedicatedaccount.assign.success'
	| 'dedicatedaccount.assign.failed'
	| 'customeridentification.success'
	| 'customeridentification.failed';

export interface PaystackWebhookEvent {
	event: PaystackEventType;
	data: Record<string, any>;
}
```

---

### 3. Webhook Controller

Handles all Paystack webhook events. This is a **public route** (no JWT) — authenticated via HMAC-SHA512 signature.

**Important:** Respond with `200 OK` immediately, then process async. Paystack retries on non-200 responses.

```typescript
import {
	Controller,
	Post,
	Req,
	Res,
	Logger,
	HttpStatus,
	RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PublicRoute } from 'src/auth/decorators/public-route.decorator';
import { PaystackService } from './paystack.service';
import { DatabaseService } from 'src/database/database.service';

@Controller('webhooks/paystack')
export class PaystackWebhookController {
	private readonly logger = new Logger(PaystackWebhookController.name);

	constructor(
		private readonly paystackService: PaystackService,
		private readonly db: DatabaseService,
	) {}

	@Post()
	@PublicRoute()
	async handleWebhook(
		@Req() req: RawBodyRequest<Request>,
		@Res() res: Response,
	) {
		// Respond immediately so Paystack doesn't retry
		res.status(HttpStatus.OK).send('OK');

		let webhookLogId: string | undefined;

		try {
			const signature = req.headers['x-paystack-signature'] as string;
			if (!signature) return;

			const rawBody = req.rawBody;
			if (!rawBody) return;

			// Verify HMAC-SHA512 signature
			const event = this.paystackService.verifyWebhookSignature(
				rawBody,
				signature,
			);

			// Log raw webhook
			const webhookLog = await this.db.webhookLog.create({
				data: {
					provider: 'paystack',
					event: event.event,
					reference: event.data?.reference ?? null,
					customerCode:
						(event.data?.customer_code ||
							event.data?.customer?.customer_code) ??
						null,
					status: 'RECEIVED',
					rawBody: event as any,
				},
			});
			webhookLogId = webhookLog.id;

			// Route to handler
			switch (event.event) {
				case 'charge.success':
					await this.handleChargeSuccess(event.data);
					break;
				case 'transfer.success':
					await this.handleTransferSuccess(event.data);
					break;
				case 'transfer.failed':
				case 'transfer.reversed':
					await this.handleTransferFailed(event.data);
					break;
				case 'customeridentification.success':
					await this.handleCustomerIdentificationSuccess(event.data);
					break;
				case 'customeridentification.failed':
					await this.handleCustomerIdentificationFailed(event.data);
					break;
				default:
					await this.db.webhookLog.update({
						where: { id: webhookLogId },
						data: { status: 'IGNORED', processedAt: new Date() },
					});
					return;
			}

			// Mark processed
			await this.db.webhookLog.update({
				where: { id: webhookLogId },
				data: { status: 'PROCESSED', processedAt: new Date() },
			});
		} catch (error: any) {
			if (webhookLogId) {
				await this.db.webhookLog
					.update({
						where: { id: webhookLogId },
						data: {
							status: 'FAILED',
							error: error.message,
							processedAt: new Date(),
						},
					})
					.catch(() => {});
			}
		}
	}

	// ... event handler methods (see below)
}
```

#### charge.success Handler — DVA Incoming Payment

This is the key handler for DVA bank transfers. It handles **two flows**:

1. **Paystack checkout flow:** A pre-existing PENDING transaction exists (user clicked "Fund wallet" → went to Paystack checkout). Find it by reference and complete it.

2. **DVA bank transfer flow:** No pre-existing transaction. Someone sent money to the user's virtual account number. Look up the wallet via `customer_code → WalletKyc → Wallet`, then create a new COMPLETED transaction.

```typescript
private async handleChargeSuccess(data: Record<string, any>) {
  const reference = data.reference as string;
  if (!reference) return;

  const customerCode = data.customer?.customer_code as string | undefined;
  const channel = data.channel as string | undefined;

  // Paystack sends amounts in kobo — convert to naira
  const amountKobo = Number(data.amount ?? 0);
  const amountNaira = new Prisma.Decimal(amountKobo).div(100);
  const feesKobo = Number(data.fees ?? 0);
  const feeNaira = new Prisma.Decimal(feesKobo).div(100);

  // Sender details from authorization object
  const auth = data.authorization ?? {};
  const senderName = auth.sender_name ?? null;
  const senderBank = auth.sender_bank ?? auth.bank ?? null;
  const senderAccount = auth.sender_bank_account_number ?? null;

  await this.db.$transaction(async (tx) => {
    // ── Flow 1: Paystack checkout (pre-existing PENDING tx) ──
    const existingTx = await tx.transaction.findFirst({
      where: { reference, status: 'PENDING', type: 'FUNDING' },
    });

    if (existingTx) {
      // Lock wallet row
      await tx.$queryRaw`SELECT id FROM "Wallet" WHERE id = ${existingTx.walletId} FOR UPDATE`;
      const wallet = await tx.wallet.findFirst({ where: { id: existingTx.walletId, deletedAt: null } });
      if (!wallet) return;

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore.add(existingTx.amount);

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter, ledgerBalance: { increment: existingTx.amount } },
      });
      await tx.transaction.update({
        where: { id: existingTx.id },
        data: { status: 'COMPLETED', fee: feeNaira, balanceBefore, balanceAfter, metadata: data as any },
      });
      return;
    }

    // ── Flow 2: DVA bank transfer (no pre-existing tx) ──
    if (!customerCode) return;

    // Look up wallet via customer_code → WalletKyc → Wallet
    const kyc = await tx.walletKyc.findFirst({
      where: { paystackCustomerCode: customerCode },
      include: { wallet: true },
    });
    if (!kyc || !kyc.wallet || kyc.wallet.deletedAt) return;

    // Duplicate guard
    const duplicate = await tx.transaction.findFirst({ where: { reference } });
    if (duplicate) return;

    const wallet = kyc.wallet;

    // Lock wallet row
    await tx.$queryRaw`SELECT id FROM "Wallet" WHERE id = ${wallet.id} FOR UPDATE`;
    const lockedWallet = await tx.wallet.findFirstOrThrow({ where: { id: wallet.id } });
    const balanceBefore = lockedWallet.balance;

    // ── Fee calculation ──
    // Paystack fee: 1% capped at ₦300
    const paystackFeeRaw = amountNaira.mul('0.01');
    const dvaPaystackFee = paystackFeeRaw.gt(new Prisma.Decimal('300'))
      ? new Prisma.Decimal('300') : paystackFeeRaw;

    // Platform fee: 2% capped at ₦200
    const platformFeeRaw = amountNaira.mul('0.02');
    const platformFee = platformFeeRaw.gt(new Prisma.Decimal('200'))
      ? new Prisma.Decimal('200') : platformFeeRaw;

    const totalFee = dvaPaystackFee.add(platformFee);
    const netAmount = amountNaira.sub(totalFee);
    const balanceAfter = balanceBefore.add(netAmount);

    // Create COMPLETED funding transaction
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        reference,
        type: 'FUNDING',
        flow: 'CREDIT',
        amount: netAmount,
        fee: totalFee,
        balanceBefore,
        balanceAfter,
        status: 'COMPLETED',
        description: senderName
          ? `Bank transfer from ${senderName}${senderBank ? ` (${senderBank})` : ''}`
          : 'Bank transfer funding via dedicated account',
        sourceModule: 'EXTERNAL',
        metadata: {
          /* full webhook data — see wallet-nest source for complete fields */
          fees: {
            paystackFee: dvaPaystackFee.toFixed(2),
            platformFee: platformFee.toFixed(2),
            totalFee: totalFee.toFixed(2),
            grossAmount: amountNaira.toFixed(2),
            netAmount: netAmount.toFixed(2),
          },
          sender: { name: senderName, bank: senderBank, account: senderAccount },
        },
      },
    });

    // Credit wallet
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter, ledgerBalance: { increment: netAmount } },
    });
  });
}
```

#### customeridentification.success Handler — DVA Creation

Triggered after Paystack verifies BVN. Upgrades wallet and creates the DVA.

```typescript
private async handleCustomerIdentificationSuccess(data: Record<string, any>) {
  const customerCode = (data.customer_code || data.customer?.customer_code) as string;
  if (!customerCode) return;

  const kyc = await this.db.walletKyc.findFirst({
    where: { paystackCustomerCode: customerCode },
    include: { wallet: true },
  });
  if (!kyc || kyc.wallet.kycLevel !== 'ZERO') return;

  // Upgrade wallet to KYC Level ONE
  await this.db.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: kyc.walletId },
      data: { kycLevel: 'ONE', kycStatus: 'BVN_VERIFIED', singleTxLimit: 30_000 },
    });
    await tx.walletKyc.update({
      where: { id: kyc.id },
      data: { bvnVerified: true, bvnVerifiedAt: new Date(), metadata: data as any },
    });
  });

  // Create dedicated virtual account
  try {
    const accountRes = await this.paystackService.createDedicatedAccount({ customerCode });
    if (accountRes.data?.account_number) {
      await this.db.wallet.update({
        where: { id: kyc.walletId },
        data: {
          virtualAccountNumber: accountRes.data.account_number,
          virtualAccountBank: accountRes.data.bank?.name,
          virtualAccountRef: String(accountRes.data.id ?? ''),
        },
      });
    }
  } catch (err: any) {
    this.logger.error(`DVA creation failed: ${err.message}`);
  }
}
```

---

### 4. KYC Submission Service

The service method that users call to start the BVN verification process.

```typescript
async submitBvnKyc(
  userId: string,
  walletId: string,
  dto: { bvn: string; accountNumber: string; bankCode: string },
  userInfo: { email: string; firstName: string; lastName: string; phone?: string },
) {
  const wallet = await this.findUserWallet(userId, walletId);

  if (wallet.kycStatus === 'BVN_VERIFIED') {
    throw new ConflictException('Already KYC verified');
  }
  if (wallet.kycStatus === 'BVN_SUBMITTED') {
    return { success: true, message: 'Verification already in progress' };
  }

  // 1. Verify bank account exists
  const resolveRes = await this.paystack.resolveAccountNumber(dto.accountNumber, dto.bankCode);

  // 2. Create Paystack customer
  const customerRes = await this.paystack.createCustomer({
    email: userInfo.email,
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    phone: userInfo.phone,
  });
  const customerCode = customerRes.data.customer_code;

  // 3. Hash BVN — NEVER store plaintext
  const bvnHash = crypto.createHash('sha256').update(dto.bvn).digest('hex');

  // 4. Persist KYC record
  await this.db.$transaction(async (tx) => {
    await tx.walletKyc.upsert({
      where: { walletId },
      create: {
        walletId, userId, bvnHash,
        bvnLastFour: dto.bvn.slice(-4),
        paystackCustomerCode: customerCode,
        paystackCustomerId: String(customerRes.data.id),
        metadata: {
          accountNumber: dto.accountNumber,
          bankCode: dto.bankCode,
          resolvedAccountName: resolveRes.data.account_name,
        },
      },
      update: { /* same fields */ },
    });
    await tx.wallet.update({ where: { id: walletId }, data: { kycStatus: 'BVN_SUBMITTED' } });
  });

  // 5. Fire async identity validation — webhook will complete the flow
  await this.paystack.validateCustomerIdentity({
    customerCode,
    country: 'NG',
    bvn: dto.bvn,
    accountNumber: dto.accountNumber,
    bankCode: dto.bankCode,
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
  });

  return { success: true, message: 'BVN submitted. You will be notified once verified.' };
}
```

---

## NestJS Setup — Raw Body for Webhook Verification

Paystack webhook signature verification requires the **raw body** (not parsed JSON). Enable this in `main.ts`:

```typescript
const app = await NestFactory.create(AppModule, {
	rawBody: true, // CRITICAL — enables req.rawBody for webhook signature verification
});
```

---

## Payment Flows Summary

### Flow 1: Card/Bank Checkout Funding

```
User → POST /wallets/:id/transactions/fund/initialize
  → Creates PENDING transaction (ref: fund_pst_*)
  → Calls Paystack transaction/initialize
  → Returns authorization_url

User → redirected to Paystack checkout page
  → Completes payment

Paystack → POST /webhooks/paystack (charge.success)
  → Finds PENDING tx by reference
  → Credits wallet, marks COMPLETED
```

### Flow 2: DVA Bank Transfer (incoming)

```
External bank account → sends money to user's DVA (Wema Bank number)

Paystack → POST /webhooks/paystack (charge.success)
  → No pre-existing transaction
  → Looks up wallet via customer_code → WalletKyc → Wallet
  → Creates new COMPLETED FUNDING transaction
  → Credits wallet (minus fees)
```

### Flow 3: Withdrawal (payout)

```
User → POST /wallets/:id/transactions/withdraw
  → Verifies PIN (bcrypt)
  → Debits wallet (amount + ₦100 flat fee)
  → Creates PROCESSING transaction
  → Calls createTransferRecipient() + initiateTransfer()

Paystack → POST /webhooks/paystack (transfer.success)
  → Marks transaction COMPLETED

Paystack → POST /webhooks/paystack (transfer.failed | transfer.reversed)
  → Reverses wallet debit
  → Creates REVERSAL transaction
```

---

## Fee Structure

| Operation                    | Fee          | Cap    |
| ---------------------------- | ------------ | ------ |
| DVA incoming (Paystack fee)  | 1% of amount | ₦300   |
| DVA incoming (Platform fee)  | 2% of amount | ₦200   |
| Withdrawal (flat fee)        | ₦100         | —      |
| Card checkout (Paystack fee) | ~1.5% + ₦100 | ₦2,000 |

---

## Paystack API Endpoints Used

| Endpoint                          | Method | Purpose                                      |
| --------------------------------- | ------ | -------------------------------------------- |
| `/transaction/initialize`         | POST   | Create payment checkout                      |
| `/transaction/verify/{ref}`       | GET    | Verify payment status                        |
| `/customer`                       | POST   | Create customer for KYC                      |
| `/customer/{code}`                | GET    | Fetch customer (check identification status) |
| `/customer/{code}/identification` | PUT    | Submit BVN for verification (async)          |
| `/dedicated_account`              | POST   | Create permanent virtual account             |
| `/bank`                           | GET    | List supported banks                         |
| `/bank/resolve`                   | GET    | Resolve account number → name                |
| `/transferrecipient`              | POST   | Create payout recipient                      |
| `/transfer`                       | POST   | Initiate payout                              |
| `/transfer/verify/{ref}`          | GET    | Verify payout status                         |

---

## Webhook Events to Handle

| Event                             | When It Fires                                | Action                             |
| --------------------------------- | -------------------------------------------- | ---------------------------------- |
| `charge.success`                  | Payment completed (checkout or DVA transfer) | Credit wallet                      |
| `transfer.success`                | Payout completed                             | Mark withdrawal COMPLETED          |
| `transfer.failed`                 | Payout failed                                | Reverse debit, create REVERSAL     |
| `transfer.reversed`               | Payout reversed                              | Same as transfer.failed            |
| `customeridentification.success`  | BVN verified                                 | Upgrade KYC, create DVA            |
| `customeridentification.failed`   | BVN rejected                                 | Set kycStatus = REJECTED           |
| `dedicatedaccount.assign.success` | DVA assigned                                 | Update wallet with account details |
| `dedicatedaccount.assign.failed`  | DVA failed                                   | Log failure                        |

---

## Replication Checklist

To add Paystack DVA to a new project:

1. **Add env vars:** `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_BASE_URL`
2. **Install deps:** `pnpm add axios` (or use native fetch)
3. **Create Paystack service** — copy the API wrapper with all methods
4. **Create DTOs/types** — copy the response interfaces and webhook event types
5. **Add Prisma models:** `Wallet` (with KYC/DVA fields), `WalletKyc`, `Transaction`, `WebhookLog`
6. **Create webhook controller** — public route, HMAC-SHA512 verification, raw body required
7. **Enable raw body** in NestJS: `NestFactory.create(AppModule, { rawBody: true })`
8. **Create KYC submission endpoint** — BVN + bank account → Paystack customer → validate identity
9. **Register webhook URL** in Paystack Dashboard → Settings → API Keys & Webhooks
10. **Amount convention:** All Paystack amounts are in **kobo** (₦1 = 100 kobo). Convert in/out.
11. **BVN security:** Hash with SHA-256, only store last 4 digits. Never log or return plaintext.

### Paystack Dashboard Setup

1. Go to [dashboard.paystack.com](https://dashboard.paystack.com) → Settings → API Keys & Webhooks
2. Set **Webhook URL** to: `https://your-domain.com/webhooks/paystack`
3. Copy **Secret Key** and **Public Key** to your env vars
4. Enable **Dedicated Virtual Accounts** under Settings → Preferences (requires business verification)
5. For test mode, use `sk_test_*` and `pk_test_*` keys
