import { getColophonHtml } from '$lib/server/colophon';
import { getExperienceEntries } from '$lib/server/experience';
import { getInfoBioHtml } from '$lib/server/info-bio';
import { getPastSiteEntries } from '$lib/server/past-sites';

export function load() {
	return {
		experience: getExperienceEntries(),
		pastSites: getPastSiteEntries(),
		colophonHtml: getColophonHtml(),
		infoBioHtml: getInfoBioHtml()
	};
}
