import { BASE_INPUT_STYLES, Button, Input, Textarea } from '@minimalstuff/ui';
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
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onCancel}
						className="gap-1"
					>
						<span className="i-tabler-arrow-left size-4" />
						{chrome.i18n.getMessage('back')}
					</Button>

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
						<input
							type="text"
							value={link.url}
							readOnly
							className={`${BASE_INPUT_STYLES} bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400 pl-9`}
						/>
					</div>

					<Input
						label={`${chrome.i18n.getMessage('name')} *`}
						placeholder={chrome.i18n.getMessage('linkNamePlaceholder')}
						value={formState.name}
						onChange={(e) =>
							setFormState({ ...formState, name: e.target.value })
						}
					/>

					<Textarea
						label={chrome.i18n.getMessage('description')}
						placeholder={chrome.i18n.getMessage('linkDescriptionPlaceholder')}
						value={formState.description}
						onChange={(e) =>
							setFormState({ ...formState, description: e.target.value })
						}
						rows={3}
					/>

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
							{chrome.i18n.getMessage('collection')} *
						</label>
						<select
							value={formState.collectionId}
							onChange={(e) =>
								setFormState({ ...formState, collectionId: e.target.value })
							}
							className={BASE_INPUT_STYLES}
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
						<Button variant="outline" onClick={onCancel}>
							{chrome.i18n.getMessage('cancel')}
						</Button>
						<Button
							onClick={handleAddLink}
							disabled={
								!formState.collectionId || !formState.name.trim() || loading
							}
							variant="primary"
						>
							{loading
								? chrome.i18n.getMessage('loading')
								: chrome.i18n.getMessage('addToCollection')}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
