import { useModalContext } from '@/components/modals';
import { CreateCollectionRequest, Visibility } from '@/types';
import { Button, Input, Textarea } from '@minimalstuff/ui';
import { useState } from 'react';

interface CreateCollectionProps {
	onCreate: (props: CreateCollectionRequest) => void;
}

export function CreateCollectionForm({ onCreate }: CreateCollectionProps) {
	const { closeAll } = useModalContext();
	const [formState, setFormState] = useState<{
		name: string;
		description: string;
		visibility: Visibility;
	}>({
		name: '',
		description: '',
		visibility: Visibility.PRIVATE,
	});

	const handleSubmit = () => {
		if (formState.name.trim()) {
			onCreate({
				name: formState.name.trim(),
				description: formState.description.trim(),
				visibility: formState.visibility,
			});
			closeAll();
		}
	};

	return (
		<div className="space-y-4">
			<Input
				label={`${chrome.i18n.getMessage('collectionName')} *`}
				placeholder={chrome.i18n.getMessage('collectionNamePlaceholder')}
				value={formState.name}
				onChange={(e) => setFormState({ ...formState, name: e.target.value })}
			/>
			<Textarea
				label={chrome.i18n.getMessage('collectionDescription')}
				placeholder={chrome.i18n.getMessage('collectionDescriptionPlaceholder')}
				value={formState.description}
				onChange={(e) =>
					setFormState({ ...formState, description: e.target.value })
				}
				rows={3}
			/>
			<div>
				<label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
					{chrome.i18n.getMessage('collectionVisibility')}
				</label>
				<div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1 dark:border-gray-600 dark:bg-gray-700">
					<Button
						type="button"
						variant={
							formState.visibility === Visibility.PRIVATE ? 'subtle' : 'ghost'
						}
						size="sm"
						onClick={() =>
							setFormState({ ...formState, visibility: Visibility.PRIVATE })
						}
						className={
							formState.visibility === Visibility.PRIVATE
								? 'bg-white shadow-sm dark:bg-gray-600 dark:text-white'
								: ''
						}
					>
						{chrome.i18n.getMessage('private')}
					</Button>
					<Button
						type="button"
						variant={
							formState.visibility === Visibility.PUBLIC ? 'subtle' : 'ghost'
						}
						size="sm"
						onClick={() =>
							setFormState({ ...formState, visibility: Visibility.PUBLIC })
						}
						className={
							formState.visibility === Visibility.PUBLIC
								? 'bg-white shadow-sm dark:bg-gray-600 dark:text-white'
								: ''
						}
					>
						{chrome.i18n.getMessage('public')}
					</Button>
				</div>
			</div>
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={closeAll}>
					{chrome.i18n.getMessage('cancel')}
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={!formState.name.trim()}
					variant="primary"
				>
					{chrome.i18n.getMessage('createCollection')}
				</Button>
			</div>
		</div>
	);
}
