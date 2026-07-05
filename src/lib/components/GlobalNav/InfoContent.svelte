<script lang="ts">
	import type { ExperienceEntry } from '$lib/types/experience';

	import ExperienceRow from './ExperienceRow.svelte';
	import { Button } from '$lib/components';
	import InfoPhotoCarousel from './InfoPhotoCarousel.svelte';

	let { experience = [], colophonHtml = null }: { experience?: ExperienceEntry[]; colophonHtml?: string | null } =
		$props();

	let expandedLabel = $state<string | null>(null);

	function toggleExpanded(label: string) {
		expandedLabel = expandedLabel === label ? null : label;
	}
</script>

<div class="mt-2 flex flex-col items-center gap-5 p-8 min-[700px]:flex-row min-[700px]:items-start">
	<InfoPhotoCarousel />
	<div class="flex flex-col gap-4">
		<p class="mt-0 text-lg leading-[24px] text-stone-400 min-[700px]:mt-4">
			I'm <span class="text-stone-900">Andrew Goodridge</span>, a designer and web developer who loves
			to make digital products of all shapes and sizes. I currently work at
			<span class="text-stone-900">Google</span> as an Interaction designer in NYC.
		</p>
		<p class="text-lg leading-[24px] text-stone-400">
			I've been making websites for over 10 years, some of which have been featured in
			<span class="text-stone-900">showcases</span>,
			<span class="text-stone-900">articles</span>, and
			<span class="text-stone-900">publications</span>.
		</p>
	</div>
</div>

<div class="flex flex-col gap-2 mt-8">
	<h3 class="text-center">Experience</h3>
	<div class="h-line-light w-[250px]"></div>
</div>

<div class="flex flex-col gap-3 px-4 py-6 min-[700px]:p-8">
	{#each experience as entry (entry.label)}
		<ExperienceRow
			{entry}
			expanded={expandedLabel === entry.label}
			onToggle={() => toggleExpanded(entry.label)}
		/>
	{/each}
</div>

<div class="flex justify-center pb-12">
	<Button
		variant="text"
		iconHover
		icon="north_east"
		iconPosition="trailing"
		onclick={() =>
			window.open(
				'https://docs.google.com/document/d/1x_PenvOjmvEvuvBfDN1WLW0QFO7iYJlkzArQvboT2Us/edit?usp=sharing',
				'_blank',
				'noopener,noreferrer'
			)}
	>
		View full resume
	</Button>
</div>

<div class="flex flex-col gap-2 mt-8">
	<h3 class="text-center">Colophon</h3>
	<div class="h-line-light w-[250px]"></div>
</div>

{#if colophonHtml}
	<div class="colophon mx-auto mt-4 flex max-w-xl flex-col p-6 pb-24 text-center">
		{@html colophonHtml}
	</div>
{/if}

<style>
	.colophon :global(p + p) {
		margin-top: 0.5rem;
	}

	.colophon :global(a) {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>