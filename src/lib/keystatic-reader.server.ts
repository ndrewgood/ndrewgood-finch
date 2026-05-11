import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createReader } from '@keystatic/core/reader';

import config from '../../keystatic.config';

/**
 * Walk up from this module until we find `src/content` (dev: project root,
 * prod: `.svelte-kit/output/server` after the copy-keystatic-content build step).
 */
function resolveKeystaticRepoRoot(): string {
	let dir = path.dirname(fileURLToPath(import.meta.url));

	for (let i = 0; i < 8; i++) {
		if (fs.existsSync(path.join(dir, 'src', 'content'))) {
			return dir;
		}
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}

	return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
}

export const keystaticReader = createReader(resolveKeystaticRepoRoot(), config);
