<script lang="ts">
	import type { IconName } from '$lib/assets/icons';

	import Icon from './Icon.svelte';

	let { label }: { label: string } = $props();

	const tagIcons: Record<string, IconName> = {
		Design: 'design_services',
		Development: 'code_xml',
		'Physical Computing': 'developer_board',
		'Physical computing': 'developer_board'
	};

	const icon = $derived(tagIcons[label]);
</script>

<div
	class="flex h-fit flex-row items-center gap-1.5 rounded-lg bg-stone-200 px-3 py-1 font-display font-bold text-stone-500"
>
	{#if icon}
		<Icon name={icon} class="size-4" />
	{/if}
	{label}
</div>
