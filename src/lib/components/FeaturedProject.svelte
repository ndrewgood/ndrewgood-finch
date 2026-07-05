<script lang="ts">
	import type { FeaturedProjectData } from '$lib/types/project';

	import Button from './Button.svelte';
	import MuxVideo from './MuxVideo.svelte';
	import ProjectTag from './ProjectTag.svelte';

	let { title, description, iconSvg, tags, videoId, cta, ctaText }: FeaturedProjectData = $props();

	let isPaused = $state(true);
</script>

<div class="relative">
	<div class="relative flex flex-col gap-6">
		<div class="flex flex-row items-center justify-between">
			<div class="flex flex-row gap-3">
				<div
					class="size-11 shrink-0 overflow-hidden rounded-lg bg-stone-300 text-stone-900 [&>svg]:block [&>svg]:size-full"
				>
					{#if iconSvg}
						{@html iconSvg}
					{/if}
				</div>
				<div class="flex flex-col gap-0">
					<h3 class="leading-5">{title}</h3>
					<p class="min-[600px]:text-base text-sm">{description}</p>
				</div>
			</div>
			<div class="min-[750px]:flex hidden flex-row gap-3">
				{#each tags as tag (tag)}
					<ProjectTag label={tag} />
				{/each}
			</div>
		</div>
		{#if videoId}
			<MuxVideo playbackId={videoId} {title} bind:isPaused />
		{:else}
			<div class="aspect-[4/3] w-full rounded-xl bg-stone-150"></div>
		{/if}
		{#if cta}
			<Button
				iconPosition="trailing"
				iconHover
				icon="north_east"
				onclick={() => window.open(cta, '_blank', 'noopener,noreferrer')}
			>
				{ctaText}
			</Button>
		{:else}
			<Button iconPosition="trailing" iconHover icon="north_east">{ctaText}</Button>
		{/if}
	</div>
</div>
