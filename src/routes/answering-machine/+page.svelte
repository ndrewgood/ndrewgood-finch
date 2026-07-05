<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	import { Button } from '$lib/components';

	let { data, form } = $props();

	function formatDate(iso: string): string {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(iso));
	}

	function formatDuration(durationMs: number | null): string | null {
		if (durationMs === null) return null;

		const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<title>Answering machine</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section
	class="mx-[calc(50%-50vw)] flex min-h-[100vh] w-[100vw] flex-col bg-stone-100 px-6 pt-28 pb-16"
>
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-8">
		<Button variant="text" onclick={() => goto('/')}>Back home</Button>

		<div class="flex flex-col gap-2 text-center">
			<h1 class="text-3xl leading-8 text-stone-900">Answering machine</h1>
			<p class="text-sm leading-5 text-stone-500">Voice memos from the contact panel.</p>
		</div>

		{#if !data.authenticated}
			<form method="POST" action="?/login" use:enhance class="mx-auto flex w-full max-w-sm flex-col gap-4">
				<label class="flex flex-col gap-2">
					<span class="text-sm text-stone-600">Password</span>
					<input
						type="password"
						name="password"
						autocomplete="current-password"
						class="rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
					/>
				</label>

				{#if form?.loginError}
					<p class="text-sm text-red-600">{form.loginError}</p>
				{/if}

				<Button type="submit" fullWidth>Unlock</Button>
			</form>
		{:else}
			<div class="flex items-center justify-between gap-4">
				<p class="text-sm text-stone-500">
					{data.memos.length} memo{data.memos.length === 1 ? '' : 's'}
				</p>
				<form method="POST" action="?/logout" use:enhance>
					<Button type="submit" variant="text" class="!mx-0">Log out</Button>
				</form>
			</div>

			{#if data.loadError}
				<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
					Could not load voice memos. Check Firebase configuration.
				</p>
			{:else if data.memos.length === 0}
				<p class="rounded-xl bg-stone-200/60 px-4 py-6 text-sm text-stone-600">No voice memos yet.</p>
			{:else}
				<ul class="flex flex-col gap-4">
					{#each data.memos as memo (memo.id)}
						<li class="rounded-xl bg-stone-200/60 px-5 py-4">
							<div class="mb-3 flex flex-wrap items-start justify-between gap-3">
								<p class="min-w-0 flex-1 text-lg font-medium leading-6 text-stone-900">
									{memo.message}
								</p>
								<div class="flex shrink-0 items-center gap-2">
									<div class="flex items-center gap-2 text-xs text-stone-500">
										<time datetime={memo.createdAt}>{formatDate(memo.createdAt)}</time>
										{#if formatDuration(memo.durationMs)}
											<span aria-hidden="true">·</span>
											<span>{formatDuration(memo.durationMs)}</span>
										{/if}
									</div>
									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={memo.id} />
										<Button
											type="submit"
											variant="text"
											icon="delete"
											class="!mx-0"
											aria-label="Delete memo"
										/>
									</form>
								</div>
							</div>
							<audio controls preload="none" class="w-full" src={memo.audioUrl}>
								<track kind="captions" />
							</audio>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</section>
