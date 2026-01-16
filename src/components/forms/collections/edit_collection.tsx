import { useModalContext } from '@/components/modals';
import {
	MyLinksCollection,
	UpdateCollectionRequest,
	Visibility,
} from '@/types';
import { useState } from 'react';

interface EditCollectionFormProps {
	collection: MyLinksCollection;
	onUpdate: (props: UpdateCollectionRequest) => void;
}

export function EditCollectionForm({
	collection,
	onUpdate,
}: EditCollectionFormProps) {
	const { closeAll } = useModalContext();
	const [formState, setFormState] = useState<{
		name: string;
		description: string;
		visibility: Visibility;
	}>({
		name: collection.name,
		description: collection.description || '',
		visibility: collection.visibility,
	});

	const trimmedName = formState.name.trim();
	const trimmedDescription = formState.description.trim();

	const handleSubmit = () => {
		if (trimmedName) {
			onUpdate({
				id: collection.id,
				name: trimmedName,
				description: trimmedDescription || undefined,
				visibility: formState.visibility,
			});
			closeAll();
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
					{chrome.i18n.getMessage('collectionName')}
					<span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					placeholder={chrome.i18n.getMessage('collectionNamePlaceholder')}
					value={formState.name}
					onChange={(e) => setFormState({ ...formState, name: e.target.value })}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
			<div>
				<label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
					{chrome.i18n.getMessage('collectionDescription')}
				</label>
				<textarea
					placeholder={chrome.i18n.getMessage(
						'collectionDescriptionPlaceholder'
					)}
					value={formState.description}
					onChange={(e) =>
						setFormState({ ...formState, description: e.target.value })
					}
					rows={3}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
			<div>
				<label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
					{chrome.i18n.getMessage('collectionVisibility')}
				</label>
				<div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1 dark:border-gray-600 dark:bg-gray-700">
					<button
						type="button"
						onClick={() =>
							setFormState({ ...formState, visibility: Visibility.PRIVATE })
						}
						className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
							formState.visibility === Visibility.PRIVATE
								? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
								: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
						}`}
					>
						{chrome.i18n.getMessage('private')}
					</button>
					<button
						type="button"
						onClick={() =>
							setFormState({ ...formState, visibility: Visibility.PUBLIC })
						}
						className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
							formState.visibility === Visibility.PUBLIC
								? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
								: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
						}`}
					>
						{chrome.i18n.getMessage('public')}
					</button>
				</div>
			</div>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={closeAll}
					className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				>
					{chrome.i18n.getMessage('cancel')}
				</button>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={!trimmedName}
					className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{chrome.i18n.getMessage('save')}
				</button>
			</div>
		</div>
	);
}
