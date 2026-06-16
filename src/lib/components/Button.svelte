<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import type { IconName } from '$lib/assets/icons';

	import Icon from './Icon.svelte';

	type ButtonSize = 'default' | 'large';
	type ButtonVariant = 'filled' | 'text';
	type IconPosition = 'leading' | 'trailing';

	type Props = HTMLButtonAttributes & {
		variant?: ButtonVariant;
		size?: ButtonSize;
		icon?: IconName;
		iconPosition?: IconPosition;
		iconHover?: boolean;
		fullWidth?: boolean;
		/** Tailwind width utility, e.g. `w-48`, `w-full`. Defaults to content-fit (`w-fit`). */
		width?: string;
		/** Tailwind height utility, e.g. `h-12`, `h-14`. */
		height?: string;
		/** Tailwind border-radius utility, e.g. `rounded-lg`, `rounded-2xl`. Defaults to `rounded-full`. */
		rounded?: string;
		/** Tailwind size utility for the icon, e.g. `size-6`, `size-7`. Defaults to `size-4` or `size-5` by button size. */
		iconSize?: string;
		/** Tailwind background utility, e.g. `bg-stone-100`, `bg-white`. */
		background?: string;
		children?: Snippet;
	};

	let {
		variant = 'filled',
		size = 'default',
		icon,
		iconPosition = 'leading',
		iconHover = false,
		fullWidth = false,
		width,
		height,
		rounded = 'rounded-full',
		iconSize,
		background,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const iconRevealOnHover = $derived(iconHover && !!icon);
	const isTextLike = $derived(variant === 'text');

	const sizingClasses = $derived(
		size === 'large' ? 'px-5 py-3 text-lg' : 'px-4 py-2 text-base'
	);

	const iconSizeClasses = $derived(iconSize ?? (size === 'large' ? 'size-5' : 'size-4'));

	const widthClasses = $derived(
		width ?? (fullWidth ? 'w-full self-stretch' : 'w-fit self-start')
	);

	const layoutClasses = $derived(
		[
			'inline-flex items-center justify-center mx-auto',
			widthClasses,
			height,
			rounded,
			iconRevealOnHover ? 'group gap-0' : 'gap-2',
			sizingClasses
		]
			.filter(Boolean)
			.join(' ')
	);

	const typographyClasses = 'font-display font-bold text-stone-900';
	const surfaceClasses = $derived(
		background
			? isTextLike
				? `${background} shadow-none`
				: `${background} shadow-[0_3px_0_0_theme(colors.stone.300)]`
			: isTextLike
				? 'bg-transparent shadow-none'
				: 'bg-white shadow-[0_3px_0_0_theme(colors.stone.300)]'
	);

	const interactionClasses = $derived(
		background
			? isTextLike
				? 'group cursor-pointer transition-all duration-[120ms] ease-out-cubic active:scale-[0.97]'
				: 'group cursor-pointer transition-all duration-[120ms] ease-out-cubic active:translate-y-[3px] active:shadow-none'
			: isTextLike
				? 'group cursor-pointer transition-all duration-[120ms] ease-out-cubic hover:bg-stone-150 active:bg-stone-200 active:scale-[0.97]'
				: 'group cursor-pointer transition-all duration-[120ms] ease-out-cubic hover:bg-stone-50 active:translate-y-[3px] active:bg-stone-200 active:shadow-none'
	);
	
	const accessibilityClasses =
		'select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

	const buttonClasses = $derived(
		[
			layoutClasses,
			typographyClasses,
			surfaceClasses,
			interactionClasses,
			accessibilityClasses
		].join(' ')
	);

	const hasLabel = $derived(!!children);
</script>

{#snippet iconNode()}
	{#if icon}
		{#if iconRevealOnHover}
				<span class={`flex items-center w-0 h-2.5 group-hover:w-6 transition-all duration-[200ms] ease-out-cubic ${iconPosition === 'leading' ? 'justify-start' : 'justify-end'}`}>
					<Icon name={icon} class={`${iconSizeClasses} blur-xs opacity-0 scale-50 transition-all duration-[160ms] ease-out-cubic group-hover:blur-none group-hover:scale-100 group-hover:opacity-100`} />
				</span>
		{:else}
			<Icon name={icon} class={iconSizeClasses} />
		{/if}
	{/if}
{/snippet}

<button {...rest} class={`${buttonClasses} ${className}`.trim()}>
	{#if icon && iconPosition === 'leading'}
		{@render iconNode()}
	{/if}
	{#if hasLabel}
		{@render children?.()}
	{/if}
	{#if icon && iconPosition === 'trailing'}
		{@render iconNode()}
	{/if}
</button>
