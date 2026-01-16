import { IconX } from '@tabler/icons-react';
import { type ReactNode } from 'react';

interface ModalProps {
	title?: string;
	children: ReactNode;
	onClose: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm?: () => void | Promise<void>;
	confirmColor?: string;
}

export function Modal({
	title,
	children,
	onClose,
	confirmLabel,
	cancelLabel,
	onConfirm,
	confirmColor = 'blue',
}: ModalProps) {
	const handleConfirm = async () => {
		if (onConfirm) {
			await onConfirm();
		}
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={onClose}
		>
			<div
				className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							{title}
						</h2>
						<button
							onClick={onClose}
							className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
						>
							<IconX size={20} />
						</button>
					</div>
				)}
				<div className="mb-4">{children}</div>
				{(confirmLabel || cancelLabel) && (
					<div className="flex justify-end gap-2">
						{cancelLabel && (
							<button
								onClick={onClose}
								className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							>
								{cancelLabel}
							</button>
						)}
						{confirmLabel && (
							<button
								onClick={handleConfirm}
								className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
									confirmColor === 'red'
										? 'bg-red-600 hover:bg-red-700'
										: 'bg-blue-600 hover:bg-blue-700'
								}`}
							>
								{confirmLabel}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
