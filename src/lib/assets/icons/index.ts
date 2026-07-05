/** Icon filenames in `src/lib/assets/icons/` (without `.svg`). */
export const iconNames = [
	'arena',
	'add',
	'arrow_right_alt',
	'bookmark_heart',
	'captive_portal',
	'check',
	'close',
	'code_xml',
	'content_copy',
	'content_copy_outline',
	'delete',
	'design_services',
	'developer_board',
	'error',
	'instagram',
	'grid',
	'linkedin',
	'list',
	'mic',
	'mic_outline',
	'mic_pending',
	'north_east',
	'pause',
	'pending',
	'person_text',
	'play',
	'remove',
	'send',
	'stop',
	'waving_hand'
] as const;

export type IconName = (typeof iconNames)[number];

const iconModules = import.meta.glob<string>('./*.svg', {
	eager: true,
	query: '?raw',
	import: 'default'
});

export function getIconSvg(name: IconName): string {
	const svg = iconModules[`./${name}.svg`];
	if (!svg) {
		throw new Error(`Unknown icon: ${name}`);
	}
	return svg;
}
