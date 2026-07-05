<script lang="ts" module>
	export const FOOTER_HEIGHT = 500;
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import { Button } from '$lib/components';
	import { openNavPanel } from '$lib/nav.svelte';

	const REVEAL_DISTANCE = 200;
	const RESET_DISTANCE = 500;
	const CHAT_WORD_STAGGER_MS = 100;
	const CHAT_WORD_OPACITY_MS = 200;
	const CHAT_WORD_SLIDE_MS = 400;
	const CHAT_WORDS = ["Let's", 'chat!'] as const;

	const restDelayMs = 400;

	let headingRevealed = $state(false);

	function getDistanceFromBottom() {
		const maxScroll = Math.max(
			0,
			document.documentElement.scrollHeight - window.innerHeight
		);
		return maxScroll - window.scrollY;
	}

	function updateReveal() {
		const distanceFromBottom = getDistanceFromBottom();

		if (distanceFromBottom <= REVEAL_DISTANCE) {
			headingRevealed = true;
		} else if (distanceFromBottom > RESET_DISTANCE) {
			headingRevealed = false;
		}
	}

	onMount(() => {
		updateReveal();

		window.addEventListener('scroll', updateReveal, { passive: true });
		window.addEventListener('resize', updateReveal);

		return () => {
			window.removeEventListener('scroll', updateReveal);
			window.removeEventListener('resize', updateReveal);
		};
	});
</script>

<footer
	class="site-footer fixed backdrop-opacity-100 inset-x-0 bottom-0 z-0 flex flex-col items-center bg-blue-500 px-4 py-40"
	style="--footer-word-opacity-duration: {CHAT_WORD_OPACITY_MS}ms; --footer-word-slide-duration: {CHAT_WORD_SLIDE_MS}ms; --footer-rest-delay: {restDelayMs}ms;"
>
	<h1
		class={['text-[56px] text-white', headingRevealed ? 'footer-chat--revealed' : '']}
	>
		{#each CHAT_WORDS as word, index (word)}
			{#if index > 0}
				{' '}
			{/if}
			<span
				class="footer-chat-word"
				style:--footer-word-delay="{index * CHAT_WORD_STAGGER_MS}ms"
			>
				{word}
			</span>
		{/each}
	</h1>

	<div
		class={['footer-rest flex flex-col items-center gap-3', headingRevealed ? 'footer-rest--visible' : '']}
	>
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
	</div>
</footer>

<style>
	.footer-chat-word {
		display: inline-block;
		opacity: 0;
	}

	.footer-chat--revealed .footer-chat-word {
		animation:
			hero-word-opacity var(--footer-word-opacity-duration) var(--ease-out-cubic)
				var(--footer-word-delay, 0ms) forwards,
			hero-word-slide var(--footer-word-slide-duration) var(--ease-out-cubic)
				var(--footer-word-delay, 0ms) forwards;
	}

	.footer-rest {
		opacity: 0;
	}

	.footer-rest--visible {
		animation: page-load-fade-in 400ms var(--ease-out-cubic) var(--footer-rest-delay) forwards;
	}
</style>
