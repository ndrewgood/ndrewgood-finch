import yaml from 'js-yaml';

import type { AllProjectListItem, FeaturedProjectData, ProjectListTag } from '$lib/types/project';

const rawYamlFiles = import.meta.glob<string>('../../content/**/*.yaml', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const projectIconFiles = import.meta.glob<string>('../../content/all-projects/icons/**/*.svg', {
	eager: true,
	query: '?raw',
	import: 'default'
});

type ProjectYaml = {
	title?: string;
	shortDescription?: string;
	description?: string;
	hide?: boolean;
	tags?: ProjectListTag[];
	featuredTags?: string[];
	videoId?: string;
	highlightColor?: string;
	cta?: string;
	ctaText?: string;
	startDate?: string | Date;
	endDate?: string | Date;
};

function toIsoDateString(value: string | Date | undefined): string {
	if (!value) return '';
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}
	return value;
}

type FeaturedProjectsYaml = {
	projects?: string[];
};

function parseYaml<T>(raw: string): T {
	return yaml.load(raw) as T;
}

function getAllProjectSlugs(): string[] {
	return Object.keys(rawYamlFiles)
		.map((path) => path.match(/all-projects\/([^/]+)\.yaml$/)?.[1])
		.filter((slug): slug is string => Boolean(slug));
}

function getFeaturedSlugs(): string[] {
	const key = Object.keys(rawYamlFiles).find((k) => k.includes('singletons/featured-projects.yaml'));
	if (!key) return [];
	const data = parseYaml<FeaturedProjectsYaml>(rawYamlFiles[key]);
	return data.projects ?? [];
}

function getProjectYaml(slug: string): ProjectYaml | null {
	const key = Object.keys(rawYamlFiles).find((k) => k.includes(`all-projects/${slug}.yaml`));
	if (!key) return null;
	return parseYaml<ProjectYaml>(rawYamlFiles[key]);
}

function normalizeProjectIconSvg(svg: string): string {
	return svg.replace(/<svg\b([^>]*)>/i, (_, attrs: string) => {
		const withoutSize = attrs.replace(/\s(width|height)="[^"]*"/gi, '');
		return `<svg${withoutSize} width="100%" height="100%">`;
	});
}

function getIconSvg(slug: string): string {
	const key = Object.keys(projectIconFiles).find((k) => k.includes(`${slug}/icon.svg`));
	return key ? normalizeProjectIconSvg(projectIconFiles[key]) : '';
}

function formatEndDate(iso: string): string {
	const date = new Date(`${iso}T00:00:00`);
	return String(date.getFullYear());
}

function toAllProjectListItem(slug: string, project: ProjectYaml): AllProjectListItem | null {
	const endDate = toIsoDateString(project.endDate);
	if (!project.title || !project.shortDescription || !project.description || !endDate) {
		return null;
	}

	return {
		slug,
		title: project.title,
		shortDescription: project.shortDescription,
		description: project.description,
		iconSvg: getIconSvg(slug),
		endDateLabel: formatEndDate(endDate),
		tags: project.tags ?? [],
		featuredTags: project.featuredTags ?? [],
		...(project.videoId ? { videoId: project.videoId } : {}),
		cta: project.cta ?? '',
		ctaText: project.ctaText ?? 'Visit site'
	};
}

export function getFeaturedProjects(): FeaturedProjectData[] {
	return getFeaturedSlugs()
		.map((slug) => {
			const project = getProjectYaml(slug);
			if (!project?.title || !project.description) return null;

			const featuredProject: FeaturedProjectData = {
				slug,
				title: project.title,
				description: project.description,
				iconSvg: getIconSvg(slug),
				tags: project.featuredTags ?? [],
				cta: project.cta ?? '',
				ctaText: project.ctaText ?? 'Visit site'
			};

			if (project.videoId) {
				featuredProject.videoId = project.videoId;
			}

			if (project.highlightColor) {
				featuredProject.highlightColor = project.highlightColor;
			}

			return featuredProject;
		})
		.filter((project): project is FeaturedProjectData => project !== null);
}

export function getAllProjects(): AllProjectListItem[] {
	return getAllProjectSlugs()
		.map((slug) => {
			const project = getProjectYaml(slug);
			if (!project || project.hide) return null;
			return { item: toAllProjectListItem(slug, project), endDate: toIsoDateString(project.endDate) };
		})
		.filter(
			(
				entry
			): entry is {
				item: AllProjectListItem;
				endDate: string;
			} => entry !== null && entry.item !== null && entry.endDate !== ''
		)
		.sort((a, b) => b.endDate.localeCompare(a.endDate))
		.map((entry) => entry.item);
}
