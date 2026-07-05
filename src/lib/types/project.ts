export type ProjectListTag = 'New' | 'Coming Soon';

export type ProjectTag = 'Design' | 'Development' | 'Physical Computing';

export type FeaturedProjectData = {
	slug: string;
	title: string;
	description: string;
	iconSvg: string;
	tags: string[];
	videoId?: string;
	highlightColor?: string;
	cta: string;
	ctaText: string;
};

export type AllProjectListItem = {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	iconSvg: string;
	endDateLabel: string;
	tags: ProjectListTag[];
	featuredTags: string[];
	videoId?: string;
	cta: string;
	ctaText: string;
};
