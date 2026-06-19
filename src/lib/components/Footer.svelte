<script lang="ts" module>
	export const FOOTER_HEIGHT = 500;
</script>

<script lang="ts">
	import peace from '$lib/assets/peace.svg';
	import { Button } from '$lib/components';
	import { openNavPanel } from '$lib/nav.svelte';
</script>

<footer
	class="site-footer fixed inset-x-0 bottom-0 z-0 flex flex-col items-center justify-center gap-3 bg-blue-500"
	style:height="{FOOTER_HEIGHT}px"
>
	<img src={peace} alt="Peace" class="h-26 w-26" />
	<h1 class="text-[40px] text-white">Let's chat!</h1>
	<div class="mt-4 flex gap-3">
		<Button
			copyText="hey@ndrewgood.com"
			shadow="shadow-[0_3px_0_0_rgba(0,0,0,0.3)]"
			icon="content_copy_outline"
			iconPosition="trailing"
		>Copy email</Button>
		<Button
			shadow="shadow-[0_3px_0_0_rgba(0,0,0,0.3)]"
			iconHover
			icon="north_east"
			iconPosition="trailing"
			onclick={() => window.open('https://linkedin.com/in/ndrewgood', '_blank')}
		>LinkedIn</Button>
	</div>
	<p class="text-md font-display text-blue-300">
		or... you can
		<button
			type="button"
			class="cursor-pointer underline decoration-1 underline-offset-3 transition-all duration-150 ease-out-cubic hover:text-white"
			onclick={() => openNavPanel('Contact')}
		>send me a voice memo</button>!
	</p>
</footer>
