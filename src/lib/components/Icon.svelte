<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { getIconSvg, type IconName } from '$lib/assets/icons';

	type Props = HTMLAttributes<HTMLSpanElement> & {
		name: IconName;
	};

	let { name, class: className = '', ...rest }: Props = $props();

	const svg = $derived(getIconSvg(name));
</script>

<span
	{...rest}
	class={`inline-flex shrink-0 items-center justify-center fill-current [&>svg]:block [&>svg]:size-full ${className || 'size-4'}`.trim()}
	aria-hidden="true"
>
	{@html svg}
</span>
