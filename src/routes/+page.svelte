<script lang="ts">
	let { data } = $props();
</script>

<section class="py-20">
	{#if data.heroTextHtml}
		<div class="display mx-auto max-w-lg text-center" data-hero-rich-text>
			{@html data.heroTextHtml}
		</div>
	{/if}
</section>
