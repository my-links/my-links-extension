import { Button } from '@minimalstuff/ui';
import { IconBookmark, IconCheck, IconInfoCircle } from '@tabler/icons-react';

interface InitializationViewProps {
	onInitialize: () => Promise<void>;
}

export function InitializationView({ onInitialize }: InitializationViewProps) {
	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
				<div className="space-y-4">
					<h2 className="text-center text-xl font-semibold text-gray-900 dark:text-white">
						{chrome.i18n.getMessage('initialization')}
					</h2>

					<p className="text-center text-sm text-gray-500 dark:text-gray-400">
						{chrome.i18n.getMessage('initializationDescription')}
					</p>

					<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
						<div className="flex items-start gap-3">
							<IconInfoCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
							<div className="flex-1">
								<p className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">
									{chrome.i18n.getMessage('thisWill')}
								</p>
								<ul className="space-y-1.5">
									<li className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
										<IconCheck className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-600 p-0.5 text-white dark:bg-blue-400" />
										<span>
											{chrome.i18n.getMessage('backupBookmarksDescription')}
										</span>
									</li>
									<li className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
										<IconCheck className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-600 p-0.5 text-white dark:bg-blue-400" />
										<span>
											{chrome.i18n.getMessage('setupExtensionDescription')}
										</span>
									</li>
									<li className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
										<IconCheck className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-600 p-0.5 text-white dark:bg-blue-400" />
										<span>
											{chrome.i18n.getMessage(
												'configureBookmarkBarDescription'
											)}
										</span>
									</li>
								</ul>
							</div>
						</div>
					</div>

					<Button
						type="button"
						variant="primary"
						fullWidth
						onClick={onInitialize}
						className="gap-2"
					>
						<IconBookmark size={16} />
						{chrome.i18n.getMessage('initialize')}
					</Button>
				</div>
			</div>
		</div>
	);
}
