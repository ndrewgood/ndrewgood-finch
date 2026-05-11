import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';

const hooks: Handle[] = [];

if (dev) {
	const config = (await import('../keystatic.config.ts')).default;
	const { handleKeystatic } = await import('keystatic-sveltekit');
	hooks.push(await handleKeystatic({ config }));
}

export const handle = sequence(...hooks);
