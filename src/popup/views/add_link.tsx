import { IconArrowLeft, IconLink } from '@tabler/icons-react';
import { useState } from 'react';
import type { AddLinkRequest, MyLinksCollection } from '../../types';

interface AddLinkViewProps {
	link: { url: string; name: string };
	collections: MyLinksCollection[];
	onAddLink: (collectionId: string, link: AddLinkRequest) => Promise<void>;
	onCancel: () => void;
}

export function AddLinkView({
	link,
	collections,
	onAddLink,
	onCancel,
}: AddLinkViewProps) {
	const [formState, setFormState] = useState<AddLinkRequest>({
		url: link.url,
		name: link.name,
		description: '',
		collectionId: '',
		favorite: false,
	});

	const [loading, setLoading] = useState(false);

	const handleAddLink = async () => {
		if (!formState.collectionId) return;

		try {
			setLoading(true);
			await onAddLink(formState.collectionId, {
				name: formState.name.trim(),
				url: formState.url,
				description: formState.description?.trim(),
				favorite: formState.favorite,
				collectionId: formState.collectionId,
			});
		} catch (error) {
			console.error('Failed to add link:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
				<div className="space-y-4">
					<div>
						<button
							type="button"
							onClick={onCancel}
							className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						>
							<IconArrowLeft size={14} />
							{chrome.i18n.getMessage('back')}
						</button>
					</div>

					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						{chrome.i18n.getMessage('addToCollection')}
					</h2>

					<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
						<p className="text-sm text-blue-800 dark:text-blue-200">
							{chrome.i18n.getMessage('addPageToCollection')}
						</p>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
							{chrome.i18n.getMessage('url')}
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<IconLink className="h-4 w-4 text-gray-400" />
							</div>
							<input
								type="text"
								value={link.url}
								readOnly
								className="w-full rounded-md border border-gray-300 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
							/>
						</div>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
							{chrome.i18n.getMessage('name')}
							<span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							placeholder={chrome.i18n.getMessage('linkNamePlaceholder')}
							value={formState.name}
							onChange={(e) =>
								setFormState({ ...formState, name: e.target.value })
							}
							className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
							{chrome.i18n.getMessage('description')}
						</label>
						<textarea
							placeholder={chrome.i18n.getMessage('linkDescriptionPlaceholder')}
							value={formState.description}
							onChange={(e) =>
								setFormState({ ...formState, description: e.target.value })
							}
							rows={3}
							className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="favorite"
							checked={formState.favorite}
							onChange={(e) =>
								setFormState({ ...formState, favorite: e.target.checked })
							}
							className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
						/>
						<label
							htmlFor="favorite"
							className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							{chrome.i18n.getMessage('favorite')}
						</label>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
							{chrome.i18n.getMessage('collection')}
							<span className="text-red-500">*</span>
						</label>
						<select
							value={formState.collectionId}
							onChange={(e) =>
								setFormState({ ...formState, collectionId: e.target.value })
							}
							className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
							<option value="">
								{chrome.i18n.getMessage('selectCollection')}
							</option>
							{collections.map((collection) => (
								<option
									key={String(collection.id)}
									value={String(collection.id)}
								>
									{collection.name}
								</option>
							))}
						</select>
					</div>

					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={onCancel}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						>
							{chrome.i18n.getMessage('cancel')}
						</button>
						<button
							type="button"
							onClick={handleAddLink}
							disabled={
								!formState.collectionId || !formState.name.trim() || loading
							}
							className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading
								? chrome.i18n.getMessage('loading')
								: chrome.i18n.getMessage('addToCollection')}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
