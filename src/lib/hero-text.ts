export const HERO_WORD_STAGGER_MS = 30;
export const HERO_WORD_OPACITY_MS = 400;
export const HERO_WORD_SLIDE_MS = 700;
export const HERO_BUTTON_DELAY_MS = 1000;

export function wrapHeroWords(container: HTMLElement) {
	const textNodes: Text[] = [];
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

	let node: Node | null = walker.nextNode();
	while (node) {
		if (node.textContent?.trim()) {
			textNodes.push(node as Text);
		}
		node = walker.nextNode();
	}

	let wordIndex = 0;

	for (const textNode of textNodes) {
		const text = textNode.textContent ?? '';
		const parts = text.split(/(\s+)/);
		const fragment = document.createDocumentFragment();

		for (const part of parts) {
			if (!part) continue;

			if (/^\s+$/.test(part)) {
				fragment.appendChild(document.createTextNode(part));
				continue;
			}

			const span = document.createElement('span');
			span.className = 'hero-word';
			span.style.setProperty('--hero-word-delay', `${wordIndex * HERO_WORD_STAGGER_MS}ms`);
			span.textContent = part;
			fragment.appendChild(span);
			wordIndex += 1;
		}

		textNode.parentNode?.replaceChild(fragment, textNode);
	}

	return wordIndex;
}
