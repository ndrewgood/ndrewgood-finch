<script lang="ts">
	import { expoOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	import type { ExperienceEntry } from '$lib/types/experience';

	import { Icon } from '$lib/components';

	const slideTransition = { duration: 300, easing: expoOut };

	type Props = {
		entry: ExperienceEntry;
		expanded: boolean;
		onToggle: () => void;
	};

	let { entry, expanded, onToggle }: Props = $props();

	const dateRange = $derived(
		[entry.startMonthYear, entry.endMonthYear].filter(Boolean).join(' - ')
	);
	const hasDescription = $derived(entry.descriptionHtml.trim().length > 0);
</script>

<div
	class={[
		'select-none rounded-xl transition-colors duration-[120ms] ease-out-cubic hover:bg-stone-100',
		expanded && 'bg-stone-100'
	]
		.filter(Boolean)
		.join(' ')}
>
	<button
		type="button"
		class="group flex w-full cursor-pointer flex-row items-center gap-4 px-6 py-5 text-left"
		aria-expanded={expanded}
		aria-label={expanded ? `Collapse ${entry.company}` : `Expand ${entry.company}`}
		onclick={onToggle}
	>
		<div class="flex w-full flex-row items-center gap-4">
			<div
				class="size-7 shrink-0 overflow-hidden text-stone-900 [&>svg]:block [&>svg]:size-full"
			>
				{#if entry.iconSvg}
					{@html entry.iconSvg}
				{/if}
			</div>
			<div class="flex flex-col justify-center gap-1">
				<h4 class="text-xl leading-5">{entry.company}</h4>
				{#if dateRange}
					<p class="text-sm leading-4 text-stone-400">{dateRange}</p>
				{/if}
			</div>
		</div>
		<p class="w-full text-base leading-4">{entry.title}</p>
		<span
			class="flex shrink-0 items-center justify-center rounded-full p-2 opacity-30 transition-all duration-[120ms] ease-out-cubic group-hover:opacity-80"
			aria-hidden="true"
		>
			<Icon name={expanded ? 'remove' : 'add'} class="size-6" />
		</span>
	</button>

	{#if expanded && hasDescription}
		<div
			transition:slide={slideTransition}
			class="experience-description px-6 pb-5 text-base leading-relaxed text-stone-400"
		>
			{@html entry.descriptionHtml}
		</div>
	{/if}
</div>

<style>
	.experience-description :global(p + p) {
		margin-top: 0.75rem;
	}

	.experience-description :global(strong) {
		color: var(--color-stone-900);
		font-weight: 700;
	}

	.experience-description :global(a) {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
