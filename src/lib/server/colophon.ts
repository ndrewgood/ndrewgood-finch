import { marked } from 'marked';

const contentFiles = import.meta.glob<string>(
	'../../content/singletons/colophon/content.mdoc',
	{
		eager: true,
		query: '?raw',
		import: 'default'
	}
);

function withBlankLinkTargets(html: string): string {
	return html.replaceAll('<a href', '<a target="_blank" rel="noopener noreferrer" href');
}

export function getColophonHtml(): string | null {
	const key = Object.keys(contentFiles)[0];
	if (!key) return null;

	const raw = contentFiles[key].trim();
	if (!raw) return null;

	const parsed = marked.parse(raw, { async: false });
	if (typeof parsed !== 'string') return null;

	return withBlankLinkTargets(parsed);
}
