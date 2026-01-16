import { createContext, useContext, useState, type ReactNode } from 'react';
import { Modal } from './modal';

interface ModalState {
	id: string;
	title?: string;
	children: ReactNode;
	onClose?: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm?: () => void | Promise<void>;
	confirmColor?: string;
}

interface ModalContextType {
	openModal: (modal: Omit<ModalState, 'id'>) => void;
	openConfirmModal: (modal: Omit<ModalState, 'id'>) => void;
	closeModal: (id: string) => void;
	closeAll: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
	const [modals, setModals] = useState<ModalState[]>([]);

	const openModal = (modal: Omit<ModalState, 'id'>) => {
		const id = Math.random().toString(36).substring(2, 9);
		setModals((prev) => [...prev, { ...modal, id }]);
	};

	const openConfirmModal = (modal: Omit<ModalState, 'id'>) => {
		openModal(modal);
	};

	const closeModal = (id: string) => {
		setModals((prev) => {
			const modal = prev.find((m) => m.id === id);
			if (modal?.onClose) {
				modal.onClose();
			}
			return prev.filter((m) => m.id !== id);
		});
	};

	const closeAll = () => {
		setModals((prev) => {
			prev.forEach((modal) => {
				if (modal.onClose) {
					modal.onClose();
				}
			});
			return [];
		});
	};

	return (
		<ModalContext.Provider
			value={{ openModal, openConfirmModal, closeModal, closeAll }}
		>
			{children}
			{modals.map((modal) => (
				<Modal
					key={modal.id}
					title={modal.title}
					onClose={() => closeModal(modal.id)}
					confirmLabel={modal.confirmLabel}
					cancelLabel={modal.cancelLabel}
					onConfirm={modal.onConfirm}
					confirmColor={modal.confirmColor}
				>
					{modal.children}
				</Modal>
			))}
		</ModalContext.Provider>
	);
}

export function useModalContext() {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('useModalContext must be used within ModalProvider');
	}
	return context;
}
