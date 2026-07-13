import { browser } from '$app/environment';

import faviconActive from '$lib/assets/metadata/favicon_active.svg';
import faviconPassive from '$lib/assets/metadata/favicon_passive.svg';

const FAVICON_SELECTOR = 'link[data-dynamic-favicon]';

function setFavicon(href: string) {
	if (!browser) return;

	let link = document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);
	if (!link) {
		link = document.createElement('link');
		link.rel = 'icon';
		link.dataset.dynamicFavicon = '';
		document.head.appendChild(link);
	}

	if (link.getAttribute('href') !== href) {
		link.href = href;
	}
}

export function syncFavicon() {
	setFavicon(document.visibilityState === 'visible' ? faviconActive : faviconPassive);
}

export function initDynamicFavicon() {
	if (!browser) return;

	syncFavicon();
	document.addEventListener('visibilitychange', syncFavicon);

	return () => {
		document.removeEventListener('visibilitychange', syncFavicon);
	};
}

export { faviconActive, faviconPassive };
