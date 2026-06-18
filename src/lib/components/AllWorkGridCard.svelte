<script lang="ts">
	import type { AllProjectListItem } from '$lib/types/project';

	import Icon from './Icon.svelte';
	import MuxVideo from './MuxVideo.svelte';

	let {
		title,
		shortDescription,
		description,
		iconSvg,
		endDateLabel,
		tags,
		videoId,
		cta,
		ctaText
	}: AllProjectListItem = $props();

	let isHovered = $state(false);
	let isPaused = $state(true);

	const hoverLabel = $derived(cta ? ctaText : 'Coming soon...');
	const isNew = $derived(tags.includes('New'));
	const isComingSoon = $derived(tags.includes('Coming Soon'));
</script>

<svelte:element
	this={cta ? 'a' : 'div'}
	href={cta || undefined}
	target={cta ? '_blank' : undefined}
	rel={cta ? 'noopener noreferrer' : undefined}
	aria-label={cta ? `${title}. ${description}` : undefined}
	aria-disabled={cta ? undefined : true}
	role={cta ? 'link' : 'group'}
	class={[
		'group flex w-full flex-col gap-4 rounded-2xl p-4 no-underline select-none transition-all duration-[300ms] ease-out-cubic',
		isComingSoon
			? 'scale-[98%] opacity-50'
			: 'scale-[98%] hover:scale-100 hover:bg-stone-150 active:scale-100 active:bg-stone-200 hover:text-inherit active:text-inherit',
		cta ? 'cursor-pointer' : 'cursor-not-allowed'
	]}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<div class="flex flex-row items-center justify-between gap-3">
		<div class="flex min-w-0 flex-row items-center gap-3">
			<div
				class="size-11 shrink-0 overflow-hidden rounded-lg bg-stone-300 text-stone-900 [&>svg]:block [&>svg]:size-full"
			>
				{#if iconSvg}
					{@html iconSvg}
				{/if}
			</div>
			<div class="flex min-w-0 flex-col gap-0">
				<h3 class="leading-5">{title}</h3>
				<p>{shortDescription}</p>
			</div>
		</div>
		<div
			class="flex shrink-0 items-center justify-end gap-0 text-right font-display font-bold text-stone-500"
		>
			{#if isNew}
				<span
					class="new-chip hidden min-[1000px]:flex h-fit flex-row items-center rounded-lg bg-[#E2FCFF] px-3 py-1 font-display font-bold text-[#04434B]"
				>
					New!
				</span>
			{/if}
			<div class="cta-swap grid justify-items-end">
				<span class="swap-layer swap-layer--date col-start-1 row-start-1">{endDateLabel}</span>
				<span
					class="swap-layer swap-layer--cta col-start-1 row-start-1 inline-flex items-center gap-1"
				>
					{hoverLabel}
					{#if cta}
						<Icon name="north_east" class="size-5" />
					{/if}
				</span>
			</div>
		</div>
	</div>

	{#if videoId}
		<MuxVideo playbackId={videoId} {title} inView={isHovered} interactive={false} bind:isPaused />
	{:else}
		<div class="aspect-[4/3] w-full rounded-2xl bg-stone-400"></div>
	{/if}
</svelte:element>

<style>
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
		opacity: 0;
		transform: translateY(0.75rem);
		filter: blur(2px);
		pointer-events: none;
	}

	.group:hover .cta-swap .swap-layer--date {
		opacity: 0;
		transform: translateY(-0.75rem);
		filter: blur(2px);
	}

	.group:hover .cta-swap .swap-layer--cta {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
		pointer-events: auto;
	}

	.new-chip {
		transition:
			opacity 200ms var(--ease-out-cubic),
			transform 200ms var(--ease-out-cubic),
			filter 200ms var(--ease-out-cubic);
	}

	.group:hover .new-chip {
		opacity: 0;
		transform: translateY(-0.75rem);
		filter: blur(2px);
		pointer-events: none;
	}
</style>
