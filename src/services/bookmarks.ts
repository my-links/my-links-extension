export class BookmarksService {
	private static readonly BACKUP_FOLDER_NAME = 'Backup Favorites';

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

		return bookmarkBar.id;
	}

	/**
	 * Get the backup folder parent ID (Other Bookmarks for Chrome, Menu des marque-pages for Firefox)
	 */
	private static async getOtherBookmarksFolderId(): Promise<string> {
		const tree = await chrome.bookmarks.getTree();
		if (!tree || tree.length === 0) {
			throw new Error('Unable to access bookmarks tree');
		}
		const root = tree[0];
		if (!root || !root.children || root.children.length === 0) {
			throw new Error('Bookmarks tree root has no children');
		}

		// On Firefox, prefer "Menu des marque-pages" / "Bookmarks Menu"
		// On Chrome, use "Other Bookmarks"
		const menuBookmarksNames = [
			'Menu des marque-pages',
			'Bookmarks Menu',
			'Bookmark Menu',
			'menu________',
		];

		// First try to find menu bookmarks (Firefox)
		let otherBookmarks = root.children.find(
			(child) =>
				menuBookmarksNames.includes(child.title || '') ||
				(child.id && child.id.endsWith('menu________'))
		);

		// If not found, try Chrome's "Other Bookmarks"
		if (!otherBookmarks) {
			otherBookmarks = root.children.find(
				(child) =>
					child.id === '2' ||
					child.title === 'Other Bookmarks' ||
					child.title === 'Autres favoris' ||
					child.title === 'unfiled_____'
			);
		}

		// Fallback to second child if available
		if (!otherBookmarks && root.children.length > 1) {
			otherBookmarks = root.children[1];
		}

		// Last resort: use first child
		if (!otherBookmarks) {
			otherBookmarks = root.children[0];
		}

		if (!otherBookmarks || !otherBookmarks.id) {
			throw new Error(
				`Backup folder parent not found. Available folders: ${root.children.map((c) => c.title).join(', ')}`
			);
		}

		return otherBookmarks.id;
	}

	static async backupBookmarks(): Promise<void> {
		try {
			const bookmarkBarId = await this.getBookmarkBarFolderId();
			const otherBookmarksId = await this.getOtherBookmarksFolderId();

			// Get all bookmarks from the bookmark bar
			const bookmarkBar = await chrome.bookmarks.getChildren(bookmarkBarId);

			// Check if there are any bookmarks or folders to backup (excluding the backup folder itself)
			const itemsToBackup = bookmarkBar.filter(
				(bookmark: any) => bookmark.title !== this.BACKUP_FOLDER_NAME
			);

			if (itemsToBackup.length === 0) {
				console.log('No bookmarks or folders to backup');
				return;
			}

			// Create backup folder
			const backupFolder = await chrome.bookmarks.create({
				parentId: otherBookmarksId,
				title: this.BACKUP_FOLDER_NAME,
			});

			// Move all bookmarks and folders to backup folder
			for (const bookmark of itemsToBackup) {
				await chrome.bookmarks.move(bookmark.id, {
					parentId: backupFolder.id,
				});
			}

			console.log(`Backed up ${itemsToBackup.length} items successfully`);
		} catch (error) {
			console.error('Failed to backup bookmarks:', error);
			throw error;
		}
	}

	static async hasBookmarksToBackup(): Promise<boolean> {
		try {
			const bookmarkBarId = await this.getBookmarkBarFolderId();
			const bookmarkBar = await chrome.bookmarks.getChildren(bookmarkBarId);
			const itemsToBackup = bookmarkBar.filter(
				(bookmark: any) => bookmark.title !== this.BACKUP_FOLDER_NAME
			);
			return itemsToBackup.length > 0;
		} catch (error) {
			console.error('Failed to check if bookmarks exist:', error);
			return false;
		}
	}

	static async getBookmarkBarItems(): Promise<
		chrome.bookmarks.BookmarkTreeNode[]
	> {
		try {
			const bookmarkBarId = await this.getBookmarkBarFolderId();
			const bookmarkBar = await chrome.bookmarks.getChildren(bookmarkBarId);
			return bookmarkBar.filter(
				(bookmark: any) => bookmark.title !== this.BACKUP_FOLDER_NAME
			);
		} catch (error) {
			console.error('Failed to get bookmark bar items:', error);
			return [];
		}
	}

	static async addToBookmarkBar(
		title: string,
		url: string,
		parentId?: string
	): Promise<chrome.bookmarks.BookmarkTreeNode> {
		if (!parentId) {
			parentId = await this.getBookmarkBarFolderId();
		}
		try {
			return await chrome.bookmarks.create({
				parentId,
				title,
				url,
			});
		} catch (error) {
			console.error('Failed to add bookmark:', error);
			throw error;
		}
	}

	static async removeFromBookmarkBar(bookmarkId: string): Promise<void> {
		try {
			await chrome.bookmarks.remove(bookmarkId);
		} catch (error) {
			console.error('Failed to remove bookmark:', error);
			throw error;
		}
	}

	static async updateBookmark(
		bookmarkId: string,
		changes: { title?: string; url?: string }
	): Promise<chrome.bookmarks.BookmarkTreeNode> {
		try {
			return await chrome.bookmarks.update(bookmarkId, changes);
		} catch (error) {
			console.error('Failed to update bookmark:', error);
			throw error;
		}
	}

	static async clearBookmarkBar(): Promise<void> {
		try {
			const bookmarkBarId = await this.getBookmarkBarFolderId();
			const bookmarkBar = await chrome.bookmarks.getChildren(bookmarkBarId);

			if (!bookmarkBar || bookmarkBar.length === 0) {
				console.log('Bookmark bar is already empty');
				return;
			}

			for (const bookmark of bookmarkBar) {
				await chrome.bookmarks.removeTree(bookmark.id);
			}

			console.log('Bookmark bar cleared successfully');
		} catch (error) {
			console.error('Failed to clear bookmark bar:', error);
			throw error;
		}
	}

	private static findBackupFolder(
		bookmarks: chrome.bookmarks.BookmarkTreeNode[]
	): chrome.bookmarks.BookmarkTreeNode | null {
		for (const bookmark of bookmarks) {
			if (bookmark.title === this.BACKUP_FOLDER_NAME) {
				return bookmark;
			}
			if (bookmark.children) {
				const found = this.findBackupFolder(bookmark.children);
				if (found) return found;
			}
		}
		return null;
	}

	private static async restoreBookmarkRecursive(
		bookmark: chrome.bookmarks.BookmarkTreeNode,
		parentId: string
	): Promise<void> {
		if (bookmark.url) {
			await chrome.bookmarks.create({
				parentId,
				title: bookmark.title,
				url: bookmark.url,
			});
		} else if (bookmark.children) {
			const folder = await chrome.bookmarks.create({
				parentId,
				title: bookmark.title,
			});

			for (const child of bookmark.children) {
				await this.restoreBookmarkRecursive(child, folder.id);
			}
		}
	}

	static async restoreBookmarks(): Promise<void> {
		try {
			const bookmarks = await chrome.bookmarks.getTree();
			const backupFolder = this.findBackupFolder(bookmarks);

			if (!backupFolder) {
				console.log('No backup folder found, nothing to restore');
				return;
			}

			if (!backupFolder.children || backupFolder.children.length === 0) {
				console.log('Backup folder is empty, nothing to restore');
				return;
			}

			const bookmarkBarId = await this.getBookmarkBarFolderId();
			for (const bookmark of backupFolder.children) {
				await this.restoreBookmarkRecursive(bookmark, bookmarkBarId);
			}

			await chrome.bookmarks.removeTree(backupFolder.id);

			console.log('Bookmarks restored successfully');
		} catch (error) {
			console.error('Failed to restore bookmarks:', error);
			throw error;
		}
	}
}
