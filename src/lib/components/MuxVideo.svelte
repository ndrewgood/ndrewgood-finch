<script lang="ts">
	import { onMount } from 'svelte';
	import type MuxPlayerElement from '@mux/mux-player';

	type Props = {
		playbackId: string;
		title?: string;
		isPaused?: boolean;
	};

	let { playbackId, title = '', isPaused = $bindable(true) }: Props = $props();

	let ready = $state(false);
	let container = $state<HTMLDivElement | undefined>();
	let player = $state<MuxPlayerElement | undefined>();
	let isInView = $state(false);
	let userPaused = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let isScrubbing = $state(false);

	let progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	let wasPlayingBeforeScrub = false;

	onMount(async () => {
		await import('@mux/mux-player');
		ready = true;
	});

	$effect(() => {
		if (!player || !ready) return;

		const shouldPlay = isInView && !userPaused;
		if (shouldPlay && player.paused) {
			void player.play();
		} else if (!shouldPlay && !player.paused) {
			player.pause();
		}
	});

	$effect(() => {
		if (!ready || !container || !player) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				isInView = entry.isIntersecting;
			},
			{ threshold: 0.15 }
		);
		observer.observe(container);

		const onTimeUpdate = () => {
			if (!isScrubbing) {
				currentTime = player!.currentTime;
			}
			if (player!.duration && Number.isFinite(player!.duration)) {
				duration = player!.duration;
			}
		};

		const onLoadedMetadata = () => {
			if (player!.duration && Number.isFinite(player!.duration)) {
				duration = player!.duration;
			}
		};

		const onPlay = () => {
			isPaused = false;
		};

		const onPause = () => {
			isPaused = true;
		};

		isPaused = player.paused;

		player.addEventListener('timeupdate', onTimeUpdate);
		player.addEventListener('loadedmetadata', onLoadedMetadata);
		player.addEventListener('play', onPlay);
		player.addEventListener('pause', onPause);

		return () => {
			observer.disconnect();
			player!.removeEventListener('timeupdate', onTimeUpdate);
			player!.removeEventListener('loadedmetadata', onLoadedMetadata);
			player!.removeEventListener('play', onPlay);
			player!.removeEventListener('pause', onPause);
		};
	});

	function togglePlayback() {
		if (!player) return;

		if (player.paused) {
			userPaused = false;
			if (isInView) void player.play();
		} else {
			userPaused = true;
			player.pause();
		}
	}

	function scrubTo(clientX: number, slider: HTMLElement) {
		const track = slider.querySelector<HTMLElement>('[data-progress-track]');
		if (!track || !player || duration <= 0) return;

		const rect = track.getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
		currentTime = ratio * duration;
		player.currentTime = currentTime;
	}

	function handleScrubStart(event: PointerEvent) {
		event.stopPropagation();
		if (!player) return;

		wasPlayingBeforeScrub = !player.paused;
		isScrubbing = true;
		const slider = event.currentTarget as HTMLElement;
		slider.setPointerCapture(event.pointerId);
		scrubTo(event.clientX, slider);
	}

	function handleScrubMove(event: PointerEvent) {
		if (!isScrubbing) return;
		scrubTo(event.clientX, event.currentTarget as HTMLElement);
	}

	function handleScrubEnd() {
		if (!isScrubbing) return;

		isScrubbing = false;
		if (wasPlayingBeforeScrub && player && isInView && !userPaused) {
			void player.play();
		}
	}
</script>

<div class="relative" bind:this={container}>
	<div
		class={[
			'video-shell group relative aspect-[4/3] w-full origin-center overflow-hidden rounded-2xl bg-stone-150 transition-transform duration-300 ease-out-cubic',
			isPaused && 'scale-[0.98]'
		]}
	>
		{#if ready}
			<mux-player
				bind:this={player}
				playback-id={playbackId}
				metadata-video-title={title}
				muted
				loop
				playsinline
				preload="metadata"
				nohotkeys
			></mux-player>
		{/if}

		<button
			type="button"
			class="absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent p-0"
			aria-label={title ? `Play or pause ${title} video` : 'Play or pause video'}
			onclick={togglePlayback}
		></button>

		<div
			data-progress
			class={[
				'pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-5 pb-3 pt-10 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100',
				isScrubbing && 'opacity-100'
			]}
		>
			<div
				role="slider"
				tabindex="0"
				aria-label="Video progress"
				aria-valuemin={0}
				aria-valuemax={duration}
				aria-valuenow={currentTime}
				class={[
					'group/progress pointer-events-auto flex cursor-grab touch-none items-center py-3',
					isScrubbing && 'cursor-grabbing'
				]}
				onpointerdown={handleScrubStart}
				onpointermove={handleScrubMove}
				onpointerup={handleScrubEnd}
				onpointercancel={handleScrubEnd}
				onpointerleave={handleScrubEnd}
			>
				<div class="relative h-1 w-full rounded-full bg-white/25" data-progress-track>
					<div
						class="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-white"
						style:width={`${progress}%`}
					></div>
					<div
						class="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
						style:left={`${progress}%`}
					>
						<div
							class={[
								'size-1 rounded-full bg-white transition-[width,height] duration-200 ease-out group-hover/progress:size-2.5',
								isScrubbing && 'size-2.5 opacity-100 transition-none'
							]}
						></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	mux-player {
		display: block;
		width: 100%;
		height: 100%;
		--controls: none;
		--media-object-fit: cover;
	}
</style>
