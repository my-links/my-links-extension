const BOOKMARK_BAR_FOLDER_ID = '1';
const OTHER_BOOKMARKS_FOLDER_ID = '2';

export class BookmarksService {
	private static readonly BACKUP_FOLDER_NAME = 'Backup Favorites';

	static async backupBookmarks(): Promise<void> {
		try {
			// Get all bookmarks from the bookmark bar
			const bookmarkBar = await chrome.bookmarks.getChildren(
				BOOKMARK_BAR_FOLDER_ID
			);

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
				parentId: OTHER_BOOKMARKS_FOLDER_ID,
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
			const bookmarkBar = await chrome.bookmarks.getChildren(
				BOOKMARK_BAR_FOLDER_ID
			);
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
			const bookmarkBar = await chrome.bookmarks.getChildren(
				BOOKMARK_BAR_FOLDER_ID
			);
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
		parentId: string = BOOKMARK_BAR_FOLDER_ID
	): Promise<chrome.bookmarks.BookmarkTreeNode> {
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
			const bookmarkBar = await chrome.bookmarks.getChildren(
				BOOKMARK_BAR_FOLDER_ID
			);

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

			for (const bookmark of backupFolder.children) {
				await this.restoreBookmarkRecursive(bookmark, BOOKMARK_BAR_FOLDER_ID);
			}

			await chrome.bookmarks.removeTree(backupFolder.id);

			console.log('Bookmarks restored successfully');
		} catch (error) {
			console.error('Failed to restore bookmarks:', error);
			throw error;
		}
	}
}
