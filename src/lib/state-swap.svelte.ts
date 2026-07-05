import { tick } from 'svelte';

import { COPY_SWAP_MS, layerClass, type LayerState } from '$lib/copy-swap.svelte';

function wait(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function createStateSwap<T extends string>(
	initial: T,
	allStates: readonly T[],
	swapMs: number = COPY_SWAP_MS
) {
	const layerStates = $state(
		Object.fromEntries(
			allStates.map((state) => [state, state === initial ? 'shown' : 'enterHidden'])
		) as Record<T, LayerState>
	);

	let current = $state(initial);
	let suppressTransition = $state(false);

	async function transitionTo(next: T) {
		if (current === next) return;

		const previous = current;
		layerStates[previous] = 'exitHidden';
		layerStates[next] = 'shown';
		current = next;

		await wait(swapMs);

		suppressTransition = true;
		layerStates[previous] = 'enterHidden';
		await tick();
		suppressTransition = false;
	}

	function getLayerClass(state: T) {
		return layerClass(layerStates[state]);
	}

	return {
		get current() {
			return current;
		},
		get suppressTransition() {
			return suppressTransition;
		},
		transitionTo,
		getLayerClass
	};
}
