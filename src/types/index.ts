// Core domain types

export const Visibility = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;
export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export type MyLinksCollection = {
  id: string;
  name: string;
  description?: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  links: MyLinksLink[];
};

export type MyLinksLink = {
  id: string;
  name: string;
  url: string;
  favorite: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  collectionId: string;
};

// Settings and configuration
export interface ExtensionSettings {
  mylinksUrl: string;
  apiKey: string;
  isInitialized: boolean;
  lastSync: string;
}

// Storage types
export interface StorageData {
  settings: ExtensionSettings;
  collections: MyLinksCollection[];
  cache: CacheData;
}

export interface CacheData {
  collections: MyLinksCollection[];
  lastSync: string;
}

// API types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface TokenCheckResponse {
  valid: boolean;
  message?: string;
}

// Request types
export type CreateCollectionRequest = Omit<
  MyLinksCollection,
  "id" | "createdAt" | "updatedAt" | "links"
>;

export type UpdateCollectionRequest = Omit<
  MyLinksCollection,
  "createdAt" | "updatedAt" | "links"
>;

export type AddLinkRequest = Omit<
  MyLinksLink,
  "id" | "createdAt" | "updatedAt"
>;

// Context menu types
export interface ContextMenuInfo {
  pageUrl: string;
  pageTitle: string;
  selectionText?: string;
}

// Message types for background communication
export type MessageType =
  | "INITIALIZE_EXTENSION"
  | "SYNC_COLLECTIONS"
  | "ADD_LINK_TO_COLLECTION"
  | "CREATE_COLLECTION"
  | "UPDATE_COLLECTION"
  | "DELETE_COLLECTION"
  | "GET_COLLECTIONS"
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS"
  | "RESET_EXTENSION";

export interface Message {
  type: MessageType;
  [key: string]: any;
}

// UI state types
export interface PopupState {
  settings: ExtensionSettings | null;
  collections: MyLinksCollection[];
  loading: boolean;
  error: string | null;
  pendingLink: PendingLink | null;
}

export interface PendingLink {
  url: string;
  name: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: number;
}
