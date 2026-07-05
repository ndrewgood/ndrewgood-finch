<script lang="ts">
	import { onMount, tick } from 'svelte';

	import { wrapHeroWords } from '$lib/hero-text';

	let {
		html,
		onReady
	}: {
		html: string;
		onReady?: () => void;
	} = $props();

	let root = $state<HTMLElement | undefined>();
	let prepared = $state(false);

	onMount(async () => {
		if (!root) return;

		wrapHeroWords(root);
		await tick();
		prepared = true;
		onReady?.();
	});
</script>

<div
	bind:this={root}
	class={['display text-center', prepared ? 'hero-text--ready' : 'hero-text--preparing']}
	data-hero-rich-text
>
	{@html html}
</div>
