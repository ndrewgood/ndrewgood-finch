<script lang="ts">
	import type { PastSiteEntry } from '$lib/types/past-sites';

	import andrewMailThumbnail from '$lib/assets/spacesThumbnails/andrewMail.png?url';
	import vinylCoverHk from '$lib/assets/spacesThumbnails/vinylCover_hk.png?url';
	import vinylRecordHk from '$lib/assets/spacesThumbnails/vinylRecord_hk.png?url';

	import { Icon } from '$lib/components';

	let { pastSites = [] }: { pastSites?: PastSiteEntry[] } = $props();
</script>

<div class="flex flex-col gap-4 p-8">
	<a
		class="group flex h-fit min-h-[102px] w-full cursor-pointer flex-row items-center gap-4 rounded-xl border border-stone-200 px-6 text-left text-stone-900 no-underline transition-colors duration-[120ms] ease-out-cubic hover:bg-stone-100 hover:text-stone-900 active:text-stone-900"
		href="https://google.com"
		target="_blank"
		rel="noopener noreferrer"
	>
		<div class="hidden h-25 w-36 shrink-0 overflow-hidden min-[700px]:block">
			<div class="size-24 translate-y-7 group-hover:translate-y-5 translate-x-6 relative transition-all duration-[200ms] ease-out-cubic -rotate-6">
				<img src={vinylCoverHk} alt="Cover" class="size-full absolute left-0 top-0 z-10 group-hover:-translate-x-3 transition-all duration-[200ms] ease-out-cubic" />
				<img src={vinylRecordHk} alt="Records" class="size-full absolute left-0 top-0 group-hover:translate-x-3 transition-all duration-[200ms] ease-out-cubic" />
			</div>
		</div>
		<div class="flex min-w-0 flex-1 flex-row items-center gap-4">
			<div class="flex flex-col justify-center gap-1 py-3">
				<h4 class="text-xl leading-5">Records</h4>
				<p class="text-sm leading-4 text-stone-400">An archive of all of the vinyl records I own, with some additional personal notes</p>
			</div>
		</div>
		<span
			class="flex shrink-0 items-center justify-center rounded-full p-2 opacity-30 transition-all duration-[200ms] ease-out-cubic group-hover:opacity-80"
			aria-hidden="true"
		>
			<Icon name="arrow_right_alt" class="size-6" />
		</span>
	</a>
	<a
		class="group flex h-fit min-h-[102px] w-full cursor-pointer flex-row items-center gap-4 rounded-xl border border-stone-200 px-6 text-left text-stone-900 no-underline transition-colors duration-[120ms] ease-out-cubic hover:bg-stone-100 hover:text-stone-900 active:text-stone-900"
		href="https://andrewmail.substack.com"
	target="_blank"
	rel="noopener noreferrer"
	>
		<div class="hidden h-25 w-36 shrink-0 overflow-hidden min-[700px]:block">
			<img
				src={andrewMailThumbnail}
				alt="Andrew Mail"
				class="size-38 -translate-x-1 translate-y-1 object-cover transition-transform duration-[120ms] ease-out-cubic group-hover:-translate-y-2"
			/>
		</div>
		<div class="flex min-w-0 flex-1 flex-row items-center gap-4 py-3">
			<div class="flex flex-col justify-center gap-1">
				<h4 class="text-xl leading-5">Andrew Mail</h4>
				<p class="text-sm leading-4 text-stone-400">My quarterly newsletter for friends and family where I document whats going on in my life</p>
			</div>
		</div>
		<span
			class="flex shrink-0 items-center justify-center rounded-full p-2 opacity-30 transition-all duration-[120ms] ease-out-cubic group-hover:opacity-80"
			aria-hidden="true"
		>
			<Icon name="arrow_right_alt" class="size-6" />
		</span>
	</a>
</div>

<div class="mt-8 flex flex-col gap-2">
	<h3 class="text-center">Past sites</h3>
	<div class="h-line-light w-[250px]"></div>
</div>

<div class="flex flex-col gap-2 p-8">
	{#each pastSites as site (site.dateRange)}
		<a
			class="group flex w-full scale-[98%] cursor-pointer flex-row items-center gap-4 rounded-xl px-6 py-5 text-left text-stone-900 no-underline transition-all duration-[300ms] ease-out-cubic hover:scale-100 hover:bg-stone-100 hover:text-stone-900 active:scale-100 active:text-stone-900"
			href={site.link}
			target="_blank"
			rel="noopener noreferrer"
		>
			<div class="flex w-full flex-row items-center gap-4">
				<div class="flex flex-col justify-center gap-1">
					<h4 class="text-xl leading-5">{site.dateRange}</h4>
					<p class="text-sm leading-4 text-stone-400">{site.description}</p>
				</div>
			</div>
			<span
				class="flex shrink-0 items-center justify-center rounded-full p-2 opacity-30 transition-all duration-[120ms] ease-out-cubic group-hover:opacity-80"
				aria-hidden="true"
			>
				<Icon name="arrow_right_alt" class="size-6" />
			</span>
		</a>
	{/each}
</div>
