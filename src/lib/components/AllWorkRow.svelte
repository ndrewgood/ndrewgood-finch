<script lang="ts">
	import type { AllProjectListItem } from '$lib/types/project';

	import Icon from './Icon.svelte';
	import ProjectTagIcons from './ProjectTagIcons.svelte';

	let {
		title,
		shortDescription,
		description,
		iconSvg,
		endDateLabel,
		tags,
		featuredTags,
		cta,
		ctaText
	}: AllProjectListItem = $props();

	const suffixWords = $derived.by(() => {
		const short = shortDescription.trim();
		const full = description.trim();
		if (!full.startsWith(short)) return [];
		const rest = full.slice(short.length).trim();
		return rest ? rest.split(/\s+/) : [];
	});

	const hoverLabel = $derived(ctaText);
	const isNew = $derived(tags.includes('New'));
	const isComingSoon = $derived(tags.includes('Coming Soon'));
	const isInteractive = $derived(Boolean(cta));
</script>

<svelte:element
	this={cta ? 'a' : 'div'}
	href={cta || undefined}
	target={cta ? '_blank' : undefined}
	rel={cta ? 'noopener noreferrer' : undefined}
	aria-label={cta ? `${title}. ${description}` : undefined}
	aria-disabled={cta ? undefined : true}
	class={[
		'flex w-full select-none flex-row items-center justify-between rounded-lg px-4 py-3 no-underline transition-all duration-[300ms] ease-out-cubic',
		isInteractive ? 'group group-interactive cursor-pointer' : '',
		isComingSoon
			? 'scale-[98%] opacity-50'
			: isInteractive
				? 'scale-[98%] hover:scale-100 hover:bg-stone-150 active:scale-100 active:bg-stone-200 hover:text-inherit active:text-inherit'
				: 'scale-[98%]'
	]}
>
	<div class="flex min-w-0 flex-row items-center gap-3">
		<div
			class="h-11 w-11 shrink-0 overflow-hidden rounded-lg text-stone-900 transition-all duration-[300ms] ease-out-cubic [&>svg]:block [&>svg]:size-full"
		>
			{#if iconSvg}
				{@html iconSvg}
			{/if}
		</div>
		<div class="flex min-w-0 flex-col gap-0">
			<h3 class="leading-5">{title}</h3>
			<p>
				{shortDescription}{#if suffixWords.length}
					<span class="suffix-tail">
						{#each suffixWords as word, i}
							<span class="suffix-word" style="--i: {i}">{word}</span>
						{/each}
					</span>
				{/if}
			</p>
		</div>
	</div>
	<div class="flex shrink-0 items-center justify-end pl-4 text-right font-display font-bold text-stone-500">
		<div
			class={isInteractive
				? 'cta-swap relative inline-flex w-fit items-center justify-end'
				: 'inline-flex items-center gap-3'}
		>
			<span
				class={isInteractive
					? 'swap-layer swap-layer--date inline-flex items-center gap-3'
					: 'inline-flex items-center gap-3'}
			>
				{#if isNew}
					<span
						class="new-chip hidden min-[550px]:inline-flex shrink-0 flex-row items-center rounded-lg bg-[#E2FCFF] px-3 py-1 font-display font-bold text-[#04434B]"
					>
						New!
					</span>
				{/if}
				<ProjectTagIcons tags={featuredTags} />
				{endDateLabel}
			</span>
			{#if isInteractive}
				<span class="swap-layer swap-layer--cta inline-flex items-center gap-1 whitespace-nowrap">
					{hoverLabel}
					<Icon name="north_east" class="size-5" />
				</span>
			{/if}
		</div>
	</div>
</svelte:element>

<style>
	.suffix-tail {
		display: none;
		max-width: 0;
		gap: 0.25em;
		margin-left: 0.25em;
		overflow: hidden;
		vertical-align: bottom;
		white-space: nowrap;
		transition: max-width 200ms var(--ease-out-cubic);
	}

	@media (min-width: 800px) {
		.suffix-tail {
			display: inline-flex;
		}
	}

	.group-interactive:hover .suffix-tail {
		max-width: 60ch;
	}

	.suffix-word {
		opacity: 0;
		transition:
			opacity 120ms var(--ease-out-cubic);
		transition-delay: 0ms;
	}

	.group-interactive:hover .suffix-word {
		opacity: 1;
		transition-delay: calc(var(--i) * 25ms);
	}

	.cta-swap .swap-layer {
		transition:
			opacity 200ms var(--ease-out-cubic),
			transform 200ms var(--ease-out-cubic),
			filter 200ms var(--ease-out-cubic);
	}

	.cta-swap .swap-layer--date {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
	}

	.cta-swap .swap-layer--cta {
		position: absolute;
		inset-block: 0;
		right: 0;
		display: inline-flex;
		align-items: center;
		width: max-content;
		white-space: nowrap;
		opacity: 0;
		transform: translateY(0.75rem);
		filter: blur(2px);
		pointer-events: none;
	}

	.group-interactive:hover .cta-swap .swap-layer--date {
		opacity: 0;
		transform: translateY(-0.75rem);
		filter: blur(2px);
		pointer-events: none;
	}

	.group-interactive:hover .cta-swap .swap-layer--cta {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
		pointer-events: auto;
	}
</style>
