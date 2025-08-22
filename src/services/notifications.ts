import type { Notification } from "../types";

export class NotificationService {
  private static readonly NOTIFICATION_ICON = "public/logo.png";

  static async show(
    title: string,
    message: string,
    type: Notification["type"] = "info"
  ): Promise<void> {
    // Log to console for debugging
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);

    // Show browser notification if available
    if (chrome.notifications) {
      try {
        await chrome.notifications.create({
          type: "basic",
          iconUrl: this.NOTIFICATION_ICON,
          title,
          message,
        });
      } catch (error) {
        console.error("Failed to show browser notification:", error);
      }
    }
  }

  static async showSuccess(title: string, message: string): Promise<void> {
    return this.show(title, message, "success");
  }

  static async showError(title: string, message: string): Promise<void> {
    return this.show(title, message, "error");
  }

  static async showWarning(title: string, message: string): Promise<void> {
    return this.show(title, message, "warning");
  }

  static async showInfo(title: string, message: string): Promise<void> {
    return this.show(title, message, "info");
  }

  // Convenience methods for common notifications
  static async showLinkAdded(): Promise<void> {
    return this.showSuccess(
      chrome.i18n.getMessage("linkAdded") || "Link Added",
      "Link added to collection successfully"
    );
  }

  static async showCollectionCreated(): Promise<void> {
    return this.showSuccess(
      "Collection Created",
      "Collection created successfully"
    );
  }

  static async showCollectionUpdated(): Promise<void> {
    return this.showSuccess(
      "Collection Updated",
      "Collection updated successfully"
    );
  }

  static async showCollectionDeleted(): Promise<void> {
    return this.showSuccess(
      "Collection Deleted",
      "Collection deleted successfully"
    );
  }

  static async showSettingsUpdated(): Promise<void> {
    return this.showSuccess(
      "Settings Updated",
      "Your settings have been saved successfully"
    );
  }

  static async showBackupCreated(): Promise<void> {
    return this.showSuccess(
      chrome.i18n.getMessage("backupCreated") || "Backup Created",
      "Your bookmarks have been backed up successfully"
    );
  }

  static async showNoCollectionsError(): Promise<void> {
    return this.showError(
      chrome.i18n.getMessage("error") || "Error",
      "No collections available. Please create a collection first."
    );
  }

  static async showApiError(error: string): Promise<void> {
    return this.showError(chrome.i18n.getMessage("error") || "Error", error);
  }

  static async showInitializationError(error: string): Promise<void> {
    return this.showError(
      chrome.i18n.getMessage("error") || "Error",
      `Failed to initialize: ${error}`
    );
  }

  static async showSyncError(error: string): Promise<void> {
    return this.showError(
      chrome.i18n.getMessage("error") || "Error",
      `Failed to sync collections: ${error}`
    );
  }
}
