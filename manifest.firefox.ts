import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

const firefoxAddonId = process.env.FIREFOX_ADDON_ID ?? 'my-links@mylinks.app';

const dataCollectionPermissions = {
	required: ['browsingActivity'],
	optional: [],
};

const browserSpecificSettings = {
	browser_specific_settings: {
		gecko: {
			...(firefoxAddonId ? { id: firefoxAddonId } : {}),
			data_collection_permissions: dataCollectionPermissions,
		},
	},
};

export default defineManifest({
	manifest_version: 3,
	name: '__MSG_extensionName__',
	description: '__MSG_extensionDescription__',
	version: pkg.version,
	default_locale: 'en',
	...browserSpecificSettings,
	icons: {
		16: 'public/logo.png',
		48: 'public/logo.png',
		128: 'public/logo.png',
	},
	action: {
		default_icon: {
			16: 'public/logo.png',
			48: 'public/logo.png',
		},
		default_title: '__MSG_extensionName__',
	},
	options_page: 'src/options/index.html',
	permissions: [
		'bookmarks',
		'storage',
		'activeTab',
		'scripting',
		'tabs',
		'contextMenus',
	],
	host_permissions: ['https://www.mylinks.app/*', 'https://mylinks.app/*'],
	content_scripts: [
		{
			js: ['src/content/main.tsx'],
			matches: ['https://*/*', 'http://*/*'],
		},
	],
	background: {
		scripts: ['src/background/main.ts'],
		type: 'module',
	},
	chrome_url_overrides: {
		newtab: 'src/newtab/index.html',
	},
});
