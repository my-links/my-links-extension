// API Configuration
export const API_CONFIG = {
	BASE_URL: 'https://www.mylinks.app',
	API_VERSION: 'v1',
	ENDPOINTS: {
		TOKENS: '/tokens/check',
		COLLECTIONS: '/collections',
		LINKS: '/links',
	},
	TIMEOUT: 30000, // 30 seconds
	RETRY_ATTEMPTS: 3,
} as const;

// Storage Configuration
export const STORAGE_CONFIG = {
	KEYS: {
		EXTENSION_DATA: 'mylinks_extension_data',
		PENDING_LINK: 'pendingLink',
	},
	CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// UI Configuration
export const UI_CONFIG = {
	POPUP: {
		WIDTH: 400,
		HEIGHT: 600,
	},
	NOTIFICATIONS: {
		ICON_URL: 'public/logo.png',
		DURATION: 5000, // 5 seconds
	},
	MODALS: {
		ANIMATION_DURATION: 200,
	},
} as const;

// Extension Configuration
export const EXTENSION_CONFIG = {
	NAME: 'MyLinks Extension',
	VERSION: '1.0.0',
	DESCRIPTION: 'Save and organize your links with MyLinks',
	PERMISSIONS: [
		'storage',
		'bookmarks',
		'contextMenus',
		'notifications',
		'activeTab',
	],
	HOST_PERMISSIONS: ['https://www.mylinks.app/*'],
} as const;

// Error Codes
export const ERROR_CODES = {
	NETWORK_ERROR: 'NETWORK_ERROR',
	API_ERROR: 'API_ERROR',
	STORAGE_ERROR: 'STORAGE_ERROR',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	INITIALIZATION_ERROR: 'INITIALIZATION_ERROR',
	UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Message Types
export const MESSAGE_TYPES = {
	INITIALIZE_EXTENSION: 'INITIALIZE_EXTENSION',
	SYNC_COLLECTIONS: 'SYNC_COLLECTIONS',
	ADD_LINK_TO_COLLECTION: 'ADD_LINK_TO_COLLECTION',
	CREATE_COLLECTION: 'CREATE_COLLECTION',
	UPDATE_COLLECTION: 'UPDATE_COLLECTION',
	DELETE_COLLECTION: 'DELETE_COLLECTION',
	GET_COLLECTIONS: 'GET_COLLECTIONS',
	GET_SETTINGS: 'GET_SETTINGS',
	UPDATE_SETTINGS: 'UPDATE_SETTINGS',
	RESET_EXTENSION: 'RESET_EXTENSION',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
	URL: {
		PATTERN: /^https?:\/\/.+/,
		MAX_LENGTH: 2048,
	},
	TITLE: {
		MIN_LENGTH: 1,
		MAX_LENGTH: 255,
	},
	DESCRIPTION: {
		MAX_LENGTH: 1000,
	},
	COLLECTION_NAME: {
		MIN_LENGTH: 1,
		MAX_LENGTH: 100,
	},
	API_KEY: {
		MIN_LENGTH: 1,
		PATTERN: /^[a-zA-Z0-9_-]+$/,
	},
} as const;

// Timing Configuration
export const TIMING_CONFIG = {
	TOKEN_VALIDATION_INTERVAL: 5 * 60 * 1000, // 5 minutes
	SYNC_INTERVAL: 10 * 60 * 1000, // 10 minutes
	DEBOUNCE_DELAY: 300, // 300ms
	THROTTLE_DELAY: 1000, // 1 second
} as const;
