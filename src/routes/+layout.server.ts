import { getExperienceEntries } from '$lib/server/experience';
import { getPastSiteEntries } from '$lib/server/past-sites';

export function load() {
	return {
		experience: getExperienceEntries(),
		pastSites: getPastSiteEntries()
	};
}
