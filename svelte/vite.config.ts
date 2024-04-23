import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// absolute import
	resolve: {
		alias: {
			$ui: '/src/ui',
			$helper: '/src/helper',
			$scripts: '/src/scripts',
			$types: '/src/types',
		},
	},
});
