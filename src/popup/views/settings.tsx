import { ThemeToggle } from '@/components';
import { useModalContext } from '@/components/modals';
import {
	IconExternalLink,
	IconKey,
	IconTrash,
	IconWorld,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { ExtensionSettings } from '../../types';

const showNotification = (title: string, message: string) => {
	console.log(`${title}: ${message}`);
	if (chrome.notifications) {
		chrome.notifications.create({
			type: 'basic',
			iconUrl: 'public/logo.png',
			title,
			message,
		});
	}
};

interface SettingsViewProps {
	settings: ExtensionSettings;
	onSettingsUpdate: (settings: Partial<ExtensionSettings>) => Promise<void>;
}

export function SettingsView({
	settings,
	onSettingsUpdate,
}: SettingsViewProps) {
	const { openConfirmModal } = useModalContext();
	const [mylinksUrl, setMylinksUrl] = useState(settings.mylinksUrl);
	const [apiKey, setApiKey] = useState(settings.apiKey);
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		try {
			setLoading(true);
			await onSettingsUpdate({
				mylinksUrl,
				apiKey,
			});
		} catch (error) {
			showNotification(
				chrome.i18n.getMessage('error'),
				error instanceof Error
					? error.message
					: chrome.i18n.getMessage('failedToSaveSettings')
			);
		} finally {
			setLoading(false);
		}
	};

	const openApiKeyPage = () => {
		chrome.tabs.create({
			url: `${mylinksUrl}/user/settings`,
		});
	};

	const openMyLinks = () => {
		chrome.tabs.create({
			url: mylinksUrl,
		});
	};

	const handleReset = () => {
		openConfirmModal({
			title: chrome.i18n.getMessage('resetExtension'),
			children: (
				<div className="space-y-3">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						{chrome.i18n.getMessage('resetExtensionDescription')}
					</p>
					<ul className="list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
						<li>{chrome.i18n.getMessage('resetExtensionClearSettings')}</li>
						<li>{chrome.i18n.getMessage('resetExtensionRemoveCollections')}</li>
						<li>{chrome.i18n.getMessage('resetExtensionMarkUninitialized')}</li>
						<li>{chrome.i18n.getMessage('resetExtensionSetupAgain')}</li>
					</ul>
					<p className="text-sm font-semibold text-red-600 dark:text-red-400">
						{chrome.i18n.getMessage('resetExtensionCannotUndo')}
					</p>
				</div>
			),
			confirmLabel: chrome.i18n.getMessage('resetExtension'),
			cancelLabel: chrome.i18n.getMessage('cancel'),
			confirmColor: 'red',
			onConfirm: async () => {
				try {
					setLoading(true);

					const response = await chrome.runtime.sendMessage({
						type: 'RESET_EXTENSION',
					});

					if (response.success) {
						showNotification(
							chrome.i18n.getMessage('extensionReset'),
							chrome.i18n.getMessage('extensionResetSuccess')
						);

						setMylinksUrl('https://www.mylinks.app');
						setApiKey('');

						setTimeout(() => {
							window.close();
						}, 2000);
					}
				} catch (error) {
					showNotification(
						chrome.i18n.getMessage('resetFailed'),
						error instanceof Error
							? error.message
							: chrome.i18n.getMessage('failedToResetExtension')
					);
				} finally {
					setLoading(false);
				}
			},
		});
	};

	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							{chrome.i18n.getMessage('settings')}
						</h2>
						<ThemeToggle />
					</div>

					<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
						<p className="text-sm text-blue-800 dark:text-blue-200">
							{chrome.i18n.getMessage('settingsDescription')}
						</p>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
							{chrome.i18n.getMessage('mylinksUrl')}
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<IconWorld className="h-4 w-4 text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="https://www.mylinks.app"
								value={mylinksUrl}
								onChange={(e) => setMylinksUrl(e.target.value)}
								className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-20 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-1">
								<button
									type="button"
									onClick={openMyLinks}
									className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
								>
									<IconExternalLink size={14} />
									{chrome.i18n.getMessage('open')}
								</button>
							</div>
						</div>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
							{chrome.i18n.getMessage('apiKey')}
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<IconKey className="h-4 w-4 text-gray-400" />
							</div>
							<input
								type="password"
								placeholder={chrome.i18n.getMessage('apiKeyPlaceholder')}
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-24 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-1">
								<button
									type="button"
									onClick={openApiKeyPage}
									className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
								>
									<IconExternalLink size={14} />
									{chrome.i18n.getMessage('getApiKey')}
								</button>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<button
							type="button"
							onClick={handleReset}
							disabled={loading}
							className="flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
						>
							<IconTrash size={16} />
							{chrome.i18n.getMessage('resetExtension')}
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={!mylinksUrl || loading}
							className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading
								? chrome.i18n.getMessage('loading')
								: chrome.i18n.getMessage('save')}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
