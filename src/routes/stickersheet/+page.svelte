<script lang="ts">
	import { Button } from '$lib/components';
</script>

<svelte:head>
	<title>Stickersheet | Finch</title>
</svelte:head>

<main class="mx-auto min-h-screen max-w-5xl space-y-10 bg-stone-100 px-6 py-10">
	<header class="space-y-2">
		<h1 class="text-center">Stickersheet</h1>
	</header>

	<section class="space-y-4 rounded-lg border border-stone-300 p-6">
		<h2 class="text-xl font-semibold">Typography</h2>
		<h1>Header 1</h1>
		<h2>Header 2</h2>
		<h3>Header 3</h3>
		<h4>Header 4</h4>
		<p>Paragraph text</p>
		<a href="#">Link text</a>
	</section>

	<section class="space-y-4 rounded-lg border border-stone-300 p-6">
		<h2 class="text-xl font-semibold">Buttons</h2>

		<h3 class="text-base font-bold">Filled buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button>Default</Button>
			<Button size="large">Large</Button>
			<Button icon="content_copy_outline">Leading icon</Button>
			<Button icon="content_copy_outline" iconPosition="trailing">Trailing icon</Button>
		</div>

		<h3 class="text-base font-bold">Text buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button variant="text">Default</Button>
			<Button variant="text" size="large">Large</Button>
			<Button variant="text" icon="content_copy_outline">Leading icon</Button>
			<Button variant="text" icon="content_copy_outline" iconPosition="trailing">Trailing icon</Button>
		</div>

		<h3 class="text-base font-bold">Icon-only buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button icon="content_copy_outline" size="large" aria-label="Copy" />
			<Button variant="text" icon="content_copy_outline" size="large" aria-label="Copy" />
		</div>

		<h3 class="text-base font-bold">Text + hover icon buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button iconHover icon="content_copy_outline">Leading icon</Button>
			<Button iconHover icon="content_copy_outline" iconPosition="trailing">Trailing icon</Button>
			<Button variant="text" iconHover icon="content_copy_outline">Leading icon</Button>
			<Button variant="text" iconHover icon="content_copy_outline" iconPosition="trailing">
				Trailing icon
			</Button>
		</div>

		<h3 class="text-base font-bold">Custom width</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button width="w-32">w-32</Button>
			<Button width="w-48">w-48</Button>
			<Button width="w-64">w-64</Button>
			<Button fullWidth>fullWidth</Button>
		</div>

		<h3 class="text-base font-bold">Custom height</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button height="h-10">h-10</Button>
			<Button height="h-14">h-14</Button>
			<Button height="h-16" size="large">h-16 large</Button>
		</div>

		<h3 class="text-base font-bold">Custom corner radius</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button rounded="rounded-none">rounded-none</Button>
			<Button rounded="rounded-md">rounded-md</Button>
			<Button rounded="rounded-lg">rounded-lg</Button>
			<Button rounded="rounded-2xl">rounded-2xl</Button>
			<Button>rounded-full (default)</Button>
		</div>

		<h3 class="text-base font-bold">Custom icon size</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button icon="content_copy_outline" iconSize="size-4">size-4</Button>
			<Button icon="content_copy_outline" iconSize="size-6">size-6</Button>
			<Button icon="content_copy_outline" iconSize="size-7" aria-label="Copy" />
		</div>

		<h3 class="text-base font-bold">Custom background</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button background="bg-stone-100" class="hover:bg-stone-200">bg-stone-100</Button>
			<Button background="bg-stone-200">bg-stone-200</Button>
			<Button
				background="bg-stone-100"
				icon="linkedin"
				iconSize="size-7"
				height="h-14"
				rounded="rounded-xl"
				class="hover:bg-stone-200"
				aria-label="LinkedIn"
			/>
		</div>
	</section>
</main>
