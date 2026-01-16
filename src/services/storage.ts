import type {
	CacheData,
	ExtensionSettings,
	MyLinksCollection,
	StorageData,
} from '../types';

export class StorageError extends Error {
	constructor(
		message: string,
		public code?: string
	) {
		super(message);
		this.name = 'StorageError';
	}
}

export class StorageService {
	private static readonly STORAGE_KEY = 'mylinks_extension_data';

	static async getStorageData(): Promise<StorageData> {
		try {
			const result = await chrome.storage.local.get(this.STORAGE_KEY);
			const data = result[this.STORAGE_KEY];

			if (!data) {
				return this.getDefaultStorageData();
			}

			return this.fixDataStructure(data);
		} catch (error) {
			console.error('Failed to get storage data:', error);
			throw new StorageError(
				error instanceof Error ? error.message : 'Failed to get storage data'
			);
		}
	}

	static async setStorageData(data: Partial<StorageData>): Promise<void> {
		try {
			const currentData = await this.getStorageData();
			const newData = { ...currentData, ...data };

			await chrome.storage.local.set({
				[this.STORAGE_KEY]: newData,
			});
		} catch (error) {
			console.error('Failed to set storage data:', error);
			throw new StorageError(
				error instanceof Error ? error.message : 'Failed to set storage data'
			);
		}
	}

	static async getSettings(): Promise<ExtensionSettings> {
		const data = await this.getStorageData();
		return data.settings;
	}

	static async setSettings(
		settings: Partial<ExtensionSettings>
	): Promise<void> {
		const currentData = await this.getStorageData();
		const cleanedSettings = this.cleanSettings(settings);
		const newSettings = { ...currentData.settings, ...cleanedSettings };

		await this.setStorageData({
			settings: newSettings,
		});
	}

	static async getCollections(): Promise<MyLinksCollection[]> {
		const data = await this.getStorageData();
		return data.collections;
	}

	static async setCollections(collections: MyLinksCollection[]): Promise<void> {
		await this.setStorageData({ collections });
	}

	static async updateCache(collections: MyLinksCollection[]): Promise<void> {
		const cacheData: CacheData = {
			collections,
			lastSync: new Date().toISOString(),
		};

		await this.setStorageData({
			cache: cacheData,
		});
	}

	static async getCache(): Promise<CacheData> {
		const data = await this.getStorageData();
		return data.cache;
	}

	static async clearStorage(): Promise<void> {
		try {
			await chrome.storage.local.remove(this.STORAGE_KEY);
		} catch (error) {
			console.error('Failed to clear storage:', error);
			throw new StorageError(
				error instanceof Error ? error.message : 'Failed to clear storage'
			);
		}
	}

	static async getPendingLink(): Promise<{
		url: string;
		name: string;
	} | null> {
		try {
			const result = await chrome.storage.local.get('pendingLink');
			return (result.pendingLink as any) || null;
		} catch (error) {
			console.error('Failed to get pending link:', error);
			return null;
		}
	}

	static async setPendingLink(link: {
		url: string;
		name: string;
	}): Promise<void> {
		try {
			await chrome.storage.local.set({ pendingLink: link });
		} catch (error) {
			console.error('Failed to set pending link:', error);
			throw new StorageError(
				error instanceof Error ? error.message : 'Failed to set pending link'
			);
		}
	}

	static async removePendingLink(): Promise<void> {
		try {
			await chrome.storage.local.remove('pendingLink');
		} catch (error) {
			console.error('Failed to remove pending link:', error);
		}
	}

	private static cleanSettings(
		settings: Partial<ExtensionSettings>
	): Partial<ExtensionSettings> {
		const cleaned = { ...settings };

		if (cleaned.mylinksUrl) {
			cleaned.mylinksUrl = cleaned.mylinksUrl.replace(/\/$/, '');
		}

		return cleaned;
	}

	private static fixDataStructure(data: any): StorageData {
		const collections = this.extractCollections(data.collections);
		const cache = this.extractCache(data.cache);
		const settings = this.extractSettings(data.settings);

		return {
			settings,
			collections,
			cache,
		};
	}

	private static extractCollections(data: any): MyLinksCollection[] {
		if (!data) return [];

		if (Array.isArray(data)) {
			return data;
		}

		if (data.collections && Array.isArray(data.collections)) {
			return data.collections;
		}

		return [];
	}

	private static extractCache(data: any): CacheData {
		const defaultCache: CacheData = {
			collections: [],
			lastSync: '',
		};

		if (!data) return defaultCache;

		let collections: MyLinksCollection[] = [];
		if (data.collections && Array.isArray(data.collections)) {
			collections = data.collections;
		} else if (
			data.collections?.collections &&
			Array.isArray(data.collections.collections)
		) {
			collections = data.collections.collections;
		}

		return {
			collections,
			lastSync: data.lastSync || defaultCache.lastSync,
		};
	}

	private static extractSettings(data: any): ExtensionSettings {
		const defaultSettings = this.getDefaultStorageData().settings;

		if (!data) return defaultSettings;

		const settings = { ...defaultSettings, ...data };

		if (settings.mylinksUrl) {
			settings.mylinksUrl = settings.mylinksUrl.replace(/\/$/, '');
		}

		return settings;
	}

	private static getDefaultStorageData(): StorageData {
		return {
			settings: {
				mylinksUrl: 'https://www.mylinks.app',
				apiKey: '',
				isInitialized: false,
				lastSync: '',
			},
			collections: [],
			cache: {
				collections: [],
				lastSync: '',
			},
		};
	}
}
