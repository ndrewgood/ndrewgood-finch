<script lang="ts">
	import type { AllProjectListItem } from '$lib/types/project';

	import Icon from './Icon.svelte';
	import MuxVideo from './MuxVideo.svelte';
	import ProjectTagIcons from './ProjectTagIcons.svelte';

	let {
		title,
		shortDescription,
		description,
		iconSvg,
		endDateLabel,
		tags,
		featuredTags,
		videoId,
		cta,
		ctaText
	}: AllProjectListItem = $props();

	let isHovered = $state(false);
	let isPaused = $state(true);
	let toggleVideoPlayback: (() => void) | undefined;

	const hoverLabel = $derived(ctaText);
	const isNew = $derived(tags.includes('New'));
	const isComingSoon = $derived(tags.includes('Coming Soon'));
	const isInteractive = $derived(Boolean(cta));
	const isVideoInteractive = $derived(Boolean(videoId) && !cta);
	const showPointer = $derived(isInteractive || isVideoInteractive);

	function handleCardClick() {
		if (isVideoInteractive) toggleVideoPlayback?.();
	}
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
		'flex w-full flex-col gap-4 rounded-2xl p-4 no-underline select-none transition-all duration-[300ms] ease-out-cubic',
		isInteractive ? 'group group-interactive' : '',
		showPointer ? 'cursor-pointer' : '',
		isComingSoon
			? 'scale-[98%] opacity-50'
			: isInteractive
				? 'scale-[98%] hover:scale-100 hover:bg-stone-150 active:scale-100 active:bg-stone-200 hover:text-inherit active:text-inherit'
				: 'scale-[98%]'
	]}
	onclick={handleCardClick}
	onmouseenter={() => {
		if (isInteractive || videoId) isHovered = true;
	}}
	onmouseleave={() => {
		isHovered = false;
	}}
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
		<div class="flex shrink-0 items-center justify-end text-right font-display font-bold text-stone-500">
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
							class="new-chip hidden min-[1020px]:inline-flex shrink-0 flex-row items-center rounded-lg bg-[#E2FCFF] px-3 py-1 font-display font-bold text-[#04434B]"
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
	</div>

	{#if videoId}
		<MuxVideo
			playbackId={videoId}
			{title}
			inView={isHovered}
			interactive={false}
			onRegisterToggle={(toggle) => {
				toggleVideoPlayback = toggle;
			}}
			bind:isPaused
		/>
	{:else}
		<div class="aspect-[4/3] w-full rounded-2xl bg-stone-200"></div>
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
