<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import GlobalNav from '$lib/components/GlobalNav';
	import { browser, dev } from '$app/environment';
	import { Agentation } from 'sv-agentation';
	
	let { data, children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{#if browser && dev}
	<Agentation />
{/if}
<GlobalNav experience={data.experience} pastSites={data.pastSites} />

{@render children()}
