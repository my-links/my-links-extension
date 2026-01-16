import { CreateCollectionForm } from '@/components/forms/collections/create_collection';
import { EditCollectionForm } from '@/components/forms/collections/edit_collection';
import { useModalContext } from '@/components/modals';
import {
	CreateCollectionRequest,
	MyLinksCollection,
	UpdateCollectionRequest,
} from '@/types';

export function useModals() {
	const { openModal, openConfirmModal } = useModalContext();

	const openCreateCollectionModal = (
		onCreate: (props: CreateCollectionRequest) => void
	) => {
		openModal({
			title: chrome.i18n.getMessage('createCollection'),
			children: <CreateCollectionForm onCreate={onCreate} />,
		});
	};

	const openEditCollectionModal = (
		collection: MyLinksCollection,
		onUpdate: (props: UpdateCollectionRequest) => void
	) => {
		openModal({
			title: chrome.i18n.getMessage('editCollection'),
			children: (
				<EditCollectionForm collection={collection} onUpdate={onUpdate} />
			),
		});
	};

	const openDeleteConfirmationModal = (
		collection: MyLinksCollection,
		onConfirm: () => void
	) => {
		openConfirmModal({
			title: chrome.i18n.getMessage('deleteCollection'),
			children: (
				<p className="text-sm text-gray-700 dark:text-gray-300">
					{chrome.i18n.getMessage('deleteConfirmation')} &quot;{collection.name}
					&quot;?
				</p>
			),
			confirmLabel: chrome.i18n.getMessage('confirm'),
			cancelLabel: chrome.i18n.getMessage('cancel'),
			confirmColor: 'red',
			onConfirm,
		});
	};

	return {
		openCreateCollectionModal,
		openEditCollectionModal,
		openDeleteConfirmationModal,
	};
}
