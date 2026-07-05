<script lang="ts">
	import { getProjectTagIcon, sortProjectTags } from '$lib/utils/project-tags';

	import Icon from './Icon.svelte';

	let { tags }: { tags: string[] } = $props();

	const sortedTags = $derived(sortProjectTags(tags));
</script>

{#if sortedTags.length}
	<span class="inline-flex items-center gap-2" aria-hidden="true">
		{#each sortedTags as tag (tag)}
			{@const icon = getProjectTagIcon(tag)}
			{#if icon}
				<Icon name={icon} class="size-5" />
			{/if}
		{/each}
	</span>
{/if}
