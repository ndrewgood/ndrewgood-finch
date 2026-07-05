import { marked } from 'marked';

const rawMdxFiles = import.meta.glob<string>('../../content/singletons/info-bio.mdx', {
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

function withBlankLinkTargets(html: string): string {
	return html.replaceAll('<a href', '<a target="_blank" rel="noopener noreferrer" href');
}

export function getInfoBioHtml(): string | null {
	const key = Object.keys(rawMdxFiles)[0];
	const raw = key ? rawMdxFiles[key] : undefined;
	const markdown = typeof raw === 'string' ? stripFrontmatter(raw).trim() : '';

	if (!markdown) return null;

	const parsed = marked.parse(markdown, { async: false });
	if (typeof parsed !== 'string') return null;

	return withBlankLinkTargets(parsed);
}
