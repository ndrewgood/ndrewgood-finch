import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createReader } from '@keystatic/core/reader';

import config from '../../keystatic.config';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const keystaticReader = createReader(repoRoot, config);
