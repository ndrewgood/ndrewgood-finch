<script lang="ts">
	import { onDestroy, tick } from 'svelte';

	import { Icon } from '$lib/components';

	const EMAIL = 'hey@ndrewgood.com';
	const DISPLAY_MS = 2000;
	const SWAP_MS = 200;

	type LayerState = 'shown' | 'exitHidden' | 'enterHidden';

	const buttonClass =
		'group flex w-full cursor-pointer bg-stone-100 flex-row items-center gap-4 rounded-xl px-6 py-5 text-left text-stone-900 no-underline transition-colors duration-[120ms] ease-out-cubic hover:bg-stone-200 hover:text-stone-900 active:bg-stone-300';

	const copyIconWrapperClass =
		'flex shrink-0 items-center justify-center rounded-full p-2';

	const successIconWrapperClass =
		'flex shrink-0 items-center justify-center rounded-full p-2';

	let copied = $state(false);
	let defaultLayer = $state<LayerState>('shown');
	let successLayer = $state<LayerState>('enterHidden');
	let suppressSwapTransition = $state(false);
	let resetTimeout: ReturnType<typeof setTimeout> | undefined;

	function layerClass(state: LayerState) {
		switch (state) {
			case 'shown':
				return 'swap-layer--shown';
			case 'exitHidden':
				return 'swap-layer--exit-hidden';
			case 'enterHidden':
				return 'swap-layer--enter-hidden';
		}
	}

	function defaultIconClass(state: LayerState) {
		switch (state) {
			case 'shown':
				return 'swap-icon--shown';
			case 'exitHidden':
				return 'swap-layer--exit-hidden';
			case 'enterHidden':
				return 'swap-layer--enter-hidden';
		}
	}

	function wait(ms: number) {
		return new Promise<void>((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	function nextFrame() {
		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => resolve());
			});
		});
	}

	async function resetCopied() {
		suppressSwapTransition = true;
		defaultLayer = 'enterHidden';
		await tick();
		await nextFrame();

		suppressSwapTransition = false;
		defaultLayer = 'shown';
		successLayer = 'exitHidden';
		copied = false;

		await wait(SWAP_MS);

		suppressSwapTransition = true;
		successLayer = 'enterHidden';
		await tick();
		suppressSwapTransition = false;
	}

	async function copyEmail() {
		if (copied) return;

		try {
			await navigator.clipboard.writeText(EMAIL);
		} catch {
			return;
		}

		defaultLayer = 'exitHidden';
		successLayer = 'shown';
		copied = true;

		clearTimeout(resetTimeout);
		resetTimeout = setTimeout(() => {
			void resetCopied();
		}, DISPLAY_MS);
	}

	onDestroy(() => {
		clearTimeout(resetTimeout);
	});
</script>

<button type="button" class={buttonClass} onclick={copyEmail} aria-live="polite">
	<div class="flex min-w-0 flex-1 flex-row items-center gap-4">
		<div class="swap-text grid min-w-0 items-center">
			<div
				class={[
					'swap-layer col-start-1 row-start-1 flex min-w-0 items-center',
					layerClass(defaultLayer),
					suppressSwapTransition && 'swap-layer--no-transition'
				]}
			>
				<div class="flex flex-col justify-center gap-1">
					<h4 class="text-xl leading-5">Copy email</h4>
					<p class="text-sm leading-4 text-stone-400">{EMAIL}</p>
				</div>
			</div>
			<div
				class={[
					'swap-layer col-start-1 row-start-1 flex min-w-0 items-center',
					layerClass(successLayer),
					suppressSwapTransition && 'swap-layer--no-transition'
				]}
			>
				<h4 class="text-xl leading-5">Email copied!</h4>
			</div>
		</div>
	</div>
	<span class="relative inline-grid shrink-0 place-items-center">
		<span
			class={[
				copyIconWrapperClass,
				'swap-layer col-start-1 row-start-1',
				defaultIconClass(defaultLayer),
				suppressSwapTransition && 'swap-layer--no-transition'
			]}
			aria-hidden="true"
		>
			<Icon name="content_copy_outline" class="size-6" />
		</span>
		<span
			class={[
				successIconWrapperClass,
				'swap-layer col-start-1 row-start-1',
				layerClass(successLayer),
				suppressSwapTransition && 'swap-layer--no-transition'
			]}
			aria-hidden="true"
		>
			<Icon name="check" class="size-6" />
		</span>
	</span>
</button>

<style>
	.swap-layer {
		transition:
			opacity 200ms var(--ease-out-cubic),
			transform 200ms var(--ease-out-cubic),
			filter 200ms var(--ease-out-cubic);
	}	

	.swap-layer--no-transition {
		transition: none;
	}

	.swap-layer--shown {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
	}

	.swap-layer--exit-hidden {
		opacity: 0;
		transform: translateY(-0.75rem);
		filter: blur(2px);
		pointer-events: none;
	}

	.swap-layer--enter-hidden {
		opacity: 0;
		transform: translateY(0.75rem);
		filter: blur(2px);
		pointer-events: none;
	}

	.swap-icon--shown {
		opacity: 0.3;
		transform: translateY(0);
		filter: blur(0);
	}

	button:hover .swap-icon--shown {
		opacity: 0.8;
	}
</style>
