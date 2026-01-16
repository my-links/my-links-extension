import { AppError } from '@/types';
import { VALIDATION_RULES } from '../config/constants';
import { ErrorHandler } from './error-handler';

export class ValidationService {
	static validateUrl(url: string): boolean {
		if (!url || typeof url !== 'string') {
			return false;
		}

		if (url.length > VALIDATION_RULES.URL.MAX_LENGTH) {
			return false;
		}

		return VALIDATION_RULES.URL.PATTERN.test(url);
	}

	static validateTitle(title: string): boolean {
		if (!title || typeof title !== 'string') {
			return false;
		}

		const trimmedTitle = title.trim();
		return (
			trimmedTitle.length >= VALIDATION_RULES.TITLE.MIN_LENGTH &&
			trimmedTitle.length <= VALIDATION_RULES.TITLE.MAX_LENGTH
		);
	}

	static validateDescription(description?: string): boolean {
		if (!description) {
			return true; // Description is optional
		}

		if (typeof description !== 'string') {
			return false;
		}

		return description.length <= VALIDATION_RULES.DESCRIPTION.MAX_LENGTH;
	}

	static validateCollectionName(name: string): boolean {
		if (!name || typeof name !== 'string') {
			return false;
		}

		const trimmedName = name.trim();
		return (
			trimmedName.length >= VALIDATION_RULES.COLLECTION_NAME.MIN_LENGTH &&
			trimmedName.length <= VALIDATION_RULES.COLLECTION_NAME.MAX_LENGTH
		);
	}

	static validateApiKey(apiKey: string): boolean {
		if (!apiKey || typeof apiKey !== 'string') {
			return false;
		}

		const trimmedApiKey = apiKey.trim();
		return (
			trimmedApiKey.length >= VALIDATION_RULES.API_KEY.MIN_LENGTH &&
			VALIDATION_RULES.API_KEY.PATTERN.test(trimmedApiKey)
		);
	}

	static validateMylinksUrl(url: string): boolean {
		if (!url || typeof url !== 'string') {
			return false;
		}

		const trimmedUrl = url.trim();
		if (!trimmedUrl) {
			return false;
		}

		try {
			const parsedUrl = new URL(trimmedUrl);
			return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
		} catch {
			return false;
		}
	}

	static validateLinkData(data: {
		title: string;
		url: string;
		description?: string;
	}): { isValid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!this.validateTitle(data.title)) {
			errors.push('Invalid title');
		}

		if (!this.validateUrl(data.url)) {
			errors.push('Invalid URL');
		}

		if (!this.validateDescription(data.description)) {
			errors.push('Invalid description');
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	static validateCollectionData(data: { name: string; description?: string }): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (!this.validateCollectionName(data.name)) {
			errors.push('Invalid collection name');
		}

		if (!this.validateDescription(data.description)) {
			errors.push('Invalid description');
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	static validateSettings(data: { mylinksUrl: string; apiKey: string }): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (!this.validateMylinksUrl(data.mylinksUrl)) {
			errors.push('Invalid MyLinks URL');
		}

		if (!this.validateApiKey(data.apiKey)) {
			errors.push('Invalid API key');
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	static sanitizeUrl(url: string): string {
		if (!url) {
			return '';
		}

		let sanitized = url.trim();

		// Remove trailing slash
		sanitized = sanitized.replace(/\/$/, '');

		// Ensure protocol
		if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
			sanitized = 'https://' + sanitized;
		}

		return sanitized;
	}

	static sanitizeText(text: string, maxLength?: number): string {
		if (!text) {
			return '';
		}

		let sanitized = text.trim();

		// Remove excessive whitespace
		sanitized = sanitized.replace(/\s+/g, ' ');

		// Truncate if needed
		if (maxLength && sanitized.length > maxLength) {
			sanitized = sanitized.substring(0, maxLength);
		}

		return sanitized;
	}

	static createValidationError(message: string): AppError {
		return ErrorHandler.createValidationError(message);
	}
}
