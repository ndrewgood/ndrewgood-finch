import yaml from 'js-yaml';

import type { PastSiteEntry } from '$lib/types/past-sites';

const pastSitesYamlFiles = import.meta.glob<string>('../../content/singletons/past-sites.yaml', {
	eager: true,
	query: '?raw',
	import: 'default'
});

type PastSitesYamlEntry = {
	dateRange?: string;
	description?: string;
	link?: string;
};

type PastSitesYaml = {
	sites?: PastSitesYamlEntry[];
};

function parseYaml<T>(raw: string): T {
	return yaml.load(raw) as T;
}

export function getPastSiteEntries(): PastSiteEntry[] {
	const yamlKey = Object.keys(pastSitesYamlFiles)[0];
	if (!yamlKey) return [];

	const data = parseYaml<PastSitesYaml>(pastSitesYamlFiles[yamlKey]);
	const sites = data.sites ?? [];

	return sites
		.map((site) => {
			if (!site.dateRange || !site.description || !site.link) return null;

			return {
				dateRange: site.dateRange,
				description: site.description,
				link: site.link
			};
		})
		.filter((site): site is PastSiteEntry => site !== null);
}
