import '@minimalstuff/ui/style.css';
import { createRoot } from 'react-dom/client';
import 'virtual:uno.css';
import { ModalProvider } from '../components/modals';
import { OptionsApp } from './app/options_app';

const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);

	root.render(
		<ModalProvider>
			<OptionsApp />
		</ModalProvider>
	);
}
