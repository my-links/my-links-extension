import { MyLinksAPI } from '../services/api';
import { BookmarksService } from '../services/bookmarks';
import { BookmarksSyncService } from '../services/bookmarks-sync';
import { NotificationService } from '../services/notifications';
import { StorageService } from '../services/storage';
import type {
	AddLinkRequest,
	CreateCollectionRequest,
	Message,
	UpdateCollectionRequest,
} from '../types';

const SYNC_DELAY_MS = 500;

chrome.runtime.onInstalled.addListener(async (details) => {
	await setupContextMenus();
	await checkInitialization();

	if (details.reason === 'install') {
		chrome.runtime.openOptionsPage();
	}
});

chrome.action.onClicked.addListener(() => {
	chrome.runtime.openOptionsPage();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (info.menuItemId === 'add-to-collection' && tab?.url) {
		await handleAddToCollection(tab.url, tab.title || 'My Links');
	}
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener(
	(message: Message, sender, sendResponse) => {
		handleMessage(message, sender, sendResponse);
		return true; // Keep message channel open for async response
	}
);

// Debounced sync trigger to avoid excessive API calls
let scheduledSyncTimeout: number | undefined;
function scheduleSync(delayMs: number = 800) {
	if (scheduledSyncTimeout) {
		clearTimeout(scheduledSyncTimeout);
	}

	scheduledSyncTimeout = setTimeout(async () => {
		try {
			await syncCollections();
		} finally {
			scheduledSyncTimeout = undefined;
		}
	}, delayMs);
}

// React to tab and window changes
chrome.tabs.onActivated.addListener(() => {
	scheduleSync(SYNC_DELAY_MS);
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
	if (changeInfo.status === 'complete') {
		scheduleSync(SYNC_DELAY_MS);
	}
});

chrome.windows.onFocusChanged.addListener((windowId) => {
	if (windowId !== chrome.windows.WINDOW_ID_NONE) {
		scheduleSync(SYNC_DELAY_MS);
	}
});

async function setupContextMenus() {
	try {
		// Remove existing context menus
		await chrome.contextMenus.removeAll();

		// Create main context menu
		chrome.contextMenus.create({
			id: 'add-to-collection',
			title: chrome.i18n.getMessage('addToCollection'),
			contexts: ['page', 'link'],
		});
	} catch (error) {
		console.error('Failed to setup context menus:', error);
	}
}

async function checkInitialization() {
	try {
		const settings = await StorageService.getSettings();

		if (!settings.isInitialized) {
			console.log('Extension not initialized');
			return;
		}

		// Start periodic token validation
		setInterval(
			async () => {
				await validateToken();
			},
			5 * 60 * 1000
		); // Check every 5 minutes

		// Initial sync
		await syncCollections();
	} catch (error) {
		console.error('Failed to check initialization:', error);
	}
}

async function validateToken() {
	try {
		const settings = await StorageService.getSettings();

		if (!settings.apiKey || !settings.mylinksUrl) {
			return;
		}

		const api = new MyLinksAPI(settings.mylinksUrl, settings.apiKey);
		const tokenCheck = await api.checkToken();

		if (!tokenCheck.valid) {
			console.warn('Invalid API token detected');
			await NotificationService.showWarning(
				'Invalid Token',
				'Your API token appears to be invalid. Please check your settings.'
			);
		}
	} catch (error) {
		console.error('Failed to validate token:', error);
	}
}

async function syncCollections() {
	try {
		const settings = await StorageService.getSettings();

		if (!settings.apiKey || !settings.mylinksUrl) {
			return;
		}

		const api = new MyLinksAPI(settings.mylinksUrl, settings.apiKey);
		const response = await api.getCollections();

		if (response.success && response.data) {
			// Handle both cases: direct array or { collections: [] } object
			const collections = Array.isArray(response.data)
				? response.data
				: (response.data as any).collections || [];

			await StorageService.setCollections(collections);
			await StorageService.updateCache(collections);
			await StorageService.setSettings({ lastSync: new Date().toISOString() });

			// Sync with bookmarks
			await BookmarksSyncService.syncCollectionsToBookmarks(collections);

			console.log('Collections synced successfully');
		}
	} catch (error) {
		console.error('Failed to sync collections:', error);
		await NotificationService.showSyncError(
			error instanceof Error ? error.message : 'Unknown error'
		);
	}
}

async function handleAddToCollection(url: string, name: string) {
	try {
		const collections = await StorageService.getCollections();

		if (collections.length === 0) {
			await NotificationService.showNoCollectionsError();
			return;
		}

		await StorageService.setPendingLink({ url, name });
		chrome.runtime.openOptionsPage();
	} catch (error) {
		console.error('Failed to handle add to collection:', error);
		await NotificationService.showApiError(
			error instanceof Error ? error.message : 'Failed to add to collection'
		);
	}
}

async function handleMessage(
	message: Message,
	_sender: chrome.runtime.MessageSender,
	sendResponse: (response: any) => void
) {
	try {
		switch (message.type) {
			case 'INITIALIZE_EXTENSION':
				await handleInitialize();
				sendResponse({ success: true });
				break;

			case 'PAGE_VISIBILITY' as import('../types').MessageType:
				if (message.visible === true) {
					scheduleSync(SYNC_DELAY_MS);
				}
				sendResponse({ success: true });
				break;

			case 'SYNC_COLLECTIONS':
				await syncCollections();
				const syncedCollections = await StorageService.getCollections();
				sendResponse({ success: true, data: syncedCollections });
				break;

			case 'ADD_LINK_TO_COLLECTION':
				await handleAddLinkToCollection(message.collectionId, message.link);
				sendResponse({ success: true });
				break;

			case 'CREATE_COLLECTION':
				const newCollection = await handleCreateCollection(message.collection);
				sendResponse({ success: true, data: newCollection });
				break;

			case 'UPDATE_COLLECTION':
				const updatedCollection = await handleUpdateCollection(
					message.id,
					message.collection
				);
				sendResponse({ success: true, data: updatedCollection });
				break;

			case 'DELETE_COLLECTION':
				await handleDeleteCollection(message.id);
				sendResponse({ success: true });
				break;

			case 'GET_COLLECTIONS':
				const storedCollections = await StorageService.getCollections();
				sendResponse({ success: true, data: storedCollections });
				break;

			case 'GET_SETTINGS':
				const settings = await StorageService.getSettings();
				sendResponse({ success: true, data: settings });
				break;

			case 'UPDATE_SETTINGS':
				await StorageService.setSettings(message.settings);
				sendResponse({ success: true });
				break;

			case 'RESET_EXTENSION':
				await handleResetExtension();
				sendResponse({ success: true });
				break;

			default:
				sendResponse({ success: false, error: 'Unknown message type' });
		}
	} catch (error) {
		console.error('Error handling message:', error);
		sendResponse({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

async function handleInitialize() {
	try {
		// Check if already initialized
		const settings = await StorageService.getSettings();
		if (settings.isInitialized) {
			return;
		}

		// Check if there are bookmarks to backup
		const hasBookmarks = await BookmarksService.hasBookmarksToBackup();

		if (hasBookmarks) {
			// Backup existing bookmarks
			await BookmarksService.backupBookmarks();
			console.log('Extension initialized successfully with bookmarks backup');
		} else {
			console.log(
				'Extension initialized successfully (no bookmarks to backup)'
			);
		}

		// Mark as initialized
		await StorageService.setSettings({ isInitialized: true });
	} catch (error) {
		console.error('Failed to initialize extension:', error);
		throw error;
	}
}

async function handleAddLinkToCollection(
	collectionId: string,
	link: AddLinkRequest
) {
	const settings = await StorageService.getSettings();
	const api = new MyLinksAPI(settings.mylinksUrl, settings.apiKey!);

	const response = await api.addLink({
		name: link.name,
		url: link.url,
		description: link.description,
		favorite: link.favorite,
		collectionId,
	});

	if (response.success) {
		// Refresh collections
		await syncCollections();
	} else {
		throw new Error(response.message || 'Failed to add link');
	}
}

async function handleCreateCollection(collection: CreateCollectionRequest) {
	const settings = await StorageService.getSettings();
	const api = new MyLinksAPI(settings.mylinksUrl, settings.apiKey);

	const response = await api.createCollection(collection);

	if (response.success && response.data) {
		// Refresh collections
		await syncCollections();
		return response.data;
	} else {
		throw new Error(response.message || 'Failed to create collection');
	}
}

async function handleUpdateCollection(
	id: string,
	collection: UpdateCollectionRequest
) {
	const settings = await StorageService.getSettings();
	const api = new MyLinksAPI(settings.mylinksUrl, settings.apiKey);

	const response = await api.updateCollection(id, collection);

	if (response.success && response.data) {
		// Refresh collections
		await syncCollections();
		return response.data;
	} else {
		throw new Error(response.message || 'Failed to update collection');
	}
}

async function handleDeleteCollection(id: string) {
	const settings = await StorageService.getSettings();
	const api = new MyLinksAPI(settings.mylinksUrl, settings.apiKey);

	const response = await api.deleteCollection(id);

	if (response.success) {
		// Refresh collections
		await syncCollections();
	} else {
		throw new Error(response.message || 'Failed to delete collection');
	}
}

async function handleResetExtension() {
	try {
		console.log('Resetting extension...');

		// Clear all bookmarks from bookmark bar
		await BookmarksService.clearBookmarkBar();

		// Restore bookmarks from backup folder
		await BookmarksService.restoreBookmarks();

		// Clear all storage data
		await StorageService.clearStorage();

		// Clear any pending links
		await StorageService.removePendingLink();

		// Remove all context menus and recreate them
		await chrome.contextMenus.removeAll();
		await setupContextMenus();

		console.log('Extension reset completed successfully');
	} catch (error) {
		console.error('Failed to reset extension:', error);
		throw error;
	}
}
