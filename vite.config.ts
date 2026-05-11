import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { copyKeystaticContent } from './vite-plugins/copy-keystatic-content';

const dev = process.env.NODE_ENV === 'development';
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => ({
	plugins: [
		dev && (await import('keystatic-sveltekit')).keystatic(),
		tailwindcss(),
		sveltekit(),
		copyKeystaticContent(projectRoot)
	]
}));
