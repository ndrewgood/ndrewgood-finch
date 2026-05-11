<script lang="ts">
	import { Button } from '$lib/components';
</script>

<svelte:head>
	<title>Components | Finch</title>
</svelte:head>

<main class="mx-auto max-w-5xl space-y-10 px-6 py-10">
	<header class="space-y-2">
		<h1 class="text-center font-display text-3xl font-bold text-stone-900">Components</h1>
	</header>

	<section class="space-y-4 rounded-lg border border-stone-300 p-6">
		<h2 class="font-display text-xl font-semibold text-stone-900">Button</h2>

		<div class="flex flex-wrap items-center gap-3">
			<Button>Default</Button>
			<Button size="large">Large</Button>
		</div>
	</section>
</main>
