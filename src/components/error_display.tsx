import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorDisplayProps {
	error: string | null;
	title?: string;
	containerProps?: {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		py?: string | number;
	};
}

const sizeMap = {
	xs: 'max-w-xs',
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
};

export function ErrorDisplay({
	error,
	title,
	containerProps = { size: 'sm', py: 'md' },
}: ErrorDisplayProps) {
	if (!error) return null;

	const sizeClass = containerProps.size
		? sizeMap[containerProps.size]
		: sizeMap.sm;
	const pyClass =
		containerProps.py === 'md'
			? 'py-4'
			: containerProps.py === 'xl'
				? 'py-8'
				: 'py-2';

	return (
		<div className={`mx-auto ${sizeClass} ${pyClass}`}>
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
				<div className="flex items-start gap-3">
					<IconAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
					<div className="flex-1">
						<h3 className="mb-1 text-sm font-semibold text-red-800 dark:text-red-200">
							{title || chrome.i18n.getMessage('error')}
						</h3>
						<p className="text-sm text-red-700 dark:text-red-300">{error}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
