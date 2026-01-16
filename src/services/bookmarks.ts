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
}
