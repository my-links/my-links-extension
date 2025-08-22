import { MessagingService } from "@/services/messaging";
import { NotificationService } from "@/services/notifications";
import { StorageService } from "@/services/storage";
import type {
  AddLinkRequest,
  CreateCollectionRequest,
  ExtensionSettings,
  MyLinksCollection,
  PendingLink,
  PopupState,
  UpdateCollectionRequest,
} from "@/types";
import { useState } from "react";

export function usePopupState() {
  const [state, setState] = useState<PopupState>({
    settings: null,
    collections: [],
    loading: true,
    error: null,
    pendingLink: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  };

  const setSettings = (settings: ExtensionSettings | null) => {
    setState((prev) => ({ ...prev, settings }));
  };

  const setCollections = (collections: MyLinksCollection[]) => {
    setState((prev) => ({ ...prev, collections }));
  };

  const setPendingLink = (pendingLink: PendingLink | null) => {
    setState((prev) => ({ ...prev, pendingLink }));
  };

  const initializePopup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get settings
      const settingsResponse = await MessagingService.getSettings();
      if (settingsResponse.success) {
        setSettings(settingsResponse.data);
      }

      // Check for pending link
      const pendingLink = await StorageService.getPendingLink();
      if (pendingLink) {
        setPendingLink(pendingLink);
        await StorageService.removePendingLink();
      }

      // Get collections if initialized
      if (settingsResponse.success && settingsResponse.data?.isInitialized) {
        const collectionsResponse = await MessagingService.getCollections();
        if (collectionsResponse.success) {
          setCollections(collectionsResponse.data);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize popup";
      setError(errorMessage);
      await NotificationService.showInitializationError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setLoading(true);
      const response = await MessagingService.initializeExtension();

      if (response.success) {
        await NotificationService.showBackupCreated();

        // Update settings
        const settingsResponse = await MessagingService.getSettings();
        if (settingsResponse.success) {
          setSettings(settingsResponse.data);
        }
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
        setSettings({ ...state.settings, ...newSettings } as ExtensionSettings);
        await NotificationService.showSettingsUpdated();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update settings";
      await NotificationService.showApiError(errorMessage);
    }
  };

  const handleCollectionsUpdate = async () => {
    try {
      const response = await MessagingService.syncCollections();
      if (response.success) {
        setCollections(response.data);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync collections";
      await NotificationService.showSyncError(errorMessage);
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
        await handleCollectionsUpdate();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add link";
      await NotificationService.showApiError(errorMessage);
    }
  };

  const handleCreateCollection = async (props: CreateCollectionRequest) => {
    try {
      const response = await MessagingService.createCollection(props);

      if (response.success) {
        await NotificationService.showCollectionCreated();
        await handleCollectionsUpdate();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create collection";
      await NotificationService.showApiError(errorMessage);
    }
  };

  const handleUpdateCollection = async (props: UpdateCollectionRequest) => {
    try {
      const response = await MessagingService.updateCollection(props);

      if (response.success) {
        await NotificationService.showCollectionUpdated();
        await handleCollectionsUpdate();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update collection";
      await NotificationService.showApiError(errorMessage);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      const response = await MessagingService.deleteCollection(id);

      if (response.success) {
        await NotificationService.showCollectionDeleted();
        await handleCollectionsUpdate();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete collection";
      await NotificationService.showApiError(errorMessage);
    }
  };

  return {
    ...state,
    initializePopup,
    handleInitialize,
    handleSettingsUpdate,
    handleCollectionsUpdate,
    handleAddLink,
    handleCreateCollection,
    handleUpdateCollection,
    handleDeleteCollection,
    setPendingLink,
  };
}
