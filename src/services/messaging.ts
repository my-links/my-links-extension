import type {
  AddLinkRequest,
  CreateCollectionRequest,
  ExtensionSettings,
  Message,
  UpdateCollectionRequest,
} from "../types";

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class MessagingService {
  static async sendMessage<T = any>(
    message: Message
  ): Promise<MessageResponse<T>> {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response || { success: false, error: "No response received" };
    } catch (error) {
      console.error("Failed to send message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Convenience methods for common message types
  static async initializeExtension(): Promise<MessageResponse> {
    return this.sendMessage({ type: "INITIALIZE_EXTENSION" });
  }

  static async syncCollections(): Promise<MessageResponse> {
    return this.sendMessage({ type: "SYNC_COLLECTIONS" });
  }

  static async getCollections(): Promise<MessageResponse> {
    return this.sendMessage({ type: "GET_COLLECTIONS" });
  }

  static async getSettings(): Promise<MessageResponse> {
    return this.sendMessage({ type: "GET_SETTINGS" });
  }

  static async updateSettings(
    settings: Partial<ExtensionSettings>
  ): Promise<MessageResponse> {
    return this.sendMessage({
      type: "UPDATE_SETTINGS",
      settings,
    });
  }

  static async addLinkToCollection(
    collectionId: string,
    link: AddLinkRequest
  ): Promise<MessageResponse> {
    return this.sendMessage({
      type: "ADD_LINK_TO_COLLECTION",
      collectionId,
      link,
    });
  }

  static async createCollection(
    collection: CreateCollectionRequest
  ): Promise<MessageResponse> {
    return this.sendMessage({
      type: "CREATE_COLLECTION",
      collection,
    });
  }

  static async updateCollection(
    collection: UpdateCollectionRequest
  ): Promise<MessageResponse> {
    return this.sendMessage({
      type: "UPDATE_COLLECTION",
      id: collection.id,
      collection,
    });
  }

  static async deleteCollection(id: string): Promise<MessageResponse> {
    return this.sendMessage({
      type: "DELETE_COLLECTION",
      id,
    });
  }

  static async resetExtension(): Promise<MessageResponse> {
    return this.sendMessage({ type: "RESET_EXTENSION" });
  }

  // Utility method to validate message responses
  static validateResponse<T>(
    response: MessageResponse<T>,
    operation: string
  ): T {
    if (!response.success) {
      throw new Error(response.error || `Failed to ${operation}`);
    }

    if (response.data === undefined) {
      throw new Error(`No data received for ${operation}`);
    }

    return response.data;
  }
}
