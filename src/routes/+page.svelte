<script lang="ts">
	let { data } = $props();
	import { Button } from '$lib/components';
	import FeaturedProject from '$lib/components/FeaturedProject.svelte';
</script>

<section class="mx-auto max-w-lg py-20 flex flex-col items-center gap-6 h-[700px] justify-center">
	{#if data.heroTextHtml}
		<div class="display text-center" data-hero-rich-text>
			{@html data.heroTextHtml}
		</div>
	{/if}
	<Button>More about me</Button>
</section>
<section class="mx-auto flex flex-col gap-18 items-center pb-24">
	<div class="flex flex-col gap-3">
		<h3 class="text-center">Featured work</h3>
		<div class="h-line w-[250px]"></div>
	</div>
	<div class="flex flex-col gap-24">
		<FeaturedProject />
		<FeaturedProject />
		<FeaturedProject />
	</div>
</section>
<section class="mx-auto flex flex-col gap-18 items-center pb-10">
	<div class="flex flex-col gap-3">
		<h3 class="text-center">All work</h3>
		<div class="h-line w-[250px]"></div>
	</div>
</section>