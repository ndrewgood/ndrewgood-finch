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
	/** Pixel distance for swipe progress = 1 (full hover fan). */
	const SWIPE_FULL_PX = 56;

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
	let swipeProgress = $state(0);

	let autoRotationEnabled = true;
	let autoRotateInterval: ReturnType<typeof setInterval> | undefined;
	let canHover = $state(false);

	let swipePointerId: number | null = null;
	let swipeStartX = 0;
	/** True once a right-half touch swipe was tracked; suppresses the synthetic click. */
	let suppressClickFromSwipe = false;

	const isHoverActive = $derived(isHovered && canHover);

	const previewIndex = $derived((currentIndex + 1) % infoPhotoUrls.length);

	const currentRotation = $derived(
		animCurrentRotation ??
			(isHoverActive
				? -HOVER_FAN_ANGLE
				: swipeProgress > 0
					? -swipeProgress * HOVER_FAN_ANGLE
					: 0)
	);
	const nextRotation = $derived(
		animNextRotation ??
			(isHoverActive
				? HOVER_FAN_ANGLE
				: swipeProgress > 0
					? swipeProgress * HOVER_FAN_ANGLE
					: IDLE_NEXT_ROTATION)
	);
	const currentZ = $derived(animCurrentZ ?? 2);
	const nextZ = $derived(animNextZ ?? 1);
	const nextOpacity = $derived(
		swipeProgress > 0
			? 0.4 + swipeProgress * 0.6
			: !isHoverActive && !isAnimating
				? 0.4
				: 1
	);

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

	function pauseAutoCycle() {
		if (autoRotateInterval) {
			clearInterval(autoRotateInterval);
			autoRotateInterval = undefined;
		}
	}

	function resumeAutoCycle() {
		if (autoRotationEnabled) startAutoRotation();
	}

	function stopAutoRotation() {
		autoRotationEnabled = false;
		pauseAutoCycle();
	}

	function startAutoRotation() {
		if (infoPhotoUrls.length <= 1 || autoRotateInterval) return;

		autoRotateInterval = setInterval(() => {
			if (autoRotationEnabled && !isAnimating) {
				void cyclePhoto();
			}
		}, AUTO_ROTATE_MS);
	}

	function releaseSwipeCapture(target: EventTarget | null, pointerId: number) {
		if (!(target instanceof HTMLElement)) return;
		try {
			if (target.hasPointerCapture(pointerId)) {
				target.releasePointerCapture(pointerId);
			}
		} catch {
			// ignore — capture may already be released
		}
	}

	function resetSwipeVisuals() {
		swipeProgress = 0;
		suppressTransitions = false;
	}

	function cancelSwipe(target: EventTarget | null = null) {
		const pointerId = swipePointerId;
		if (pointerId === null) return;

		swipePointerId = null;
		if (target !== null) releaseSwipeCapture(target, pointerId);
		resetSwipeVisuals();
		resumeAutoCycle();
	}

	function getSwipeBoundsEl(from: EventTarget | null): HTMLElement | null {
		if (!(from instanceof HTMLElement)) return null;
		return from.closest('[data-global-nav]');
	}

	function isPointerInSwipeBounds(event: PointerEvent, from: EventTarget | null) {
		const boundsEl = getSwipeBoundsEl(from);
		if (!boundsEl) return false;
		const rect = boundsEl.getBoundingClientRect();
		return (
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom
		);
	}

	onMount(async () => {
		canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

		const [firstUrl, ...restUrls] = infoPhotoUrls;
		if (firstUrl) {
			const first = new Image();
			first.src = firstUrl;
			await first.decode?.().catch(() => undefined);
		}

		isReady = true;
		startAutoRotation();

		for (const url of restUrls) {
			const image = new Image();
			image.src = url;
			void image.decode?.().catch(() => undefined);
		}
	});

	onDestroy(() => {
		stopAutoRotation();
	});

	async function cyclePhoto(options?: { fromSwipe?: boolean }) {
		if (!isReady || isAnimating || infoPhotoUrls.length <= 1) return;

		isAnimating = true;
		const startingFromHover = isHoverActive || Boolean(options?.fromSwipe);

		animCurrentRotation = startingFromHover ? -HOVER_FAN_ANGLE : 0;
		animNextRotation = startingFromHover ? HOVER_FAN_ANGLE : IDLE_NEXT_ROTATION;
		animCurrentZ = 2;
		animNextZ = 1;
		swipeProgress = 0;
		suppressTransitions = false;
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
		isHovered = canHover && isPointerInside;
		await tick();
		await nextFrame();
		suppressTransitions = false;
	}

	async function handleClick() {
		if (suppressClickFromSwipe) {
			suppressClickFromSwipe = false;
			return;
		}
		stopAutoRotation();
		await cyclePhoto();
	}

	function handlePointerEnter() {
		isPointerInside = true;
		if (!isAnimating && canHover) isHovered = true;
	}

	function handlePointerLeave() {
		isPointerInside = false;
		isHovered = false;
		// Swipe cancel uses global-nav bounds on pointermove — leaving the
		// photo alone should not abort the gesture.
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.pointerType !== 'touch') return;
		if (!isReady || isAnimating || infoPhotoUrls.length <= 1) return;
		if (!(event.currentTarget instanceof HTMLElement)) return;

		// Right half of the full-width carousel strip (includes space beside the photo).
		const rect = event.currentTarget.getBoundingClientRect();
		const isRightHalf = event.clientX >= rect.left + rect.width / 2;
		if (!isRightHalf) return;

		swipePointerId = event.pointerId;
		swipeStartX = event.clientX;
		swipeProgress = 0;
		suppressClickFromSwipe = true;
		suppressTransitions = true;
		pauseAutoCycle();
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (swipePointerId !== event.pointerId) return;

		if (!isPointerInSwipeBounds(event, event.currentTarget)) {
			cancelSwipe(event.currentTarget);
			return;
		}

		const deltaX = swipeStartX - event.clientX;
		if (deltaX <= 0) {
			cancelSwipe(event.currentTarget);
			return;
		}

		swipeProgress = Math.min(1, deltaX / SWIPE_FULL_PX);
	}

	async function handlePointerUp(event: PointerEvent) {
		if (swipePointerId !== event.pointerId) return;

		const pointerId = swipePointerId;
		swipePointerId = null;
		releaseSwipeCapture(event.currentTarget, pointerId);

		const shouldAdvance = swipeProgress >= 1;
		if (shouldAdvance) {
			suppressTransitions = false;
			await cyclePhoto({ fromSwipe: true });
			resumeAutoCycle();
		} else {
			resetSwipeVisuals();
			resumeAutoCycle();
		}
	}

	function handlePointerCancel(event: PointerEvent) {
		if (swipePointerId !== event.pointerId) return;
		cancelSwipe(event.currentTarget);
	}
</script>

<!-- Swipe hit area extends beside the photo; the nested button is the accessible control. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex w-full touch-none flex-col items-center gap-2 self-stretch min-[700px]:w-auto"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
>
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
