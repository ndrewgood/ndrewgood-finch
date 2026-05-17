<script lang="ts">
	import { Button } from '$lib/components';
</script>

<svelte:head>
	<title>Stickersheet | Finch</title>
</svelte:head>

<main class="mx-auto max-w-5xl space-y-10 px-6 py-10">
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
			<Button icon="copy_content">Leading icon</Button>
			<Button icon="copy_content" iconPosition="trailing">Trailing icon</Button>
		</div>

		<h3 class="text-base font-bold">Text buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button variant="text">Default</Button>
			<Button variant="text" size="large">Large</Button>
			<Button variant="text" icon="copy_content">Leading icon</Button>
			<Button variant="text" icon="copy_content" iconPosition="trailing">Trailing icon</Button>
		</div>

		<h3 class="text-base font-bold">Icon-only buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button icon="copy_content" size="large" aria-label="Copy" />
			<Button variant="text" icon="copy_content" size="large" aria-label="Copy" />
		</div>

		<h3 class="text-base font-bold">Text + hover icon buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button iconHover icon="copy_content">Leading icon</Button>
			<Button iconHover icon="copy_content" iconPosition="trailing">Trailing icon</Button>
			<Button variant="text" iconHover icon="copy_content">Leading icon</Button>
			<Button variant="text" iconHover icon="copy_content" iconPosition="trailing">
				Trailing icon
			</Button>
		</div>
	</section>
</main>
