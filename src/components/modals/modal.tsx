import { Button, Modal as UIModal } from '@minimalstuff/ui';
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
		<UIModal isOpen onClose={onClose} title={title} size="md">
			<div className="mb-4">{children}</div>
			{(confirmLabel || cancelLabel) && (
				<div className="flex justify-end gap-2">
					{cancelLabel && (
						<Button variant="outline" onClick={onClose}>
							{cancelLabel}
						</Button>
					)}
					{confirmLabel && (
						<Button
							variant={confirmColor === 'red' ? 'danger' : 'primary'}
							onClick={handleConfirm}
						>
							{confirmLabel}
						</Button>
					)}
				</div>
			)}
		</UIModal>
	);
}
