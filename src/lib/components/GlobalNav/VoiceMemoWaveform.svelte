<script lang="ts">
	import { VOICE_MEMO_CONFIG } from '$lib/voice-memo.config';

	const { waveform } = VOICE_MEMO_CONFIG;

	type Props = {
		samples: number[];
		progressIndex?: number | null;
		animate?: boolean;
		align?: 'start' | 'end';
	};

	let {
		samples,
		progressIndex = null,
		animate = false,
		align = 'start'
	}: Props = $props();

	function dotHeight(sample: number): number {
		const shaped = Math.pow(sample, waveform.heightCurveExponent);
		return waveform.minDotSizePx + shaped * (waveform.maxDotSizePx - waveform.minDotSizePx);
	}

	let viewportEl = $state<HTMLDivElement | null>(null);
	let viewportWidth = $state(0);
	let slideOffset = $state(0);
	let previousLength = 0;

	const isPlayback = $derived(progressIndex !== null);

	const playbackScrollOffset = $derived.by(() => {
		if (!isPlayback || viewportWidth === 0 || samples.length === 0) {
			return 0;
		}

		const totalWidth = samples.length * waveform.dotStepPx - waveform.dotGapPx;

		if (totalWidth <= viewportWidth) {
			return 0;
		}

		const playheadX = viewportWidth * 0.45;
		const offset = playheadX - progressIndex! * waveform.dotStepPx;
		const minOffset = viewportWidth - totalWidth;

		return Math.max(minOffset, Math.min(0, offset));
	});

	const trackTransform = $derived.by(() => {
		if (animate && slideOffset) {
			return `translateX(${slideOffset}px)`;
		}

		if (isPlayback && playbackScrollOffset !== 0) {
			return `translateX(${playbackScrollOffset}px)`;
		}

		return undefined;
	});

	$effect(() => {
		const el = viewportEl;
		if (!el) return;

		const updateWidth = () => {
			viewportWidth = el.clientWidth;
		};

		updateWidth();

		const observer = new ResizeObserver(updateWidth);
		observer.observe(el);

		return () => observer.disconnect();
	});

	$effect(() => {
		const length = samples.length;

		if (!animate) {
			slideOffset = 0;
			previousLength = length;
			return;
		}

		if (length > previousLength && previousLength > 0) {
			slideOffset = -waveform.dotStepPx;
			const frame = requestAnimationFrame(() => {
				slideOffset = 0;
			});

			previousLength = length;

			return () => {
				cancelAnimationFrame(frame);
			};
		}

		previousLength = length;
	});
</script>

<div
	bind:this={viewportEl}
	class="voice-memo-waveform h-full min-w-0 flex-1 overflow-hidden"
	aria-hidden="true"
>
	<div
		class={[
			'waveform-track flex h-full items-center ease-out-cubic',
			isPlayback ? 'w-fit' : 'w-full',
			isPlayback ? 'waveform-track--playback' : 'transition-transform',
			align === 'end' ? 'justify-end' : 'justify-start'
		]}
		style:transform={trackTransform}
	>
		{#each samples as sample, index (index)}
			{#if sample > 0}
				<span
					class={[
						'waveform-dot w-1 shrink-0 rounded-full bg-stone-300 ease-out-cubic',
						isPlayback && 'waveform-dot--progress',
						isPlayback && index <= progressIndex! && 'bg-stone-500'
					]}
					style:height={`${dotHeight(sample)}px`}
				></span>
			{/if}
		{/each}
	</div>
</div>

<style>
	.waveform-track {
		gap: var(--voice-memo-waveform-gap);
		transition-duration: var(--voice-memo-waveform-slide-ms);
	}

	.waveform-track--playback {
		transition: none;
	}

	.waveform-dot {
		transition:
			height var(--voice-memo-waveform-dot-ms) var(--ease-out-cubic),
			background-color var(--voice-memo-waveform-dot-ms) var(--ease-out-cubic);
	}

	.waveform-dot--progress {
		transition: height var(--voice-memo-waveform-dot-ms) var(--ease-out-cubic);
	}
</style>
