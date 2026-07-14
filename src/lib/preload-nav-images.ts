import { browser } from '$app/environment';

import { infoPhotoUrls } from '$lib/assets/infoPhotos';
import andrewMailThumbnail from '$lib/assets/spacesThumbnails/andrewMail.png?url';
import vinylCoverHk from '$lib/assets/spacesThumbnails/vinylCover_hk.png?url';
import vinylRecordHk from '$lib/assets/spacesThumbnails/vinylRecord_hk.png?url';

/** Critical nav images to warm on home page load (before panels open). */
export const navPreloadImageUrls = [
	infoPhotoUrls[0],
	vinylCoverHk,
	vinylRecordHk,
	andrewMailThumbnail
] as const;

function preloadImage(url: string) {
	const image = new Image();
	image.decoding = 'async';
	image.src = url;
	return image.decode?.().catch(() => undefined) ?? Promise.resolve();
}

/** Warm Info + Spaces thumbnails so the first panel open isn't blocked on network. */
export function preloadNavImages() {
	if (!browser) return;

	for (const url of navPreloadImageUrls) {
		void preloadImage(url);
	}
}
