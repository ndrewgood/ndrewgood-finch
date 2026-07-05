<script lang="ts">
	import { getProjectTagIcon } from '$lib/utils/project-tags';

	import Icon from './Icon.svelte';

	let { label }: { label: string } = $props();

	const icon = $derived(getProjectTagIcon(label));
</script>

<div
	class="flex h-fit flex-row items-center gap-1.5 rounded-lg bg-stone-200 px-3 py-1 font-display font-bold text-stone-500"
>
	{#if icon}
		<Icon name={icon} class="size-4" />
	{/if}
	{label}
</div>
