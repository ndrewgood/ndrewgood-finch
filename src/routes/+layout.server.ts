import ogImage from '$lib/assets/metadata/og.png';
import { getColophonHtml } from '$lib/server/colophon';
import { getExperienceEntries } from '$lib/server/experience';
import { getInfoBioHtml } from '$lib/server/info-bio';
import { getPastSiteEntries } from '$lib/server/past-sites';

export function load({ url }) {
	return {
		experience: getExperienceEntries(),
		pastSites: getPastSiteEntries(),
		colophonHtml: getColophonHtml(),
		infoBioHtml: getInfoBioHtml(),
		ogImageUrl: new URL(ogImage, url.origin).href
	};
}
