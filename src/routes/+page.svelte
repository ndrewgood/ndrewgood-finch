<script lang="ts">
	let { data } = $props();
	import { Button } from '$lib/components';
	import AllWorkGridCard from '$lib/components/AllWorkGridCard.svelte';
	import AllWorkRow from '$lib/components/AllWorkRow.svelte';
	import FeaturedProject from '$lib/components/FeaturedProject.svelte';
	import Footer, { FOOTER_HEIGHT } from '$lib/components/Footer.svelte';
	import LayoutViewControl, { type LayoutView } from '$lib/components/LayoutViewControl.svelte';
	import { openNavPanel } from '$lib/nav.svelte';

	let allWorkSection: HTMLElement | undefined = $state();
	let layoutView = $state<LayoutView>('list');
	let viewGeneration = $state(0);

	function handleLayoutViewChange() {
		viewGeneration += 1;
	}
</script>

<div class="relative z-[1] bg-stone-100" style:margin-bottom="{FOOTER_HEIGHT}px">
	<section class="mx-auto flex h-[700px] max-w-lg flex-col items-center justify-center gap-6 py-20">
		{#if data.heroTextHtml}
			<div class="display text-center" data-hero-rich-text>
				{@html data.heroTextHtml}
			</div>
		{/if}
		<Button onclick={() => openNavPanel('Info')}>More about me</Button>
	</section>
	<section class="mx-auto flex flex-col items-center gap-18 pb-24">
		<div class="flex flex-col gap-3">
			<h3 class="text-center">Featured work</h3>
			<div class="h-line w-[250px]"></div>
		</div>
		<div class="flex flex-col gap-24 w-full px-8 max-w-3xl">
			{#each data.featuredProjects as project (project.slug)}
				<FeaturedProject {...project} />
			{/each}
		</div>
	</section>
	<section
		bind:this={allWorkSection}
		class={[
			'mx-auto flex flex-col items-center gap-6 pt-12 pb-52 w-full px-6',
			layoutView === 'grid' ? 'max-w-[1000px]' : 'max-w-3xl'
		]}
	>
		<div class="flex flex-col gap-3">
			<h3 class="text-center">All work</h3>
			<div class="h-line w-[250px]"></div>
		</div>
		{#if layoutView === 'list'}
			<div class="flex w-full flex-col gap-2">
				{#each data.allProjects as project, i (project.slug)}
					<div
						class={viewGeneration > 0 ? 'stagger-fade-in' : undefined}
						style={viewGeneration > 0 ? `--stagger-delay: ${i * 40}ms` : undefined}
					>
						<AllWorkRow {...project} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="grid w-full min-[860px]:grid-cols-2 grid-cols-1 gap-6">
				{#each data.allProjects as project, i (project.slug)}
					<div
						class={viewGeneration > 0 ? 'stagger-fade-in' : undefined}
						style={viewGeneration > 0 ? `--stagger-delay: ${i * 40}ms` : undefined}
					>
						<AllWorkGridCard {...project} />
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
<LayoutViewControl target={allWorkSection} bind:layoutView onLayoutViewChange={handleLayoutViewChange} />
<Footer />
