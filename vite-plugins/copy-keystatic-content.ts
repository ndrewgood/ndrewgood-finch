import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Keystatic's reader resolves paths from the repo root. SvelteKit bundles server
 * code under `.svelte-kit/output/server`, so `src/content/**` must exist there at
 * runtime (Vercel / Node). This copies committed content into the server output.
 */
export function copyKeystaticContent(projectRoot: string): Plugin {
	return {
		name: 'copy-keystatic-content',
		apply: 'build',
		closeBundle() {
			const srcContent = path.join(projectRoot, 'src/content');
			const serverOut = path.join(projectRoot, '.svelte-kit/output/server');
			if (!fs.existsSync(srcContent) || !fs.existsSync(serverOut)) return;

			const dest = path.join(serverOut, 'src/content');
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.cpSync(srcContent, dest, { recursive: true });
		}
	};
}
