<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';

	import GlobalNav from '$lib/components/GlobalNav';
	import { faviconActive, initDynamicFavicon } from '$lib/favicon';

	let { data, children } = $props();

	onMount(() => initDynamicFavicon());
</script>

<svelte:head>
	<link rel="icon" href={faviconActive} data-dynamic-favicon />
	<meta property="og:image" content={data.ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={data.ogImageUrl} />
	<meta name="theme-color" content="#f5f5f4" />
</svelte:head>
<GlobalNav
	experience={data.experience}
	pastSites={data.pastSites}
	colophonHtml={data.colophonHtml}
	infoBioHtml={data.infoBioHtml}
/>
<main>
	{@render children()}
</main>
