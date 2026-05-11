import { marked } from 'marked';

import { keystaticReader } from '$lib/keystatic-reader.server';

async function markdownFromHeroField(text: unknown): Promise<string | null> {
	if (text == null) return null;
	if (typeof text === 'function') {
		const raw = await text();
		return typeof raw === 'string' ? raw : null;
	}
	if (typeof text === 'string') return text;
	return null;
}

export async function load() {
	const heroTextEntry = await keystaticReader.singletons.heroText.read();
	const markdown = (await markdownFromHeroField(heroTextEntry?.text))?.trim() ?? '';

	if (!markdown) {
		return { heroTextHtml: null as string | null };
	}

	const parsed = marked.parse(markdown, { async: false });
	const heroTextHtml = typeof parsed === 'string' ? parsed : await parsed;

	return { heroTextHtml };
}
