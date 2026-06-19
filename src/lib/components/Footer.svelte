<script lang="ts" module>
	export const FOOTER_HEIGHT = 500;
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import peace from '$lib/assets/peace.svg';
	import { Button } from '$lib/components';
	import { openNavPanel } from '$lib/nav.svelte';

	let footerEl = $state<HTMLElement | undefined>();
	let syncRaf = 0;

	function isIOSWebKit() {
		return document.documentElement.classList.contains('ios-webkit');
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

	function applyFooterReveal(progress: number) {
		if (!footerEl) return;

		if (progress <= 0) {
			footerEl.style.transform = 'translateY(100%)';
			footerEl.style.visibility = 'hidden';
			return;
		}

		footerEl.style.visibility = 'visible';
		footerEl.style.transform = `translateY(${(1 - progress) * 100}%)`;
	}

	function syncIOSFooterReveal() {
		if (!footerEl || !isIOSWebKit()) return;

		cancelAnimationFrame(syncRaf);
		syncRaf = requestAnimationFrame(() => {
			applyFooterReveal(getFooterRevealProgress());
		});
	}

	function scheduleSyncBurst() {
		syncIOSFooterReveal();
		requestAnimationFrame(syncIOSFooterReveal);
		requestAnimationFrame(() => requestAnimationFrame(syncIOSFooterReveal));
	}

	onMount(() => {
		if (!isIOSWebKit()) return;

		scheduleSyncBurst();

		const onScroll = () => syncIOSFooterReveal();
		const onPageshow = () => scheduleSyncBurst();

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', syncIOSFooterReveal);
		window.addEventListener('pageshow', onPageshow);
		window.addEventListener('load', scheduleSyncBurst, { once: true });

		// iOS can restore scroll position after initial layout
		const restoreTimers = [100, 300, 600].map((delay) =>
			setTimeout(scheduleSyncBurst, delay)
		);

		return () => {
			cancelAnimationFrame(syncRaf);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', syncIOSFooterReveal);
			window.removeEventListener('pageshow', onPageshow);
			for (const timer of restoreTimers) clearTimeout(timer);

			if (footerEl) {
				footerEl.style.transform = '';
				footerEl.style.visibility = '';
			}
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
