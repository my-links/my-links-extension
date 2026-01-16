import type { MyLinksCollection, MyLinksLink } from '../types';
import { logger } from './logger';

const OTHER_BOOKMARKS_FOLDER_ID = '2';
const BOOKMARK_BAR_FOLDER_ID = '1';

export class BookmarksSyncService {
	private static readonly BACKUP_FOLDER_NAME = 'Backup Favorites';
	private static readonly COLLECTION_PREFIX = '📁 ';
	private static readonly FAVORITES_FOLDER_NAME_EN = 'Favorites';
	private static readonly FAVORITES_FOLDER_NAME_FR = 'Favoris';
	private static readonly FAVORITES_STAR = '⭐';

	/**
	 * Synchronize favorites and collections with browser bookmarks
	 */
	static async syncToBookmarks(
		favorites: MyLinksLink[],
		collections: MyLinksCollection[]
	): Promise<void> {
		try {
			logger.info('Starting bookmarks synchronization', 'BOOKMARKS_SYNC');
			logger.info(
				`Favorites to sync: ${favorites.length}, Collections to sync: ${collections.length}`,
				'BOOKMARKS_SYNC'
			);

			// Get existing bookmarks structure
			const bookmarks = await chrome.bookmarks.getTree();
			logger.info('Retrieved bookmarks tree', 'BOOKMARKS_SYNC');

			let backupFolder = this.findBackupFolder(bookmarks);
			logger.info(
				`Backup folder found: ${backupFolder ? 'yes' : 'no'}`,
				'BOOKMARKS_SYNC'
			);

			if (!backupFolder) {
				logger.warn(
					'Backup folder not found, creating it...',
					'BOOKMARKS_SYNC'
				);

				// Create backup folder if it doesn't exist
				backupFolder = await chrome.bookmarks.create({
					parentId: OTHER_BOOKMARKS_FOLDER_ID,
					title: this.BACKUP_FOLDER_NAME,
				});

				logger.info(
					`Created backup folder: ${backupFolder.title}`,
					'BOOKMARKS_SYNC'
				);
			}

			// Remove existing collection folders and favorites from bookmark bar
			await this.cleanupCollectionFolders(BOOKMARK_BAR_FOLDER_ID, collections);
			await this.cleanupFavorites(BOOKMARK_BAR_FOLDER_ID);

			// Sync favorites first (before collections)
			if (favorites.length > 0) {
				await this.createFavoritesFolder(favorites, BOOKMARK_BAR_FOLDER_ID);
			}

			// Create collection folders and add links in bookmark bar
			for (const collection of collections) {
				await this.createCollectionFolder(collection, BOOKMARK_BAR_FOLDER_ID);
			}

			logger.info(
				`Synchronized ${favorites.length} favorites and ${collections.length} collections`,
				'BOOKMARKS_SYNC'
			);
		} catch (error) {
			logger.error('Failed to sync to bookmarks', 'BOOKMARKS_SYNC', error);
			throw error;
		}
	}

	/**
	 * Synchronize collections with browser bookmarks (legacy method for backward compatibility)
	 */
	static async syncCollectionsToBookmarks(
		collections: MyLinksCollection[]
	): Promise<void> {
		return this.syncToBookmarks([], collections);
	}

	/**
	 * Create a collection folder with its links
	 */
	private static async createCollectionFolder(
		collection: MyLinksCollection,
		parentId: string
	): Promise<void> {
		try {
			logger.info(
				`Creating folder for collection: ${collection.name}`,
				'BOOKMARKS_SYNC'
			);

			const icon = collection.icon || this.COLLECTION_PREFIX.trim();
			const folderTitle = `${icon} ${collection.name}`;

			// Create collection folder
			const folder = await chrome.bookmarks.create({
				parentId,
				title: folderTitle,
				url: undefined,
			});

			logger.info(
				`Created folder: ${folder.title} with ID: ${folder.id}`,
				'BOOKMARKS_SYNC'
			);

			// Add links to the folder
			for (const link of collection.links) {
				const bookmark = await chrome.bookmarks.create({
					parentId: folder.id,
					title: link.name,
					url: link.url,
				});
				logger.debug(`Added link: ${bookmark.title}`, 'BOOKMARKS_SYNC');
			}

			logger.debug(
				`Created folder for collection: ${collection.name}`,
				'BOOKMARKS_SYNC'
			);
		} catch (error) {
			logger.error(
				`Failed to create folder for collection: ${collection.name}`,
				'BOOKMARKS_SYNC',
				error
			);
			throw error;
		}
	}

	/**
	 * Remove existing collection folders (except backup)
	 */
	private static async cleanupCollectionFolders(
		parentId: string,
		collections: MyLinksCollection[]
	): Promise<void> {
		try {
			const children = await chrome.bookmarks.getChildren(parentId);
			const collectionNames = new Set(
				collections.map((c) => c.name.toLowerCase())
			);

			for (const child of children) {
				const title = child.title || '';
				const titleWithoutIcon = title.replace(/^[^\s]+\s?/, '').trim();

				if (
					title.startsWith(this.COLLECTION_PREFIX) ||
					collectionNames.has(titleWithoutIcon.toLowerCase())
				) {
					await chrome.bookmarks.removeTree(child.id);
					logger.debug(
						`Removed existing collection folder: ${child.title}`,
						'BOOKMARKS_SYNC'
					);
				}
			}
		} catch (error) {
			logger.error(
				'Failed to cleanup collection folders',
				'BOOKMARKS_SYNC',
				error
			);
			throw error;
		}
	}

	/**
	 * Remove existing favorites folder
	 */
	private static async cleanupFavorites(parentId: string): Promise<void> {
		try {
			const children = await chrome.bookmarks.getChildren(parentId);

			for (const child of children) {
				const title = child.title || '';
				const favoritesFolderName = this.getFavoritesFolderName();
				if (
					title === this.FAVORITES_FOLDER_NAME_EN ||
					title === this.FAVORITES_FOLDER_NAME_FR ||
					title === favoritesFolderName ||
					title === `${this.FAVORITES_STAR} ${this.FAVORITES_FOLDER_NAME_EN}` ||
					title === `${this.FAVORITES_STAR} ${this.FAVORITES_FOLDER_NAME_FR}`
				) {
					await chrome.bookmarks.removeTree(child.id);
					logger.debug(
						`Removed existing favorites folder: ${child.title}`,
						'BOOKMARKS_SYNC'
					);
				}
			}
		} catch (error) {
			logger.error('Failed to cleanup favorites', 'BOOKMARKS_SYNC', error);
			throw error;
		}
	}

	/**
	 * Get favorites folder name based on UI language
	 */
	private static getFavoritesFolderName(): string {
		const uiLanguage = chrome.i18n.getUILanguage();
		const baseName =
			uiLanguage.startsWith('fr') || uiLanguage.startsWith('FR')
				? this.FAVORITES_FOLDER_NAME_FR
				: this.FAVORITES_FOLDER_NAME_EN;
		return `${this.FAVORITES_STAR} ${baseName}`;
	}

	/**
	 * Create favorites folder with all favorites inside
	 */
	private static async createFavoritesFolder(
		favorites: MyLinksLink[],
		parentId: string
	): Promise<void> {
		try {
			const favoritesFolder = await chrome.bookmarks.create({
				parentId,
				title: this.getFavoritesFolderName(),
			});

			for (const favorite of favorites) {
				await chrome.bookmarks.create({
					parentId: favoritesFolder.id,
					title: favorite.name,
					url: favorite.url,
				});
			}

			logger.info(
				`Created favorites folder with ${favorites.length} favorites`,
				'BOOKMARKS_SYNC'
			);
		} catch (error) {
			logger.error(
				'Failed to create favorites folder',
				'BOOKMARKS_SYNC',
				error
			);
			throw error;
		}
	}

	/**
	 * Find the backup folder in bookmarks tree
	 */
	private static findBackupFolder(
		bookmarks: chrome.bookmarks.BookmarkTreeNode[]
	): chrome.bookmarks.BookmarkTreeNode | null {
		logger.debug(
			`Searching for backup folder: ${this.BACKUP_FOLDER_NAME}`,
			'BOOKMARKS_SYNC'
		);

		for (const bookmark of bookmarks) {
			logger.debug(`Checking bookmark: ${bookmark.title}`, 'BOOKMARKS_SYNC');

			if (bookmark.title === this.BACKUP_FOLDER_NAME) {
				logger.info(`Found backup folder: ${bookmark.title}`, 'BOOKMARKS_SYNC');
				return bookmark;
			}
			if (bookmark.children) {
				const found = this.findBackupFolder(bookmark.children);
				if (found) return found;
			}
		}
		logger.warn(
			`Backup folder not found: ${this.BACKUP_FOLDER_NAME}`,
			'BOOKMARKS_SYNC'
		);
		return null;
	}

	/**
	 * Add a single link to bookmarks
	 */
	static async addLinkToBookmarks(
		link: MyLinksLink,
		collectionName: string
	): Promise<void> {
		try {
			const bookmarks = await chrome.bookmarks.getTree();
			const backupFolder = this.findBackupFolder(bookmarks);

			if (!backupFolder) {
				logger.warn(
					'Backup folder not found, cannot add link',
					'BOOKMARKS_SYNC'
				);
				return;
			}

			// Find or create collection folder in bookmark bar
			const collectionFolder = await this.findOrCreateCollectionFolder(
				collectionName,
				BOOKMARK_BAR_FOLDER_ID
			);

			// Add the link
			await chrome.bookmarks.create({
				parentId: collectionFolder.id,
				title: link.name,
				url: link.url,
			});

			logger.info(`Added link to bookmarks: ${link.name}`, 'BOOKMARKS_SYNC');
		} catch (error) {
			logger.error('Failed to add link to bookmarks', 'BOOKMARKS_SYNC', error);
			throw error;
		}
	}

	/**
	 * Remove a link from bookmarks
	 */
	static async removeLinkFromBookmarks(
		linkId: string,
		collectionName: string
	): Promise<void> {
		try {
			const bookmarks = await chrome.bookmarks.getTree();
			const backupFolder = this.findBackupFolder(bookmarks);

			if (!backupFolder) {
				logger.warn(
					'Backup folder not found, cannot remove link',
					'BOOKMARKS_SYNC'
				);
				return;
			}

			// Find collection folder in bookmark bar
			const collectionFolder = await this.findCollectionFolder(
				collectionName,
				BOOKMARK_BAR_FOLDER_ID
			);

			if (!collectionFolder) {
				logger.warn(
					`Collection folder not found: ${collectionName}`,
					'BOOKMARKS_SYNC'
				);
				return;
			}

			// Find and remove the link
			const children = await chrome.bookmarks.getChildren(collectionFolder.id);
			const linkToRemove = children.find((child) => child.url === linkId);

			if (linkToRemove) {
				await chrome.bookmarks.remove(linkToRemove.id);
				logger.info(
					`Removed link from bookmarks: ${linkToRemove.title}`,
					'BOOKMARKS_SYNC'
				);
			}
		} catch (error) {
			logger.error(
				'Failed to remove link from bookmarks',
				'BOOKMARKS_SYNC',
				error
			);
			throw error;
		}
	}

	/**
	 * Update a link in bookmarks
	 */
	static async updateLinkInBookmarks(
		link: MyLinksLink,
		collectionName: string
	): Promise<void> {
		try {
			const bookmarks = await chrome.bookmarks.getTree();
			const backupFolder = this.findBackupFolder(bookmarks);

			if (!backupFolder) {
				logger.warn(
					'Backup folder not found, cannot update link',
					'BOOKMARKS_SYNC'
				);
				return;
			}

			// Find collection folder in bookmark bar
			const collectionFolder = await this.findCollectionFolder(
				collectionName,
				BOOKMARK_BAR_FOLDER_ID
			);

			if (!collectionFolder) {
				logger.warn(
					`Collection folder not found: ${collectionName}`,
					'BOOKMARKS_SYNC'
				);
				return;
			}

			// Find and update the link
			const children = await chrome.bookmarks.getChildren(collectionFolder.id);
			const linkToUpdate = children.find((child) => child.url === link.url);

			if (linkToUpdate) {
				await chrome.bookmarks.update(linkToUpdate.id, {
					title: link.name,
					url: link.url,
				});
				logger.info(
					`Updated link in bookmarks: ${link.name}`,
					'BOOKMARKS_SYNC'
				);
			}
		} catch (error) {
			logger.error(
				'Failed to update link in bookmarks',
				'BOOKMARKS_SYNC',
				error
			);
			throw error;
		}
	}

	/**
	 * Find or create a collection folder
	 */
	private static async findOrCreateCollectionFolder(
		collectionName: string,
		parentId: string
	): Promise<chrome.bookmarks.BookmarkTreeNode> {
		const existingFolder = await this.findCollectionFolder(
			collectionName,
			parentId
		);

		if (existingFolder) {
			return existingFolder;
		}

		// Create new folder
		return await chrome.bookmarks.create({
			parentId,
			title: `${this.COLLECTION_PREFIX}${collectionName}`,
			url: undefined,
		});
	}

	/**
	 * Find a collection folder by name
	 */
	private static async findCollectionFolder(
		collectionName: string,
		parentId: string
	): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
		const children = await chrome.bookmarks.getChildren(parentId);

		for (const child of children) {
			const title = child.title || '';
			const titleWithoutIcon = title.replace(/^[^\s]+\s?/, '').trim();
			if (titleWithoutIcon === collectionName) {
				return child;
			}
		}

		return null;
	}

	/**
	 * Remove a collection folder from bookmarks
	 */
	static async removeCollectionFromBookmarks(
		collectionName: string
	): Promise<void> {
		try {
			const bookmarks = await chrome.bookmarks.getTree();
			const backupFolder = this.findBackupFolder(bookmarks);

			if (!backupFolder) {
				logger.warn(
					'Backup folder not found, cannot remove collection',
					'BOOKMARKS_SYNC'
				);
				return;
			}

			const collectionFolder = await this.findCollectionFolder(
				collectionName,
				BOOKMARK_BAR_FOLDER_ID
			);

			if (collectionFolder) {
				await chrome.bookmarks.removeTree(collectionFolder.id);
				logger.info(
					`Removed collection from bookmarks: ${collectionName}`,
					'BOOKMARKS_SYNC'
				);
			}
		} catch (error) {
			logger.error(
				'Failed to remove collection from bookmarks',
				'BOOKMARKS_SYNC',
				error
			);
			throw error;
		}
	}
}
