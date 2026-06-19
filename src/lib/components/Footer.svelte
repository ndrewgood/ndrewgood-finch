<script lang="ts" module>
	export const FOOTER_HEIGHT = 500;

	const THEME_STONE_100 = '#f5f5f4';
	const THEME_BLUE_500 = '#3b82f6';
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import peace from '$lib/assets/peace.svg';
	import { Button } from '$lib/components';
	import { openNavPanel } from '$lib/nav.svelte';

	let footerEl = $state<HTMLElement | undefined>();

	function isIOSWebKit() {
		return /iP(hone|od|ad)/.test(navigator.userAgent);
	}

	function getFooterRevealProgress() {
		const maxScroll = Math.max(
			0,
			document.documentElement.scrollHeight - window.innerHeight
		);
		const revealStart = maxScroll - FOOTER_HEIGHT;

		if (window.scrollY <= revealStart) return 0;
		if (window.scrollY >= maxScroll) return 1;

		return (window.scrollY - revealStart) / FOOTER_HEIGHT;
	}

	function setThemeColor(color: string) {
		let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
		if (!meta) {
			meta = document.createElement('meta');
			meta.name = 'theme-color';
			document.head.appendChild(meta);
		}

		if (meta.content !== color) {
			meta.content = color;
		}
	}

	function syncIOSFooterReveal() {
		if (!footerEl) return;

		const progress = getFooterRevealProgress();
		footerEl.style.transform = `translateY(${(1 - progress) * 100}%)`;
		setThemeColor(progress > 0.35 ? THEME_BLUE_500 : THEME_STONE_100);
	}

	onMount(() => {
		if (!isIOSWebKit()) return;

		document.documentElement.dataset.iosWebkit = '';

		syncIOSFooterReveal();

		const onScroll = () => syncIOSFooterReveal();
		const onResize = () => syncIOSFooterReveal();

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onResize);

		return () => {
			delete document.documentElement.dataset.iosWebkit;
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);

			if (footerEl) footerEl.style.transform = '';
			setThemeColor(THEME_STONE_100);
		};
	});
</script>

<footer
	bind:this={footerEl}
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
