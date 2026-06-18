<script lang="ts">
	import { Icon } from '$lib/components';
	import { createCopySwap } from '$lib/copy-swap.svelte';

	const EMAIL = 'hey@ndrewgood.com';

	const buttonClass =
		'group flex w-full cursor-pointer bg-stone-100 flex-row items-center gap-4 rounded-xl px-6 py-5 text-left text-stone-900 no-underline transition-colors duration-[120ms] ease-out-cubic hover:bg-stone-200 hover:text-stone-900 active:bg-stone-300';

	const copyIconWrapperClass =
		'flex shrink-0 items-center justify-center rounded-full p-2';

	const successIconWrapperClass =
		'flex shrink-0 items-center justify-center rounded-full p-2';

	const copySwap = createCopySwap(() => EMAIL);
</script>

<button type="button" class={buttonClass} onclick={() => copySwap.copy()} aria-live="polite">
	<div class="flex min-w-0 flex-1 flex-row items-center gap-4">
		<div class="swap-text grid min-w-0 items-center">
			<div
				class={[
					'swap-layer col-start-1 row-start-1 flex min-w-0 items-center',
					copySwap.layerClass(copySwap.defaultLayer),
					copySwap.suppressSwapTransition && 'swap-layer--no-transition'
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
					copySwap.layerClass(copySwap.successLayer),
					copySwap.suppressSwapTransition && 'swap-layer--no-transition'
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
				copySwap.defaultIconClass(copySwap.defaultLayer),
				copySwap.suppressSwapTransition && 'swap-layer--no-transition'
			]}
			aria-hidden="true"
		>
			<Icon name="content_copy_outline" class="size-6" />
		</span>
		<span
			class={[
				successIconWrapperClass,
				'swap-layer col-start-1 row-start-1',
				copySwap.layerClass(copySwap.successLayer),
				copySwap.suppressSwapTransition && 'swap-layer--no-transition'
			]}
			aria-hidden="true"
		>
			<Icon name="check" class="size-6" />
		</span>
	</span>
</button>
