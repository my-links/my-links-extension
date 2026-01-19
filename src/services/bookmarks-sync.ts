import type { MyLinksCollection, MyLinksLink } from '../types';
import { logger } from './logger';

export class BookmarksSyncService {
	private static readonly BACKUP_FOLDER_NAME = 'Backup Favorites';
	private static readonly COLLECTION_PREFIX = '📁 ';
	private static readonly FAVORITES_FOLDER_NAME_EN = 'Favorites';
	private static readonly FAVORITES_FOLDER_NAME_FR = 'Favoris';
	private static readonly FAVORITES_STAR = '⭐';

	/**
	 * Get the bookmark bar folder ID dynamically (works for both Chrome and Firefox)
	 */
	private static async getBookmarkBarFolderId(): Promise<string> {
		const tree = await chrome.bookmarks.getTree();
		if (!tree || tree.length === 0) {
			throw new Error('Unable to access bookmarks tree');
		}
		const root = tree[0];
		if (!root || !root.children || root.children.length === 0) {
			throw new Error('Bookmarks tree root has no children');
		}

		// Log available folders for debugging
		logger.debug(
			`Available bookmark folders: ${root.children.map((c) => `${c.id}:${c.title}`).join(', ')}`,
			'BOOKMARKS_SYNC'
		);

		// Exclude menu bookmarks folder (not the toolbar)
		const menuBookmarksNames = [
			'Menu des marque-pages',
			'Bookmarks Menu',
			'Bookmark Menu',
			'menu________',
		];

		// Try multiple ways to find the bookmark bar
		// 1. By ID '1' (Chrome)
		// 2. By common English names
		// 3. By common French names
		// 4. By Firefox internal ID pattern (ends with 'toolbar_____')
		// 5. Exclude menu bookmarks explicitly
		let bookmarkBar = root.children.find(
			(child) =>
				child.id === '1' ||
				child.title === 'Bookmarks Toolbar' ||
				child.title === 'Bookmark Toolbar' ||
				child.title === 'Barre de favoris' ||
				child.id === 'toolbar_____' ||
				(child.id && child.id.endsWith('toolbar_____'))
		);

		// If not found, try to find by excluding menu bookmarks
		if (!bookmarkBar) {
			bookmarkBar = root.children.find(
				(child) => !menuBookmarksNames.includes(child.title || '')
			);
		}

		// Last resort: use first child that is not menu bookmarks
		if (!bookmarkBar) {
			bookmarkBar = root.children[0];
		}

		if (!bookmarkBar || !bookmarkBar.id) {
			throw new Error(
				`Bookmark bar folder not found. Available folders: ${root.children.map((c) => c.title).join(', ')}`
			);
		}

		logger.debug(
			`Found bookmark bar folder: ${bookmarkBar.id} - ${bookmarkBar.title}`,
			'BOOKMARKS_SYNC'
		);

		return bookmarkBar.id;
	}

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

			// Find backup folder if it exists (don't create it here - it should only be created during initialization if needed)
			const backupFolder = this.findBackupFolder(bookmarks);
			logger.info(
				`Backup folder found: ${backupFolder ? 'yes' : 'no'}`,
				'BOOKMARKS_SYNC'
			);

			const bookmarkBarId = await this.getBookmarkBarFolderId();

			// Remove existing collection folders and favorites from bookmark bar
			await this.cleanupCollectionFolders(bookmarkBarId, collections);
			await this.cleanupFavorites(bookmarkBarId);

			// Sync favorites first (before collections)
			if (favorites.length > 0) {
				await this.createFavoritesFolder(favorites, bookmarkBarId);
			}

			// Create collection folders and add links in bookmark bar
			for (const collection of collections) {
				await this.createCollectionFolder(collection, bookmarkBarId);
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

			const bookmarkBarId = await this.getBookmarkBarFolderId();

			// Find or create collection folder in bookmark bar
			const collectionFolder = await this.findOrCreateCollectionFolder(
				collectionName,
				bookmarkBarId
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

			const bookmarkBarId = await this.getBookmarkBarFolderId();

			// Find collection folder in bookmark bar
			const collectionFolder = await this.findCollectionFolder(
				collectionName,
				bookmarkBarId
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

			const bookmarkBarId = await this.getBookmarkBarFolderId();

			// Find collection folder in bookmark bar
			const collectionFolder = await this.findCollectionFolder(
				collectionName,
				bookmarkBarId
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

			const bookmarkBarId = await this.getBookmarkBarFolderId();
			const collectionFolder = await this.findCollectionFolder(
				collectionName,
				bookmarkBarId
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
