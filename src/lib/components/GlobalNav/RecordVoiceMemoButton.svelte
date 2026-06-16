<script lang="ts">
	import { Icon } from '$lib/components';

	const buttonClass =
		'group flex w-full cursor-pointer bg-stone-100 flex-row items-center gap-4 rounded-xl px-6 py-5 text-left text-stone-900 no-underline transition-colors duration-[120ms] ease-out-cubic hover:bg-stone-200 hover:text-stone-900 active:text-stone-900';

	const iconClass =
		'flex shrink-0 items-center justify-center rounded-full p-2 opacity-30 transition-all duration-[120ms] ease-out-cubic group-hover:opacity-80';
</script>

<button type="button" class={buttonClass}>
	<div class="flex min-w-0 flex-1 flex-row items-center gap-4">
		<div class="flex flex-col justify-center gap-1">
			<h4 class="text-xl leading-5">Record voice memo</h4>
			<p class="text-sm leading-4 text-stone-400">Sends directly to Andrew’s phone</p>
		</div>
	</div>
	<span class={iconClass} aria-hidden="true">
		<Icon name="mic_outline" class="size-6" />
	</span>
</button>
