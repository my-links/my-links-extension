interface LoadingSpinnerProps {
	visible: boolean;
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

export function LoadingSpinner({
	visible,
	containerProps = { size: 'sm', py: 'md' },
}: LoadingSpinnerProps) {
	if (!visible) return null;

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
		<div className={`mx-auto ${sizeClass} ${pyClass} relative`}>
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
			</div>
		</div>
	);
}
