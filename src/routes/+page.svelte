<script lang="ts">
	let { data } = $props();
	import { Button } from '$lib/components';
	import AllWorkRow from '$lib/components/AllWorkRow.svelte';
	import FeaturedProject from '$lib/components/FeaturedProject.svelte';
	import { openNavPanel } from '$lib/nav.svelte';
</script>

<section class="mx-auto max-w-lg py-20 flex flex-col items-center gap-6 h-[700px] justify-center">
	{#if data.heroTextHtml}
		<div class="display text-center" data-hero-rich-text>
			{@html data.heroTextHtml}
		</div>
	{/if}
	<Button onclick={() => openNavPanel('Info')}>More about me</Button>
</section>
<section class="mx-auto flex flex-col gap-18 items-center pb-24">
	<div class="flex flex-col gap-3">
		<h3 class="text-center">Featured work</h3>
		<div class="h-line w-[250px]"></div>
	</div>
	<div class="flex flex-col gap-24">
		{#each data.featuredProjects as project (project.slug)}
			<FeaturedProject {...project} />
		{/each}
	</div>
</section>
<section class="mx-auto flex w-3xl flex-col items-center gap-6 pb-10">
	<div class="flex flex-col gap-3">
		<h3 class="text-center">All work</h3>
		<div class="h-line w-[250px]"></div>
	</div>
	<div class="flex w-full flex-col gap-2">
		{#each data.allProjects as project (project.slug)}
			<AllWorkRow {...project} />
		{/each}
	</div>
</section>