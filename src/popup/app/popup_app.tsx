import { IconBookmark, IconSettings } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ErrorDisplay, LoadingSpinner } from '../../components';
import { usePopupState } from '../../hooks';
import { AddLinkView } from '../views/add_link';
import { CollectionsView } from '../views/collections';
import { InitializationView } from '../views/initialization';
import { SettingsView } from '../views/settings';

export function PopupApp() {
	const {
		settings,
		collections,
		loading,
		error,
		pendingLink,
		initializePopup,
		handleInitialize,
		handleSettingsUpdate,
		handleCollectionsUpdate,
		handleAddLink,
		handleCreateCollection,
		handleUpdateCollection,
		handleDeleteCollection,
		setPendingLink,
	} = usePopupState();

	const [activeTab, setActiveTab] = useState<'collections' | 'settings'>(
		'collections'
	);

	useEffect(() => {
		initializePopup();
	}, []);

	if (loading) {
		return <LoadingSpinner visible={loading} />;
	}

	if (error) {
		return <ErrorDisplay error={error} />;
	}

	if (!settings?.isInitialized) {
		return (
			<div className="mx-auto max-w-sm py-4">
				<InitializationView onInitialize={handleInitialize} />
			</div>
		);
	}

	if (pendingLink) {
		return (
			<div className="mx-auto max-w-sm py-4">
				<AddLinkView
					link={pendingLink}
					collections={collections}
					onAddLink={handleAddLink}
					onCancel={() => setPendingLink(null)}
				/>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-sm py-4">
			<div className="mb-4 border-b border-gray-200 dark:border-gray-700">
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setActiveTab('collections')}
						className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === 'collections'
								? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}
					>
						<IconBookmark size={16} />
						{chrome.i18n.getMessage('collections')}
					</button>
					<button
						type="button"
						onClick={() => setActiveTab('settings')}
						className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === 'settings'
								? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}
					>
						<IconSettings size={16} />
						{chrome.i18n.getMessage('settings')}
					</button>
				</div>
			</div>

			<div className="pt-2">
				{activeTab === 'collections' && (
					<CollectionsView
						collections={collections}
						onCollectionsUpdate={handleCollectionsUpdate}
						onCreateCollection={handleCreateCollection}
						onUpdateCollection={handleUpdateCollection}
						onDeleteCollection={handleDeleteCollection}
					/>
				)}
				{activeTab === 'settings' && (
					<SettingsView
						settings={settings}
						onSettingsUpdate={handleSettingsUpdate}
					/>
				)}
			</div>
		</div>
	);
}
