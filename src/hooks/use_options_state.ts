import { BookmarksSyncService } from "@/services/bookmarks-sync";
import { MessagingService } from "@/services/messaging";
import { NotificationService } from "@/services/notifications";
import { StorageService } from "@/services/storage";
import type {
  AddLinkRequest,
  ExtensionSettings,
  MyLinksCollection,
  PendingLink,
} from "@/types";
import { useState, useEffect } from "react";

export function useOptionsState() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [collections, setCollections] = useState<MyLinksCollection[]>([]);
  const [pendingLink, setPendingLink] = useState<PendingLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await MessagingService.getSettings();
      if (response.success) {
        setSettings(response.data);
      } else {
        setError("Failed to load settings");
      }

      const pendingLinkData = await StorageService.getPendingLink();
      if (pendingLinkData) {
        setPendingLink(pendingLinkData);
        await StorageService.removePendingLink();
      }

      if (response.success && response.data?.isInitialized) {
        const collectionsResponse = await MessagingService.getCollections();
        if (collectionsResponse.success) {
          setCollections(collectionsResponse.data);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load settings";
      setError(errorMessage);
      await NotificationService.showInitializationError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      const response = await MessagingService.initializeExtension();

      if (response.success) {
        await NotificationService.showBackupCreated();
        await loadSettings();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize";
      await NotificationService.showInitializationError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (
    newSettings: Partial<ExtensionSettings>
  ) => {
    try {
      const response = await MessagingService.updateSettings(newSettings);

      if (response.success) {
        setSettings({ ...settings, ...newSettings } as ExtensionSettings);
        await NotificationService.showSettingsUpdated();
        await loadSettings();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update settings";
      await NotificationService.showApiError(errorMessage);
    }
  };

  const handleAddLink = async (collectionId: string, link: AddLinkRequest) => {
    try {
      const response = await MessagingService.addLinkToCollection(
        collectionId,
        link
      );

      if (response.success) {
        await NotificationService.showLinkAdded();
        setPendingLink(null);

        const collection = collections.find((c) => c.id === collectionId);
        if (collection) {
          await BookmarksSyncService.addLinkToBookmarks(
            {
              id: "",
              name: link.name,
              url: link.url,
              favorite: false,
              description: link.description,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              collectionId: link.collectionId,
            },
            collection.name
          );
        }

        await loadSettings();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add link";
      await NotificationService.showApiError(errorMessage);
    }
  };

  return {
    settings,
    collections,
    pendingLink,
    loading,
    error,
    handleInitialize,
    handleSettingsUpdate,
    handleAddLink,
    setPendingLink,
    reloadSettings: loadSettings,
  };
}
