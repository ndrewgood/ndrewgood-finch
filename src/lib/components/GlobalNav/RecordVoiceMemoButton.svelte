<script lang="ts">
	import { Icon } from '$lib/components';
	import { voiceMemoCssVars } from '$lib/voice-memo.config';
	import { createVoiceMemo, type VoiceMemoSwapState } from '$lib/voice-memo.svelte';
	import { VOICE_MEMO_CONFIG } from '$lib/voice-memo.config';

	import VoiceMemoWaveform from './VoiceMemoWaveform.svelte';

	const memo = createVoiceMemo();
	const voiceMemoStyle = voiceMemoCssVars();

	const containerClass =
		'voice-memo-button group flex h-20 w-full min-w-0 overflow-hidden rounded-xl bg-stone-100 px-6 text-left text-stone-900 transition-colors ease-out-cubic';

	const iconWrapperClass =
		'flex shrink-0 items-center justify-center rounded-full p-2 transition-all ease-out-cubic';

	const controlButtonClass =
		'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ease-out-cubic cursor-pointer hover:bg-stone-200 active:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:active:bg-transparent';

	const layerRowClass = 'flex h-full w-full min-w-0 items-center gap-4';

	function layerClasses(state: VoiceMemoSwapState) {
		return [
			'swap-layer col-start-1 row-start-1 min-w-0',
			memo.swap.getLayerClass(state),
			memo.swap.suppressTransition && 'swap-layer--no-transition'
		];
	}

	function controlButton(extra = '') {
		return [controlButtonClass, extra];
	}

	const isRootInteractive = $derived(
		memo.swap.current === 'entry' || memo.swap.current === 'error'
	);

	const showContainerHover = $derived(memo.swap.current === 'entry');

	const recorderControlsEnabled = $derived(
		memo.recorderPhase === 'finished' || memo.recorderPhase === 'playback'
	);
</script>

<div
	class={[
		containerClass,
		showContainerHover && 'hover:bg-stone-200 active:bg-stone-300',
		isRootInteractive && 'cursor-pointer'
	]}
	style={voiceMemoStyle}
	role={isRootInteractive ? 'button' : undefined}
	tabindex={isRootInteractive ? 0 : undefined}
	onclick={() => void memo.handleRootClick()}
	onkeydown={(event) => {
		if (!isRootInteractive) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			void memo.handleRootClick();
		}
	}}
	aria-live="polite"
>
	<div class="relative grid h-full w-full min-w-0 items-center">
		<div class={layerClasses('entry')} aria-hidden={memo.swap.current !== 'entry'}>
			<div class={layerRowClass}>
				<div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
					<h4 class="text-xl leading-5">Send voice memo</h4>
					<p class="text-sm leading-4 text-stone-400">Goes directly to Andrew’s phone</p>
				</div>
				<span
					class={[iconWrapperClass, 'swap-icon--shown opacity-30 group-hover:opacity-80']}
					aria-hidden="true"
				>
					<Icon name="mic_outline" class="size-6" />
				</span>
			</div>
		</div>

		<div
			class={layerClasses('awaiting-permission')}
			aria-hidden={memo.swap.current !== 'awaiting-permission'}
		>
			<div class={layerRowClass}>
				<div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
					<h4 class="text-xl leading-5">Asking for microphone permission</h4>
					<p class="text-sm leading-4 text-stone-400">Look for a pop-up in your browser...</p>
				</div>
				<span class={[iconWrapperClass, 'opacity-80']} aria-hidden="true">
					<Icon name="mic_pending" class="size-6" />
				</span>
			</div>
		</div>

		<div class={layerClasses('error')} aria-hidden={memo.swap.current !== 'error'}>
			<div class={layerRowClass}>
				<div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
					<h4 class="text-xl leading-5">Error occurred</h4>
					<p class="truncate text-sm leading-4 text-stone-400">{memo.errorMessage}</p>
				</div>
				<span class={[iconWrapperClass, 'text-red-500 opacity-100']} aria-hidden="true">
					<Icon name="error" class="size-6" />
				</span>
			</div>
		</div>

		<div class={layerClasses('recorder')} aria-hidden={memo.swap.current !== 'recorder'}>
			<div class="flex h-full w-full min-w-0 items-center gap-3">
				{#if memo.recorderPhase === 'ready'}
					<button
						type="button"
						class={controlButton()}
						aria-label="Start recording"
						onclick={() => void memo.startRecording()}
					>
						<Icon name="mic_outline" class="size-6" />
					</button>
					<p class="min-w-0 flex-1 truncate select-none text-sm leading-4 text-stone-400">
						Press the mic to record...
					</p>
				{:else if memo.recorderPhase === 'recording'}
					<button
						type="button"
						class={controlButton('text-red-500')}
						aria-label="Stop recording"
						onclick={() => void memo.stopRecording()}
					>
						<Icon name="stop" class="size-6" />
					</button>
					<VoiceMemoWaveform
						samples={memo.waveformSamples}
						progressIndex={memo.visibleProgressIndex}
						align={memo.waveformAlign}
						animate
					/>
				{:else}
					<button
						type="button"
						class={controlButton()}
						aria-label="Delete recording"
						onclick={() => void memo.deleteRecording()}
					>
						<Icon name="delete" class="size-6" />
					</button>
					<VoiceMemoWaveform
						samples={memo.waveformSamples}
						progressIndex={memo.visibleProgressIndex}
						align={memo.waveformAlign}
					/>
				{/if}

				<div class="flex shrink-0 items-center gap-1">
					<button
						type="button"
						class={controlButton()}
						aria-label={memo.recorderPhase === 'playback' ? 'Pause recording' : 'Play recording'}
						disabled={!recorderControlsEnabled}
						onclick={() => void memo.togglePlayback()}
					>
						<Icon name={memo.recorderPhase === 'playback' ? 'pause' : 'play'} class="size-6" />
					</button>
					<button
						type="button"
						class={controlButton()}
						aria-label="Continue to add a note"
						disabled={!recorderControlsEnabled}
						onclick={() => void memo.goToAddNote()}
					>
						<Icon name="arrow_right_alt" class="size-6" />
					</button>
				</div>
			</div>
		</div>

		<div class={layerClasses('add-note')} aria-hidden={memo.swap.current !== 'add-note'}>
			<div class="flex h-full w-full min-w-0 items-center gap-4">
				<input
					type="text"
					required
					maxlength={VOICE_MEMO_CONFIG.message.maxLength}
					aria-label="Add your name or message"
					class="min-w-0 flex-1 border-0 bg-transparent py-1 text-lg font-medium leading-6 text-stone-900 outline-none placeholder:text-stone-400"
					placeholder="Add your name or message"
					value={memo.note}
					oninput={(event) => {
						memo.note = event.currentTarget.value;
					}}
				/>
				<button
					type="button"
					class={controlButton()}
					aria-label="Send voice memo"
					disabled={!memo.hasNote}
					onclick={() => void memo.sendMemo()}
				>
					<Icon name="send" class="size-6" />
				</button>
			</div>
		</div>

		<div class={layerClasses('sending')} aria-hidden={memo.swap.current !== 'sending'}>
			<div class={layerRowClass}>
				<div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
					<h4 class="text-xl leading-5">Sending voice memo...</h4>
				</div>
				<span class={[iconWrapperClass, 'opacity-80']} aria-hidden="true">
					<Icon name="pending" class="size-6" />
				</span>
			</div>
		</div>

		<div class={layerClasses('sent')} aria-hidden={memo.swap.current !== 'sent'}>
			<div class={layerRowClass}>
				<div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
					<h4 class="text-xl leading-5">Voice memo sent!</h4>
				</div>
				<span class={[iconWrapperClass, 'opacity-80']} aria-hidden="true">
					<Icon name="check" class="size-6" />
				</span>
			</div>
		</div>
	</div>
</div>

<svelte:window
	onkeydown={(event) => {
		if (memo.swap.current === 'sent' && event.key === 'Escape') {
			void memo.resetToEntry();
		}
	}}
/>

<style>
	.voice-memo-button {
		transition-duration: var(--voice-memo-ui-ms);
	}

	.voice-memo-button :global(.swap-layer) {
		transition-duration: var(--voice-memo-state-swap-ms);
	}

	.voice-memo-button :global(.transition-all),
	.voice-memo-button :global(.transition-colors) {
		transition-duration: var(--voice-memo-ui-ms);
	}
</style>
