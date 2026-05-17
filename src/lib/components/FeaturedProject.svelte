<script lang="ts">
	import ProjectTag from './ProjectTag.svelte';
    import Button from './Button.svelte';
</script>

<div class="w-3xl flex flex-col gap-6">
	<div class="flex flex-row justify-between items-center">
		<div class="flex flex-row gap-3">
			<div class="size-11 rounded-lg bg-stone-300"></div>
			<div class="flex flex-col gap-0">
				<h3 class="leading-5">Mockbox</h3>
				<p>Web tool for mocking up box-shaped objects</p>
			</div>
		</div>
		<div class="flex flex-row gap-3">
			<ProjectTag label="Design" />
			<ProjectTag label="Development" />
		</div>
	</div>
    <div class="w-full aspect-[4/3] bg-stone-150"></div>
    <Button size="large">Visit site</Button>
</div>
