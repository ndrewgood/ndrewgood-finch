import { marked } from 'marked';

const contentFiles = import.meta.glob<string>(
	'../../content/singletons/colophon/content.mdoc',
	{
		eager: true,
		query: '?raw',
		import: 'default'
	}
);

export function getColophonHtml(): string | null {
	const key = Object.keys(contentFiles)[0];
	if (!key) return null;

	const raw = contentFiles[key].trim();
	if (!raw) return null;

	const parsed = marked.parse(raw, { async: false });
	return typeof parsed === 'string' ? parsed : null;
}
