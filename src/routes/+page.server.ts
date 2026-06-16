import { marked } from 'marked';

import { getAllProjects, getFeaturedProjects } from '$lib/server/projects';

/**
 * Keystatic reads `src/content` via `fs` at runtime. Vercel packages serverless functions
 * with `@vercel/nft`, which only ships files reachable from static imports — so dynamic
 * `readFile` paths are omitted. `import.meta.glob` with `?raw` bundles these files into
 * the SSR graph so they appear in production. Keep editing the same paths in Keystatic.
 */
const rawMdxFiles = import.meta.glob<string>('../content/**/*.mdx', {
	eager: true,
	query: '?raw',
	import: 'default'
});

/** Keystatic MDX singletons prepend JSON frontmatter (e.g. `---\n{}\n---`). */
function stripFrontmatter(raw: string): string {
	if (!raw.startsWith('---')) return raw;
	const end = raw.indexOf('\n---', 3);
	if (end === -1) return raw;
	return raw.slice(end + 4).trimStart();
}

function getHeroMarkdown(): string {
	const key = Object.keys(rawMdxFiles).find((k) => k.includes('singletons/hero-text.mdx'));
	const raw = key ? rawMdxFiles[key] : undefined;
	return typeof raw === 'string' ? stripFrontmatter(raw) : '';
}

export async function load() {
	const markdown = getHeroMarkdown().trim();

	const featuredProjects = getFeaturedProjects();
	const allProjects = getAllProjects();

	if (!markdown) {
		return { heroTextHtml: null as string | null, featuredProjects, allProjects };
	}

	const parsed = marked.parse(markdown, { async: false });
	const heroTextHtml = typeof parsed === 'string' ? parsed : await parsed;

	return { heroTextHtml, featuredProjects, allProjects };
}
