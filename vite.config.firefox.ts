import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.firefox.js';
import { name, version } from './package.json';

export default defineConfig({
	resolve: {
		alias: {
			'@': `${path.resolve(__dirname, 'src')}`,
		},
	},
	plugins: [
		react(),
		UnoCSS(),
		crx({ manifest }),
		zip({ outDir: 'release', outFileName: `xpi-${name}-${version}.zip` }),
	],
	server: {
		cors: {
			origin: [/chrome-extension:\/\//],
		},
	},
});
