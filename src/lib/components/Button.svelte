<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type ButtonSize = 'default' | 'large';

	type Props = HTMLButtonAttributes & {
		size?: ButtonSize;
		children?: Snippet;
	};

	let { size = 'default', class: className = '', children, ...rest }: Props = $props();

	const sizingClasses = $derived(
		size === 'large' ? 'px-5 py-3 text-lg' : 'px-4 py-2 text-base'
	);

	const layoutClasses = $derived(
		`inline-flex items-center justify-center rounded-full ${sizingClasses}`
	);
	const typographyClasses = 'font-display font-bold text-stone-900';
	const surfaceClasses = 'bg-white shadow-[0_3px_0_0_theme(colors.stone.300)]';
	const interactionClasses = 'cursor-pointer transition-all duration-[120ms] ease-out-cubic hover:bg-stone-50 active:translate-y-[3px] active:bg-stone-200 active:shadow-none';
	const accessibilityClasses = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

	const buttonClasses = $derived(
		[
			layoutClasses,
			typographyClasses,
			surfaceClasses,
			interactionClasses,
			accessibilityClasses
		].join(' ')
	);
</script>

<button {...rest} class={`${buttonClasses} ${className}`.trim()}>
	{@render children?.()}
</button>
