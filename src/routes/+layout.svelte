<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import GlobalNav from '$lib/components/GlobalNav.svelte';
	
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<GlobalNav />
{@render children()}
