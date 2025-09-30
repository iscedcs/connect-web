/**
 * Web NFC Utility for reading and writing NFC tags
 * Requires HTTPS and user interaction to work properly
 */

export interface NFCReadingEvent {
	serialNumber: string;
	records: NFCRecord[];
}

export interface NFCRecord {
	recordType: string;
	mediaType?: string;
	id?: string;
	data?: any;
	encoding?: string;
	lang?: string;
}

export interface NFCWriteOptions {
	overwrite?: boolean;
	signal?: AbortSignal;
}

export interface NFCScanOptions {
	signal?: AbortSignal;
}

export class WebNFCUtils {
	private reader: NDEFReader | null = null;
	private writer: NDEFWriter | null = null;
	private isScanning: boolean = false;

	/**
	 * Check if Web NFC is supported in the current browser
	 */
	static isNFCSupported(): boolean {
		return typeof window !== 'undefined' && 'NDEFReader' in window;
	}

	/**
	 * Check if the device has NFC capability
	 */
	static async hasNFCCapability(): Promise<boolean> {
		if (!this.isNFCSupported()) {
			return false;
		}

		try {
			const reader = new NDEFReader();
			return true;
		} catch (error) {
			console.warn('NFC capability check failed:', error);
			return false;
		}
	}

	/**
	 * Get scanning status
	 */
	get isScanningActive(): boolean {
		return this.isScanning;
	}

	/**
	 * Start scanning for NFC tags with event handlers
	 */
	async startScan(
		onReading: (event: NFCReadingEvent) => void,
		onError?: (error: Error) => void,
		options?: NFCScanOptions
	): Promise<void> {
		if (!WebNFCUtils.isNFCSupported()) {
			throw new Error('Web NFC is not supported in this browser');
		}

		if (this.isScanning) {
			throw new Error('NFC scan is already in progress');
		}

		try {
			this.reader = new NDEFReader();
			this.isScanning = true;

			// Set up event listeners
			this.reader.addEventListener('reading', (event: any) => {
				const nfcEvent: NFCReadingEvent = {
					serialNumber: event.serialNumber || '',
					records: event.message.records.map((record: any) => ({
						recordType: record.recordType,
						mediaType: record.mediaType,
						id: record.id,
						data: record.data,
						encoding: record.encoding,
						lang: record.lang,
					})),
				};
				onReading(nfcEvent);
			});

			if (onError) {
				this.reader.addEventListener('readingerror', (event: any) => {
					onError(
						new Error(event.error || 'Unknown NFC reading error')
					);
				});
			}

			await this.reader.scan(options);
		} catch (error) {
			this.isScanning = false;
			throw new Error(`Failed to start NFC reading: ${error}`);
		}
	}

	/**
	 * Stop scanning for NFC tags
	 */
	stopScan(): void {
		this.reader = null;
		this.isScanning = false;
	}

	/**
	 * Scan for a single NFC tag (Promise-based)
	 */
	async scanOnce(options?: NFCScanOptions): Promise<NFCReadingEvent> {
		return new Promise((resolve, reject) => {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => {
				controller.abort();
				reject(new Error('NFC scan timeout'));
			}, 30000); // 30 second timeout

			this.startScan(
				(event) => {
					clearTimeout(timeoutId);
					this.stopScan();
					resolve(event);
				},
				(error) => {
					clearTimeout(timeoutId);
					this.stopScan();
					reject(error);
				},
				{ ...options, signal: controller.signal }
			).catch(reject);
		});
	}

	/**
	 * Extract card ID from URL record (like in your React component)
	 */
	static extractCardIdFromURL(record: NFCRecord): string | null {
		if (record.recordType === 'url' && record.data) {
			const decoder = new TextDecoder();
			const url = decoder.decode(record.data);
			const idMatch = url.match(/id=([^&]+)/);
			return idMatch?.[1] || null;
		}
		return null;
	}

	/**
	 * Scan for card ID specifically (matching your React component logic)
	 */
	async scanForCardId(options?: NFCScanOptions): Promise<string> {
		const event = await this.scanOnce(options);

		if (event.records.length === 0) {
			throw new Error('No NFC records found');
		}

		const record = event.records[0];
		const cardId = WebNFCUtils.extractCardIdFromURL(record);

		if (!cardId) {
			throw new Error('Invalid card data - no ID found in URL');
		}

		return cardId;
	}

	/**
	 * Write text to an NFC tag
	 */
	async writeText(text: string, options?: NFCWriteOptions): Promise<void> {
		if (!WebNFCUtils.isNFCSupported()) {
			throw new Error('Web NFC is not supported in this browser');
		}

		try {
			this.writer = new NDEFWriter();
			await this.writer.write(
				{
					records: [{ recordType: 'text', data: text }],
				},
				options
			);
		} catch (error) {
			throw new Error(`Failed to write NFC tag: ${error}`);
		}
	}

	/**
	 * Write URL to an NFC tag
	 */
	async writeURL(url: string, options?: NFCWriteOptions): Promise<void> {
		if (!WebNFCUtils.isNFCSupported()) {
			throw new Error('Web NFC is not supported in this browser');
		}

		try {
			this.writer = new NDEFWriter();
			await this.writer.write(
				{
					records: [{ recordType: 'url', data: url }],
				},
				options
			);
		} catch (error) {
			throw new Error(`Failed to write NFC tag: ${error}`);
		}
	}

	/**
	 * Write custom NDEF message to an NFC tag
	 */
	async writeNDEF(records: any[], options?: NFCWriteOptions): Promise<void> {
		if (!WebNFCUtils.isNFCSupported()) {
			throw new Error('Web NFC is not supported in this browser');
		}

		try {
			this.writer = new NDEFWriter();
			await this.writer.write({ records }, options);
		} catch (error) {
			throw new Error(`Failed to write NFC tag: ${error}`);
		}
	}

	/**
	 * Read text data from NFC record
	 */
	static readTextFromRecord(record: NFCRecord): string | null {
		if (record.recordType === 'text' && record.data) {
			const decoder = new TextDecoder(record.encoding || 'utf-8');
			return decoder.decode(record.data);
		}
		return null;
	}

	/**
	 * Read URL from NFC record
	 */
	static readURLFromRecord(record: NFCRecord): string | null {
		if (record.recordType === 'url' && record.data) {
			const decoder = new TextDecoder();
			return decoder.decode(record.data);
		}
		return null;
	}
}

// Type declarations for Web NFC API
declare global {
	interface Window {
		NDEFReader: any;
		NDEFWriter: any;
	}

	class NDEFReader {
		constructor();
		scan(options?: { signal?: AbortSignal }): Promise<void>;
		addEventListener(type: string, listener: EventListener): void;
		removeEventListener(type: string, listener: EventListener): void;
	}

	class NDEFWriter {
		constructor();
		write(
			message: { records: any[] },
			options?: { overwrite?: boolean; signal?: AbortSignal }
		): Promise<void>;
	}
}

// Export singleton instance
export const nfcUtils = new WebNFCUtils();
