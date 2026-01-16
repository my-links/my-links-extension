import { useModals } from '@/hooks/use_modals';
import {
	CreateCollectionRequest,
	MyLinksCollection,
	UpdateCollectionRequest,
} from '@/types';
import {
	IconDotsVertical,
	IconEdit,
	IconExternalLink,
	IconPlus,
	IconRefresh,
	IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';

interface CollectionsViewProps {
	collections: MyLinksCollection[];
	onCollectionsUpdate: () => Promise<void>;
	onCreateCollection: (props: CreateCollectionRequest) => Promise<void>;
	onUpdateCollection: (props: UpdateCollectionRequest) => Promise<void>;
	onDeleteCollection: (id: string, name: string) => Promise<void>;
}

export function CollectionsView({
	collections,
	onCollectionsUpdate,
	onCreateCollection,
	onUpdateCollection,
	onDeleteCollection,
}: CollectionsViewProps) {
	const [loading, setLoading] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);
	const modals = useModals();

	const handleCreateCollection = async (props: CreateCollectionRequest) => {
		try {
			setLoading(true);
			await onCreateCollection(props);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateCollection = async (props: UpdateCollectionRequest) => {
		try {
			setLoading(true);
			await onUpdateCollection(props);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteCollection = async (collection: MyLinksCollection) => {
		modals.openDeleteConfirmationModal(collection, async () => {
			try {
				setLoading(true);
				await onDeleteCollection(collection.id, collection.name);
			} finally {
				setLoading(false);
			}
		});
	};

	const handleRefresh = async () => {
		try {
			setLoading(true);
			await onCollectionsUpdate();
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
					{chrome.i18n.getMessage('collections')}
				</h2>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleRefresh}
						disabled={loading}
						className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						<IconRefresh size={16} className={loading ? 'animate-spin' : ''} />
					</button>
					<button
						type="button"
						onClick={() =>
							modals.openCreateCollectionModal(handleCreateCollection)
						}
						className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						<IconPlus size={14} />
						{chrome.i18n.getMessage('createCollection')}
					</button>
				</div>
			</div>

			<div className="h-[400px] overflow-y-auto">
				<div className="space-y-2">
					{collections.length === 0 ? (
						<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
							<p className="text-center text-sm text-gray-500 dark:text-gray-400">
								No collections found. Create your first collection to get
								started.
							</p>
						</div>
					) : (
						collections.map((collection) => (
							<div
								key={String(collection.id)}
								className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1 space-y-1">
										<div className="flex items-center gap-2">
											<h3 className="text-sm font-semibold text-gray-900 dark:text-white">
												{collection.name}
											</h3>
											<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
												{collection.links.length} links
											</span>
										</div>
										{collection.description && (
											<p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
												{collection.description}
											</p>
										)}
									</div>
									<div className="relative ml-2">
										<button
											type="button"
											onClick={() =>
												setOpenMenuId(
													openMenuId === String(collection.id)
														? null
														: String(collection.id)
												)
											}
											className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
										>
											<IconDotsVertical size={14} />
										</button>
										{openMenuId === String(collection.id) && (
											<>
												<div
													className="fixed inset-0 z-10"
													onClick={() => setOpenMenuId(null)}
												/>
												<div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
													<button
														type="button"
														onClick={() => {
															modals.openEditCollectionModal(
																collection,
																handleUpdateCollection
															);
															setOpenMenuId(null);
														}}
														className="flex w-full items-center gap-2 rounded-t-md px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
													>
														<IconEdit size={14} />
														{chrome.i18n.getMessage('editCollection')}
													</button>
													<button
														type="button"
														onClick={() => {
															chrome.tabs.create({
																url: `https://www.mylinks.app/collections/${String(
																	collection.id
																)}`,
															});
															setOpenMenuId(null);
														}}
														className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
													>
														<IconExternalLink size={14} />
														View on MyLinks
													</button>
													<div className="border-t border-gray-200 dark:border-gray-700" />
													<button
														type="button"
														onClick={() => {
															handleDeleteCollection(collection);
															setOpenMenuId(null);
														}}
														className="flex w-full items-center gap-2 rounded-b-md px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
													>
														<IconTrash size={14} />
														{chrome.i18n.getMessage('deleteCollection')}
													</button>
												</div>
											</>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
