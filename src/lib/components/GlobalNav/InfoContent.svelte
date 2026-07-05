<script lang="ts">
	import type { ExperienceEntry } from '$lib/types/experience';

	import ExperienceRow from './ExperienceRow.svelte';
	import { Button } from '$lib/components';
	import InfoPhotoCarousel from './InfoPhotoCarousel.svelte';

	let {
		experience = [],
		colophonHtml = null,
		infoBioHtml = null
	}: {
		experience?: ExperienceEntry[];
		colophonHtml?: string | null;
		infoBioHtml?: string | null;
	} = $props();

	let expandedLabel = $state<string | null>(null);

	function toggleExpanded(label: string) {
		expandedLabel = expandedLabel === label ? null : label;
	}
</script>

<div class="mt-2 flex flex-col items-center gap-5 p-8 min-[700px]:flex-row min-[700px]:items-start">
	<InfoPhotoCarousel />
	{#if infoBioHtml}
		<div class="info-bio">
			{@html infoBioHtml}
		</div>
	{/if}
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
	.info-bio :global(p) {
		font-size: 1.125rem;
		line-height: 24px;
		color: var(--color-stone-400);
	}

	.info-bio :global(p + p) {
		margin-top: 1rem;
	}

	.info-bio :global(p:first-child) {
		margin-top: 0;
	}

	@media (min-width: 700px) {
		.info-bio :global(p:first-child) {
			margin-top: 1rem;
		}
	}

	.info-bio :global(strong) {
		color: var(--color-stone-900);
		font-weight: inherit;
	}

	.info-bio :global(a) {
		font-size: 1.125rem;
		line-height: 24px;
		color: inherit;
		text-decoration: underline;
		text-decoration-color: var(--color-stone-300);
		text-underline-offset: 3px;
		transition: text-decoration-color 150ms var(--ease-out-cubic);
	}

	.info-bio :global(a:hover) {
		text-decoration-color: var(--color-stone-800);
	}

	.colophon :global(p + p) {
		margin-top: 0.5rem;
	}

	.colophon :global(a) {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>