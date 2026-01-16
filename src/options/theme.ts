function applyTheme(theme: string) {
	const root = document.documentElement;

	if (theme === 'system') {
		const systemPrefersDark = window.matchMedia(
			'(prefers-color-scheme: dark)'
		).matches;
		if (systemPrefersDark) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	} else if (theme === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}
}

const savedTheme = localStorage.getItem('theme') || 'system';
applyTheme(savedTheme);

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', () => {
	const currentTheme = localStorage.getItem('theme') || 'system';
	if (currentTheme === 'system') {
		applyTheme('system');
	}
});
