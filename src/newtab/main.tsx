import { createRoot } from 'react-dom/client';
import 'virtual:uno.css';
import { NewTabApp } from './NewTabApp';

const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);

	root.render(<NewTabApp />);
}
