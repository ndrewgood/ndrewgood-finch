/** Icon filenames in `src/lib/assets/icons/` (without `.svg`). */
export const iconNames = ['copy_content'] as const;

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
