<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { tick } from 'svelte';

	import type { IconName } from '$lib/assets/icons';
	import { createCopySwap } from '$lib/copy-swap.svelte';

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
		/** Tailwind shadow utility, e.g. `shadow-[0_3px_0_0_theme(colors.blue.800)]`. Defaults to stone.300. */
		shadow?: string;
		/** When set, clicking copies this string and swaps label/icon to a success state. */
		copyText?: string;
		/** Success label after copy. Defaults to "Email copied!". */
		copySuccessLabel?: string;
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
		shadow,
		copyText,
		copySuccessLabel = 'Email copied!',
		class: className = '',
		children,
		onclick,
		...rest
	}: Props = $props();

	const filledShadow = $derived(
		shadow ?? 'shadow-[0_3px_0_0_theme(colors.stone.300)]'
	);

	const isCopyButton = $derived(!!copyText);
	const copySwap = createCopySwap(() => copyText ?? '');
	const copyIcon = $derived(icon ?? 'content_copy_outline');

	const iconRevealOnHover = $derived(iconHover && !!icon && !isCopyButton);
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
			isCopyButton || iconRevealOnHover ? 'group gap-0' : 'gap-2',
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
				: `${background} ${filledShadow}`
			: isTextLike
				? 'bg-transparent shadow-none'
				: `bg-white ${filledShadow}`
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

	async function handleCopyClick(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		await copySwap.copy();
		onclick?.(event);
	}

	const copyIconRevealClasses = $derived(
		copySwap.defaultLayer === 'shown' && !copySwap.copied
			? 'blur-xs opacity-0 scale-50 transition-all duration-[160ms] ease-out-cubic group-hover:blur-none group-hover:scale-100 group-hover:opacity-100'
			: ''
	);

	const successTextInFlow = $derived(copySwap.successLayer === 'shown');
	let swapTextEl = $state<HTMLDivElement | undefined>();
	let swapTextWidth = $state<number | undefined>();

	$effect(() => {
		copySwap.defaultLayer;
		copySwap.successLayer;

		tick().then(() => {
			if (swapTextEl) {
				swapTextWidth = swapTextEl.scrollWidth;
			}
		});
	});
</script>

{#snippet iconNode()}
	{#if icon}
		{#if iconRevealOnHover}
			<span
				class={`flex items-center w-0 h-2.5 group-hover:w-6 transition-all duration-[200ms] ease-out-cubic ${iconPosition === 'leading' ? 'justify-start' : 'justify-end'}`}
			>
				<Icon
					name={icon}
					class={`${iconSizeClasses} blur-xs opacity-0 scale-50 transition-all duration-[160ms] ease-out-cubic group-hover:blur-none group-hover:scale-100 group-hover:opacity-100`}
				/>
			</span>
		{:else}
			<Icon name={icon} class={iconSizeClasses} />
		{/if}
	{/if}
{/snippet}

{#snippet copyIconNode()}
	<span
		class={[
			'flex items-center h-2.5 transition-all duration-[200ms] ease-out-cubic',
			iconPosition === 'leading' ? 'justify-start' : 'justify-end',
			copySwap.copied ? 'w-6' : 'w-0 group-hover:w-6'
		]}
	>
		<span class={`relative shrink-0 ${iconSizeClasses}`}>
			<span
				class={[
					'absolute inset-0 flex items-center justify-center swap-layer',
					copySwap.layerClass(copySwap.defaultLayer),
					copySwap.suppressSwapTransition && 'swap-layer--no-transition'
				]}
				aria-hidden="true"
			>
				<Icon name={copyIcon} class={`${iconSizeClasses} ${copyIconRevealClasses}`.trim()} />
			</span>
			<span
				class={[
					'absolute inset-0 flex items-center justify-center swap-layer',
					copySwap.layerClass(copySwap.successLayer),
					copySwap.suppressSwapTransition && 'swap-layer--no-transition'
				]}
				aria-hidden="true"
			>
				<Icon name="check" class={iconSizeClasses} />
			</span>
		</span>
	</span>
{/snippet}

{#if isCopyButton}
	<button
		{...rest}
		type="button"
		class={`${buttonClasses} ${className}`.trim()}
		aria-live="polite"
		onclick={handleCopyClick}
	>
		{#if iconPosition === 'leading'}
			{@render copyIconNode()}
		{/if}
		<div
			bind:this={swapTextEl}
			class="swap-text relative inline-block"
			style:width={swapTextWidth === undefined ? undefined : `${swapTextWidth}px`}
		>
			<div
				class={[
					'swap-layer whitespace-nowrap',
					copySwap.layerClass(copySwap.defaultLayer),
					copySwap.suppressSwapTransition && 'swap-layer--no-transition',
					successTextInFlow && 'pointer-events-none absolute inset-y-0 left-0'
				]}
			>
				{#if hasLabel}
					{@render children?.()}
				{/if}
			</div>
			<div
				class={[
					'swap-layer whitespace-nowrap',
					copySwap.layerClass(copySwap.successLayer),
					copySwap.suppressSwapTransition && 'swap-layer--no-transition',
					!successTextInFlow && 'pointer-events-none absolute inset-y-0 left-0'
				]}
			>
				{copySuccessLabel}
			</div>
		</div>
		{#if iconPosition === 'trailing'}
			{@render copyIconNode()}
		{/if}
	</button>
{:else}
	<button {...rest} class={`${buttonClasses} ${className}`.trim()} {onclick}>
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
{/if}
