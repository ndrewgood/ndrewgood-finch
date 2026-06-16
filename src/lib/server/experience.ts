import yaml from 'js-yaml';
import { marked } from 'marked';

import type { ExperienceEntry } from '$lib/types/experience';

const experienceYamlFiles = import.meta.glob<string>('../../content/singletons/experience.yaml', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const descriptionFiles = import.meta.glob<string>(
	'../../content/singletons/experience/entries/*/description.mdoc',
	{
		eager: true,
		query: '?raw',
		import: 'default'
	}
);

const experienceIconFiles = import.meta.glob<string>(
	'../../content/singletons/experience/icons/**/*.svg',
	{
		eager: true,
		query: '?raw',
		import: 'default'
	}
);

type ExperienceYamlEntry = {
	label?: string;
	company?: string;
	icon?: string;
	startMonthYear?: string;
	endMonthYear?: string;
	title?: string;
};

type ExperienceYaml = {
	entries?: ExperienceYamlEntry[];
};

function parseYaml<T>(raw: string): T {
	return yaml.load(raw) as T;
}

function normalizeIconSvg(svg: string): string {
	return svg.replace(/<svg\b([^>]*)>/i, (_, attrs: string) => {
		const withoutSize = attrs.replace(/\s(width|height)="[^"]*"/gi, '');
		return `<svg${withoutSize} width="100%" height="100%">`;
	});
}

function getIconSvg(index: number): string {
	const key = Object.keys(experienceIconFiles).find((path) =>
		path.includes(`entries/${index}/icon.svg`)
	);
	return key ? normalizeIconSvg(experienceIconFiles[key]) : '';
}

function getDescriptionHtml(index: number): string {
	const key = Object.keys(descriptionFiles).find((path) =>
		path.includes(`entries/${index}/description.mdoc`)
	);
	if (!key) return '';

	const raw = descriptionFiles[key].trim();
	if (!raw) return '';

	const parsed = marked.parse(raw, { async: false });
	return typeof parsed === 'string' ? parsed : '';
}

export function getExperienceEntries(): ExperienceEntry[] {
	const yamlKey = Object.keys(experienceYamlFiles)[0];
	if (!yamlKey) return [];

	const data = parseYaml<ExperienceYaml>(experienceYamlFiles[yamlKey]);
	const entries = data.entries ?? [];

	return entries
		.map((entry, index) => {
			if (!entry.label || !entry.company || !entry.title) return null;

			return {
				label: entry.label,
				company: entry.company,
				iconSvg: getIconSvg(index),
				startMonthYear: entry.startMonthYear ?? '',
				endMonthYear: entry.endMonthYear ?? '',
				title: entry.title,
				descriptionHtml: getDescriptionHtml(index)
			};
		})
		.filter((entry): entry is ExperienceEntry => entry !== null);
}
