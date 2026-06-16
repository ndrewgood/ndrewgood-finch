<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';

	import { infoPhotoUrls } from '$lib/assets/infoPhotos';

	type Props = {
		alt?: string;
	};

	let { alt = 'Andrew Goodridge' }: Props = $props();

	const IDLE_NEXT_ROTATION = 0;
	const HOVER_FAN_ANGLE = 3;
	const CLICK_FAN_ANGLE = 8;
	const TRANSITION_MS = 220;
	const AUTO_ROTATE_MS = 4000;

	let currentIndex = $state(0);
	let isHovered = $state(false);
	let isPointerInside = $state(false);
	let isAnimating = $state(false);
	let isReady = $state(false);
	let suppressTransitions = $state(false);
	let animCurrentRotation = $state<number | null>(null);
	let animNextRotation = $state<number | null>(null);
	let animCurrentZ = $state<number | null>(null);
	let animNextZ = $state<number | null>(null);

	let autoRotationEnabled = true;
	let autoRotateInterval: ReturnType<typeof setInterval> | undefined;

	const previewIndex = $derived((currentIndex + 1) % infoPhotoUrls.length);

	const currentRotation = $derived(
		animCurrentRotation ?? (isHovered ? -HOVER_FAN_ANGLE : 0)
	);
	const nextRotation = $derived(
		animNextRotation ?? (isHovered ? HOVER_FAN_ANGLE : IDLE_NEXT_ROTATION)
	);
	const currentZ = $derived(animCurrentZ ?? 2);
	const nextZ = $derived(animNextZ ?? 1);
	const nextOpacity = $derived(!isHovered && !isAnimating ? 0.4 : 1);

	const photoCardClass = $derived(
		[
			'pointer-events-none absolute left-[5%] top-[5%] h-[90%] w-[90%] rounded-2xl object-cover bg-stone-300',
			suppressTransitions
				? ''
				: 'transition-[transform,opacity] duration-[220ms] ease-out-cubic'
		].join(' ')
	);

	function isCurrentPhoto(index: number) {
		return index === currentIndex;
	}

	function isPreviewPhoto(index: number) {
		return infoPhotoUrls.length > 1 && index === previewIndex;
	}

	function isActivePhoto(index: number) {
		return isCurrentPhoto(index) || isPreviewPhoto(index);
	}

	function rotationForPhoto(index: number) {
		if (isCurrentPhoto(index)) return currentRotation;
		if (isPreviewPhoto(index)) return nextRotation;
		return 0;
	}

	function zIndexForPhoto(index: number) {
		if (isCurrentPhoto(index)) return currentZ;
		if (isPreviewPhoto(index)) return nextZ;
		return 0;
	}

	function opacityForPhoto(index: number) {
		if (isCurrentPhoto(index)) return 1;
		if (isPreviewPhoto(index)) return nextOpacity;
		return 0;
	}

	function wait(ms: number) {
		return new Promise<void>((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	function nextFrame() {
		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
	}

	function stopAutoRotation() {
		autoRotationEnabled = false;
		if (autoRotateInterval) {
			clearInterval(autoRotateInterval);
			autoRotateInterval = undefined;
		}
	}

	function startAutoRotation() {
		if (infoPhotoUrls.length <= 1 || autoRotateInterval) return;

		autoRotateInterval = setInterval(() => {
			if (autoRotationEnabled && !isAnimating) {
				void cyclePhoto();
			}
		}, AUTO_ROTATE_MS);
	}

	onMount(async () => {
		await Promise.all(
			infoPhotoUrls.map((url) => {
				const image = new Image();
				image.src = url;
				return image.decode?.() ?? Promise.resolve();
			})
		);
		isReady = true;
		startAutoRotation();
	});

	onDestroy(() => {
		stopAutoRotation();
	});

	async function cyclePhoto() {
		if (!isReady || isAnimating || infoPhotoUrls.length <= 1) return;

		isAnimating = true;
		const startingFromHover = isHovered;

		animCurrentRotation = startingFromHover ? -HOVER_FAN_ANGLE : 0;
		animNextRotation = startingFromHover ? HOVER_FAN_ANGLE : IDLE_NEXT_ROTATION;
		animCurrentZ = 2;
		animNextZ = 1;
		isHovered = false;
		await tick();
		await nextFrame();

		animCurrentRotation = -CLICK_FAN_ANGLE;
		animNextRotation = CLICK_FAN_ANGLE;
		await wait(TRANSITION_MS);

		animCurrentZ = 1;
		animNextZ = 2;
		animCurrentRotation = CLICK_FAN_ANGLE;
		animNextRotation = -CLICK_FAN_ANGLE;
		await tick();
		await nextFrame();

		animCurrentRotation = 0;
		animNextRotation = 0;
		await wait(TRANSITION_MS);

		suppressTransitions = true;
		currentIndex = previewIndex;
		animCurrentRotation = null;
		animNextRotation = null;
		animCurrentZ = null;
		animNextZ = null;
		isAnimating = false;
		isHovered = isPointerInside;
		await tick();
		await nextFrame();
		suppressTransitions = false;
	}

	async function handleClick() {
		stopAutoRotation();
		await cyclePhoto();
	}

	function handlePointerEnter() {
		isPointerInside = true;
		if (!isAnimating) isHovered = true;
	}

	function handlePointerLeave() {
		isPointerInside = false;
		isHovered = false;
	}
</script>

<div class="flex flex-col items-center gap-2">
	{#if infoPhotoUrls.length > 0}
		{#if isReady}
			<button
				type="button"
				class="relative size-56 shrink-0 border-0 bg-transparent p-0 disabled:cursor-default {isAnimating
					? 'cursor-wait'
					: 'cursor-pointer'}"
				onclick={handleClick}
				onpointerenter={handlePointerEnter}
				onpointerleave={handlePointerLeave}
				disabled={!isReady || infoPhotoUrls.length <= 1}
				aria-busy={isAnimating}
				aria-label="Show another photo"
			>
				{#each infoPhotoUrls as url, index (url)}
					<img
						src={url}
						alt={isCurrentPhoto(index) ? alt : ''}
						aria-hidden={isCurrentPhoto(index) ? undefined : true}
						class={photoCardClass}
						decoding="sync"
						loading="eager"
						draggable="false"
						style:transform="rotate({rotationForPhoto(index)}deg)"
						style:transform-origin="bottom right"
						style:z-index={zIndexForPhoto(index)}
						style:opacity={opacityForPhoto(index)}
						style:visibility={isActivePhoto(index) ? 'visible' : 'hidden'}
					/>
				{/each}
			</button>
		{:else}
			<div class="size-56 shrink-0 rounded-2xl bg-stone-300" aria-hidden="true"></div>
		{/if}
	{:else}
		<div class="size-56 shrink-0 rounded-2xl bg-stone-300" aria-hidden="true"></div>
	{/if}

	{#if isReady && infoPhotoUrls.length > 1}
		<div class="flex items-center justify-center gap-1.5" aria-hidden="true">
			{#each infoPhotoUrls as _, index (index)}
				<span
					class={[
						'rounded-full transition-[background-color,transform] duration-[220ms] ease-out-cubic',
						index === currentIndex
							? 'size-1.5 bg-stone-700'
							: 'size-[5px] bg-stone-300'
					]}
				></span>
			{/each}
		</div>
	{/if}
</div>
