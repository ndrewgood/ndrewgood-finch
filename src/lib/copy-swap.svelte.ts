import { onDestroy, tick } from 'svelte';

export type LayerState = 'shown' | 'exitHidden' | 'enterHidden';

export const COPY_DISPLAY_MS = 2000;
export const COPY_SWAP_MS = 200;

export function layerClass(state: LayerState) {
	switch (state) {
		case 'shown':
			return 'swap-layer--shown';
		case 'exitHidden':
			return 'swap-layer--exit-hidden';
		case 'enterHidden':
			return 'swap-layer--enter-hidden';
	}
}

export function defaultIconClass(state: LayerState) {
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

export function createCopySwap(getText: () => string) {
	let copied = $state(false);
	let defaultLayer = $state<LayerState>('shown');
	let successLayer = $state<LayerState>('enterHidden');
	let suppressSwapTransition = $state(false);
	let resetTimeout: ReturnType<typeof setTimeout> | undefined;

	async function resetCopied() {
		suppressSwapTransition = true;
		defaultLayer = 'enterHidden';
		await tick();
		await nextFrame();

		suppressSwapTransition = false;
		defaultLayer = 'shown';
		successLayer = 'exitHidden';
		copied = false;

		await wait(COPY_SWAP_MS);

		suppressSwapTransition = true;
		successLayer = 'enterHidden';
		await tick();
		suppressSwapTransition = false;
	}

	async function copy() {
		if (copied) return;

		try {
			await navigator.clipboard.writeText(getText());
		} catch {
			return;
		}

		defaultLayer = 'exitHidden';
		successLayer = 'shown';
		copied = true;

		clearTimeout(resetTimeout);
		resetTimeout = setTimeout(() => {
			void resetCopied();
		}, COPY_DISPLAY_MS);
	}

	onDestroy(() => {
		clearTimeout(resetTimeout);
	});

	return {
		get copied() {
			return copied;
		},
		get defaultLayer() {
			return defaultLayer;
		},
		get successLayer() {
			return successLayer;
		},
		get suppressSwapTransition() {
			return suppressSwapTransition;
		},
		copy,
		layerClass,
		defaultIconClass
	};
}
