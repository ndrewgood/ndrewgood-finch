import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const dev = process.env.NODE_ENV === 'development';

export default defineConfig(async () => ({
	plugins: [dev && (await import('keystatic-sveltekit')).keystatic(), tailwindcss(), sveltekit()]
}));
