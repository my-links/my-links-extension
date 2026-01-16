import type {
	AddLinkRequest,
	ApiResponse,
	CreateCollectionRequest,
	MyLinksCollection,
	MyLinksLink,
	TokenCheckResponse,
	UpdateCollectionRequest,
} from '../types';

export class ApiError extends Error {
	constructor(
		message: string,
		public status?: number,
		public code?: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export class MyLinksAPI {
	private baseUrl: string;
	private apiKey: string;

	constructor(baseUrl: string, apiKey: string) {
		this.baseUrl = this.normalizeUrl(baseUrl);
		this.apiKey = apiKey;
	}

	private normalizeUrl(url: string): string {
		return url.replace(/\/$/, '');
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${this.baseUrl}/api/v1${endpoint}`;

		const defaultHeaders = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.apiKey}`,
		};

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					...defaultHeaders,
					...options.headers,
				},
			});

			if (!response.ok) {
				throw new ApiError(
					`HTTP error! status: ${response.status}`,
					response.status
				);
			}

			const data = await response.json();
			return {
				data,
				success: true,
			};
		} catch (error) {
			console.error('API request failed:', error);

			if (error instanceof ApiError) {
				return {
					data: null as T,
					success: false,
					message: error.message,
				};
			}

			return {
				data: null as T,
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async checkToken(): Promise<TokenCheckResponse> {
		const response = await this.request<{ valid: boolean }>('/tokens/check');

		if (!response.success) {
			return { valid: false, message: response.message };
		}

		return { valid: true };
	}

	async getCollections(): Promise<ApiResponse<MyLinksCollection[]>> {
		return this.request<MyLinksCollection[]>('/collections');
	}

	async createCollection(
		collection: CreateCollectionRequest
	): Promise<ApiResponse<MyLinksCollection>> {
		return this.request<MyLinksCollection>('/collections', {
			method: 'POST',
			body: JSON.stringify(collection),
		});
	}

	async updateCollection(
		id: string,
		collection: UpdateCollectionRequest
	): Promise<ApiResponse<MyLinksCollection>> {
		return this.request<MyLinksCollection>(`/collections/${id}`, {
			method: 'PUT',
			body: JSON.stringify(collection),
		});
	}

	async deleteCollection(id: string): Promise<ApiResponse<void>> {
		return this.request<void>(`/collections/${id}`, {
			method: 'DELETE',
		});
	}

	async addLink(link: AddLinkRequest): Promise<ApiResponse<MyLinksLink>> {
		console.log('Adding link:', link);
		return this.request<MyLinksLink>('/links', {
			method: 'POST',
			body: JSON.stringify(link),
		});
	}

	// Utility method to validate API configuration
	validateConfig(): boolean {
		return !!(this.baseUrl && this.apiKey);
	}
}
