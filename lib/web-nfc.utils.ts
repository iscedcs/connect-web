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

export class WebNFCUtils {
	private reader: NDEFReader | null = null;
	private writer: NDEFWriter | null = null;

	/**
	 * Check if Web NFC is supported in the current browser
	 */
	static isNFCSupported(): boolean {
		return 'NDEFReader' in window && 'NDEFWriter' in window;
	}

	/**
	 * Check if the device has NFC capability
	 */
	static async hasNFCCapability(): Promise<boolean> {
		if (!this.isNFCSupported()) {
			return false;
		}

		try {
			// Try to create an NDEFReader to test NFC availability
			const reader = new NDEFReader();
			return true;
		} catch (error) {
			console.warn('NFC capability check failed:', error);
			return false;
		}
	}

	/**
	 * Request NFC permissions
	 */
	async requestPermissions(): Promise<boolean> {
		try {
			if ('permissions' in navigator) {
				const permission = await navigator.permissions.query({
					name: 'nfc' as any,
				});
				return permission.state === 'granted';
			}
			return true;
		} catch (error) {
			console.warn('Permission request failed:', error);
			return false;
		}
	}

	/**
	 * Start scanning for NFC tags
	 */
	async startReading(signal?: AbortSignal): Promise<void> {
		if (!WebNFCUtils.isNFCSupported()) {
			throw new Error('Web NFC is not supported in this browser');
		}

		try {
			this.reader = new NDEFReader();
			await this.reader.scan({ signal });
		} catch (error) {
			throw new Error(`Failed to start NFC reading: ${error}`);
		}
	}

	/**
	 * Stop scanning for NFC tags
	 */
	stopReading(): void {
		this.reader = null;
	}

	/**
	 * Listen for NFC reading events
	 */
	onReading(callback: (event: NFCReadingEvent) => void): void {
		if (!this.reader) {
			throw new Error(
				'NFC reader not initialized. Call startReading() first.'
			);
		}

		this.reader.addEventListener('reading', (event: any) => {
			const nfcEvent: NFCReadingEvent = {
				serialNumber: event.serialNumber,
				records: event.message.records.map((record: any) => ({
					recordType: record.recordType,
					mediaType: record.mediaType,
					id: record.id,
					data: record.data,
					encoding: record.encoding,
					lang: record.lang,
				})),
			};
			callback(nfcEvent);
		});
	}

	/**
	 * Listen for NFC reading errors
	 */
	onReadingError(callback: (error: Error) => void): void {
		if (!this.reader) {
			throw new Error(
				'NFC reader not initialized. Call startReading() first.'
			);
		}

		this.reader.addEventListener('readingerror', (event: any) => {
			callback(new Error(event.error || 'Unknown NFC reading error'));
		});
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

// Type declarations for Web NFC API (if not available globally)
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
