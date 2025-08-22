// Chrome types are available globally in extension context

export class BookmarksService {
  private static readonly BACKUP_FOLDER_NAME = "Backup Favorites";

  static async backupBookmarks(): Promise<void> {
    try {
      // Get all bookmarks from the bookmark bar
      const bookmarkBar = await chrome.bookmarks.getChildren("1");

      // Check if there are any bookmarks or folders to backup (excluding the backup folder itself)
      const itemsToBackup = bookmarkBar.filter(
        (bookmark: any) => bookmark.title !== this.BACKUP_FOLDER_NAME
      );

      if (itemsToBackup.length === 0) {
        console.log("No bookmarks or folders to backup");
        return;
      }

      // Create backup folder
      const backupFolder = await chrome.bookmarks.create({
        parentId: "1", // Bookmark bar
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
      console.error("Failed to backup bookmarks:", error);
      throw error;
    }
  }

  static async getBackupFolder(): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
    try {
      const bookmarkBar = await chrome.bookmarks.getChildren("1");
      return (
        bookmarkBar.find(
          (bookmark: any) =>
            bookmark.title === this.BACKUP_FOLDER_NAME && !bookmark.url
        ) || null
      );
    } catch (error) {
      console.error("Failed to get backup folder:", error);
      return null;
    }
  }

  static async isBackupFolderExists(): Promise<boolean> {
    const backupFolder = await this.getBackupFolder();
    return backupFolder !== null;
  }

  static async hasBookmarksToBackup(): Promise<boolean> {
    try {
      const bookmarkBar = await chrome.bookmarks.getChildren("1");
      const itemsToBackup = bookmarkBar.filter(
        (bookmark: any) => bookmark.title !== this.BACKUP_FOLDER_NAME
      );
      return itemsToBackup.length > 0;
    } catch (error) {
      console.error("Failed to check if bookmarks exist:", error);
      return false;
    }
  }

  static async getBookmarkBarItems(): Promise<
    chrome.bookmarks.BookmarkTreeNode[]
  > {
    try {
      const bookmarkBar = await chrome.bookmarks.getChildren("1");
      return bookmarkBar.filter(
        (bookmark: any) => bookmark.title !== this.BACKUP_FOLDER_NAME
      );
    } catch (error) {
      console.error("Failed to get bookmark bar items:", error);
      return [];
    }
  }

  static async addToBookmarkBar(
    title: string,
    url: string,
    parentId?: string
  ): Promise<chrome.bookmarks.BookmarkTreeNode> {
    try {
      return await chrome.bookmarks.create({
        parentId: parentId || "1", // Default to bookmark bar
        title,
        url,
      });
    } catch (error) {
      console.error("Failed to add bookmark:", error);
      throw error;
    }
  }

  static async removeFromBookmarkBar(bookmarkId: string): Promise<void> {
    try {
      await chrome.bookmarks.remove(bookmarkId);
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
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
      console.error("Failed to update bookmark:", error);
      throw error;
    }
  }
}
