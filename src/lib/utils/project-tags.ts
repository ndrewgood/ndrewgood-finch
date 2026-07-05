import type { IconName } from '$lib/assets/icons';

export const PROJECT_TAG_ICONS: Record<string, IconName> = {
	Design: 'design_services',
	Development: 'code_xml',
	'Physical Computing': 'developer_board',
	'Physical computing': 'developer_board'
};

const TAG_ORDER = ['Design', 'Development', 'Physical computing', 'Physical Computing'];

export function sortProjectTags(tags: string[]): string[] {
	return [...tags]
		.filter((tag) => tag in PROJECT_TAG_ICONS)
		.sort((a, b) => {
			const ai = TAG_ORDER.indexOf(a);
			const bi = TAG_ORDER.indexOf(b);
			return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		});
}

export function getProjectTagIcon(tag: string): IconName | undefined {
	return PROJECT_TAG_ICONS[tag];
}
