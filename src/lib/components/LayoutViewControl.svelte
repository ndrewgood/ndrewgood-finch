<script lang="ts" module>
	export const TOP_SCROLL_THRESHOLD = 320;
	export const BOTTOM_SCROLL_THRESHOLD = 220;

	export type LayoutView = 'list' | 'grid';
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = {
		target?: HTMLElement;
		topThreshold?: number;
		bottomThreshold?: number;
		layoutView?: LayoutView;
		onLayoutViewChange?: () => void;
	};

	let {
		target,
		topThreshold = TOP_SCROLL_THRESHOLD,
		bottomThreshold = BOTTOM_SCROLL_THRESHOLD,
		layoutView = $bindable<LayoutView>('list'),
		onLayoutViewChange
	}: Props = $props();

	let visible = $state(false);

	function updateVisibility() {
		if (!target) {
			visible = false;
			return;
		}

		const rect = target.getBoundingClientRect();
		const pastTop = rect.top <= topThreshold;
		const beforeBottom = rect.bottom >= window.innerHeight - bottomThreshold;

		visible = pastTop && beforeBottom;
	}

	$effect(() => {
		topThreshold;
		bottomThreshold;

		if (!target) return;

		updateVisibility();
		window.addEventListener('scroll', updateVisibility, { passive: true });
		window.addEventListener('resize', updateVisibility);

		return () => {
			window.removeEventListener('scroll', updateVisibility);
			window.removeEventListener('resize', updateVisibility);
		};
	});
</script>

<div
	class={[
		'group/control fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-row gap-1 rounded-2xl bg-stone-200/80 p-1.5 backdrop-blur-md select-none transition-opacity duration-150 ease-out-cubic min-[800px]:top-1/2 min-[800px]:bottom-auto min-[800px]:left-4 min-[800px]:rounded-xl min-[800px]:translate-x-0 min-[800px]:-translate-y-1/2 min-[800px]:flex-col min-[800px]:gap-0.5',
		visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
	]}
	aria-hidden={!visible}
>
	<button
		type="button"
		class={[
			'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 font-display text-sm font-bold text-stone-900 transition-all duration-200 ease-out-cubic min-[800px]:gap-0 min-[800px]:rounded-lg min-[800px]:p-1 min-[800px]:group-hover/control:gap-1.5 min-[800px]:group-hover/control:px-2',
			layoutView === 'list' ? 'bg-stone-800/10' : 'opacity-50 hover:opacity-100'
		]}
		aria-pressed={layoutView === 'list'}
		onclick={() => {
			onLayoutViewChange?.();
			layoutView = 'list';
		}}
	>
		<Icon name="list" class="size-6 shrink-0" />
		<span
			class="whitespace-nowrap transition-all duration-200 ease-out-cubic min-[800px]:max-w-0 min-[800px]:overflow-hidden min-[800px]:opacity-0 min-[800px]:group-hover/control:max-w-10 min-[800px]:group-hover/control:opacity-100"
		>
			List
		</span>
	</button>
	<button
		type="button"
		class={[
			'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 font-display text-sm font-bold text-stone-900 transition-all duration-200 ease-out-cubic min-[800px]:gap-0 min-[800px]:rounded-lg min-[800px]:p-1 min-[800px]:group-hover/control:gap-1.5 min-[800px]:group-hover/control:px-2',
			layoutView === 'grid' ? 'bg-stone-800/10' : 'opacity-50 hover:opacity-100'
		]}
		aria-pressed={layoutView === 'grid'}
		onclick={() => {
			onLayoutViewChange?.();
			layoutView = 'grid';
		}}
	>
		<Icon name="grid" class="size-6 shrink-0" />
		<span
			class="whitespace-nowrap transition-all duration-200 ease-out-cubic min-[800px]:max-w-0 min-[800px]:overflow-hidden min-[800px]:opacity-0 min-[800px]:group-hover/control:max-w-11 min-[800px]:group-hover/control:opacity-100"
		>
			Grid
		</span>
	</button>
</div>
