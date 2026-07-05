<script lang="ts">
	import { Icon } from '$lib/components';
	import type { IconName } from '$lib/assets/icons';

	import CopyEmailButton from './CopyEmailButton.svelte';
	import RecordVoiceMemoButton from './RecordVoiceMemoButton.svelte';

	const socialLinks: { icon: IconName; label: string; href: string }[] = [
		{ icon: 'instagram', label: 'Instagram', href: 'https://instagram.com/ndrewgood' },
		{ icon: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/ndrewgood' },
		{ icon: 'arena', label: 'Are.na', href: 'https://are.na/andrew-goodridge' }
	];

	const socialButtonClass =
		'group flex w-full cursor-pointer bg-stone-100 flex-row justify-center items-center gap-4 rounded-xl py-2 text-left text-stone-900 no-underline transition-colors duration-[120ms] ease-out-cubic hover:bg-stone-200 hover:text-stone-900 active:text-stone-900';
</script>

<div class="flex flex-col gap-4 min-[700px]:px-8 px-4 pt-6 pb-4">
	<CopyEmailButton />
	<RecordVoiceMemoButton />
</div>

<div class="flex flex-col gap-2 min-[700px]:px-8 px-4">
	<div class="h-line-light w-full"></div>
</div>

<div class="flex flex-row min-[700px]:gap-4 gap-2 min-[700px]:px-8 px-4 pb-8 pt-4">
	{#each socialLinks as link (link.icon)}
		<a
			href={link.href}
			class={socialButtonClass}
			aria-label={link.label}
			target="_blank"
			rel="noopener noreferrer"
		>
			<span
				class="flex shrink-0 items-center justify-center rounded-full p-2 opacity-30 transition-all duration-[120ms] ease-out-cubic group-hover:opacity-80"
				aria-hidden="true"
			>
				<Icon name={link.icon} class="size-7" />
			</span>
		</a>
	{/each}
</div>