import { browser } from '$app/environment';
import { onDestroy } from 'svelte';

import { convertToWav } from '$lib/audio-wav';
import { createStateSwap } from '$lib/state-swap.svelte';
import { VOICE_MEMO_CONFIG } from '$lib/voice-memo.config';

const { animation, waveform, message: messageConfig } = VOICE_MEMO_CONFIG;

export type VoiceMemoSwapState =
	| 'entry'
	| 'awaiting-permission'
	| 'error'
	| 'recorder'
	| 'add-note'
	| 'sending'
	| 'sent';

/** @deprecated Use VoiceMemoSwapState for layout transitions. */
export type VoiceMemoState = VoiceMemoSwapState | RecorderPhase;

export type RecorderPhase = 'ready' | 'recording' | 'finished' | 'playback';

export const VOICE_MEMO_SWAP_STATES = [
	'entry',
	'awaiting-permission',
	'error',
	'recorder',
	'add-note',
	'sending',
	'sent'
] as const satisfies readonly VoiceMemoSwapState[];

export const RECORDER_PHASES = ['ready', 'recording', 'finished', 'playback'] as const satisfies readonly RecorderPhase[];

export const WAVEFORM_BAR_COUNT = waveform.barCount;
export const WAVEFORM_SAMPLE_MS = waveform.sampleIntervalMs;
export const MAX_RECORDING_MS = waveform.maxRecordingMs;

function getRecordingVisibleSamples(samples: number[]): number[] {
	if (samples.length <= WAVEFORM_BAR_COUNT) {
		return samples;
	}

	return samples.slice(-WAVEFORM_BAR_COUNT);
}

function normalizeAmplitude(raw: number): number {
	const scaled = Math.min(
		1,
		Math.pow(raw, waveform.amplitudeCurveExponent) * waveform.amplitudeCurveScale
	);
	return Math.max(waveform.amplitudeFloor, scaled);
}

function wait(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function createVoiceMemo() {
	const swap = createStateSwap<VoiceMemoSwapState>(
		'entry',
		VOICE_MEMO_SWAP_STATES,
		animation.stateSwapMs
	);

	let recorderPhase = $state<RecorderPhase>('ready');

	let waveformSamples = $state<number[]>([]);
	let playbackProgress = $state(0);
	let note = $state('');
	let errorMessage = $state("Couldn't connect to your microphone");

	let mediaStream: MediaStream | null = null;
	let mediaRecorder: MediaRecorder | null = null;
	let audioContext: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let sourceNode: MediaStreamAudioSourceNode | null = null;
	let audioBlob: Blob | null = null;
	let audioUrl: string | null = null;
	let audioElement: HTMLAudioElement | null = null;
	let chunks: Blob[] = [];
	let recordingTimeout: ReturnType<typeof setTimeout> | undefined;
	let resetTimeout: ReturnType<typeof setTimeout> | undefined;
	let sampleInterval: ReturnType<typeof setInterval> | undefined;
	let playbackFrame: number | undefined;
	let recordedMimeType = 'audio/webm';

	const hasRecording = $derived(waveformSamples.some((sample) => sample > 0.02));
	const hasNote = $derived(note.trim().length > 0);
	const visibleWaveform = $derived.by(() => {
		if (recorderPhase === 'recording') {
			return {
				samples: getRecordingVisibleSamples(waveformSamples),
				progressIndex: null as number | null,
				align: 'end' as const
			};
		}

		if (waveformSamples.length === 0) {
			return {
				samples: [] as number[],
				progressIndex: null as number | null,
				align: 'start' as const
			};
		}

		if (recorderPhase === 'playback') {
			return {
				samples: waveformSamples,
				progressIndex: Math.min(
					waveformSamples.length - 1,
					Math.floor(playbackProgress * waveformSamples.length)
				),
				align: 'start' as const
			};
		}

		return {
			samples: waveformSamples,
			progressIndex: null,
			align: 'start' as const
		};
	});

	function clearRecordingTimeout() {
		clearTimeout(recordingTimeout);
		recordingTimeout = undefined;
	}

	function stopSampleInterval() {
		if (sampleInterval !== undefined) {
			clearInterval(sampleInterval);
			sampleInterval = undefined;
		}
	}

	function revokeAudioUrl() {
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
			audioUrl = null;
		}
	}

	function resetWaveform() {
		waveformSamples = [];
		playbackProgress = 0;
	}

	function stopPlaybackProgressLoop() {
		if (playbackFrame !== undefined) {
			cancelAnimationFrame(playbackFrame);
			playbackFrame = undefined;
		}
	}

	function startPlaybackProgressLoop() {
		stopPlaybackProgressLoop();

		const tick = () => {
			if (!audioElement || audioElement.paused || recorderPhase !== 'playback') {
				stopPlaybackProgressLoop();
				return;
			}

			syncPlaybackProgress();

			playbackFrame = requestAnimationFrame(tick);
		};

		playbackFrame = requestAnimationFrame(tick);
	}

	function stopPlayback() {
		stopPlaybackProgressLoop();
		if (!audioElement) return;
		audioElement.pause();
		audioElement.currentTime = 0;
		playbackProgress = 0;
	}

	function releaseAudioElement() {
		stopPlayback();
		if (audioElement) {
			audioElement.onended = null;
			audioElement = null;
		}
	}

	function stopMediaTracks() {
		mediaStream?.getTracks().forEach((track) => track.stop());
		mediaStream = null;
	}

	function teardownAnalyser() {
		stopSampleInterval();
		sourceNode?.disconnect();
		sourceNode = null;
		analyser?.disconnect();
		analyser = null;
		void audioContext?.close();
		audioContext = null;
	}

	function resetRecordingData() {
		clearRecordingTimeout();
		stopSampleInterval();
		stopPlayback();
		releaseAudioElement();
		revokeAudioUrl();
		chunks = [];
		audioBlob = null;
		mediaRecorder = null;
		resetWaveform();
	}

	function teardownAll() {
		resetRecordingData();
		teardownAnalyser();
		stopMediaTracks();
	}

	function sampleAmplitude() {
		if (!analyser) return 0;

		const data = new Uint8Array(analyser.fftSize);
		analyser.getByteTimeDomainData(data);

		let sum = 0;
		for (const value of data) {
			const normalized = (value - 128) / 128;
			sum += normalized * normalized;
		}

		return Math.min(1, Math.sqrt(sum / data.length) * waveform.amplitudeInputGain);
	}

	function pushWaveformSample() {
		waveformSamples = [...waveformSamples, normalizeAmplitude(sampleAmplitude())];
	}

	function startSampleInterval() {
		stopSampleInterval();
		pushWaveformSample();
		sampleInterval = setInterval(() => {
			if (recorderPhase !== 'recording') return;
			pushWaveformSample();
		}, WAVEFORM_SAMPLE_MS);
	}

	function setupAnalyser(stream: MediaStream) {
		teardownAnalyser();
		audioContext = new AudioContext();
		analyser = audioContext.createAnalyser();
		analyser.fftSize = 256;
		analyser.smoothingTimeConstant = 0.65;
		sourceNode = audioContext.createMediaStreamSource(stream);
		sourceNode.connect(analyser);
	}

	function buildPlaybackElement() {
		releaseAudioElement();
		revokeAudioUrl();

		if (!audioBlob) return;

		audioUrl = URL.createObjectURL(audioBlob);
		audioElement = new Audio(audioUrl);
		audioElement.preload = 'auto';
		audioElement.onended = () => {
			stopPlaybackProgressLoop();
			playbackProgress = 1;
			if (recorderPhase === 'playback') {
				recorderPhase = 'finished';
			}
		};
		audioElement.load();
	}

	function getPlaybackDurationMs(): number | null {
		if (
			audioElement &&
			Number.isFinite(audioElement.duration) &&
			audioElement.duration > 0
		) {
			return audioElement.duration * 1000;
		}

		if (waveformSamples.length > 0) {
			return waveformSamples.length * WAVEFORM_SAMPLE_MS;
		}

		return null;
	}

	async function ensurePlaybackReady() {
		if (!audioBlob) return;
		if (!audioElement) buildPlaybackElement();
		if (!audioElement) return;

		if (Number.isFinite(audioElement.duration) && audioElement.duration > 0) {
			return;
		}

		await new Promise<void>((resolve) => {
			const element = audioElement;
			if (!element) {
				resolve();
				return;
			}

			const finish = () => resolve();

			if (Number.isFinite(element.duration) && element.duration > 0) {
				finish();
				return;
			}

			element.addEventListener('loadedmetadata', finish, { once: true });
			element.addEventListener('durationchange', finish, { once: true });
			element.load();
		});
	}

	function syncPlaybackProgress() {
		if (!audioElement) return;

		const durationMs = getPlaybackDurationMs();
		if (!durationMs) return;

		playbackProgress = Math.min(1, (audioElement.currentTime * 1000) / durationMs);
	}

	async function finishRecording() {
		clearRecordingTimeout();
		stopSampleInterval();
		teardownAnalyser();

		if (recorderPhase !== 'recording') return;

		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			await new Promise<void>((resolve) => {
				mediaRecorder!.addEventListener(
					'stop',
					() => {
						resolve();
					},
					{ once: true }
				);
				mediaRecorder!.stop();
			});
		}

		recorderPhase = 'finished';
	}

	function startRecorder(stream: MediaStream) {
		resetRecordingData();
		setupAnalyser(stream);

		const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
		recordedMimeType =
			preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? 'audio/webm';

		mediaRecorder = new MediaRecorder(stream, { mimeType: recordedMimeType });
		chunks = [];

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) chunks.push(event.data);
		};

		mediaRecorder.onstop = () => {
			audioBlob = new Blob(chunks, { type: recordedMimeType });
			buildPlaybackElement();
		};

		mediaRecorder.start(250);
		recordingTimeout = setTimeout(() => {
			void finishRecording();
		}, MAX_RECORDING_MS);
	}

	async function beginFlow() {
		if (!browser) return;
		if (swap.current !== 'entry') return;

		if (!navigator.mediaDevices?.getUserMedia) {
			errorMessage = "Couldn't connect to your microphone";
			await swap.transitionTo('error');
			return;
		}

		await swap.transitionTo('awaiting-permission');

		const minPermissionDisplay = wait(animation.awaitingPermissionMinMs);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			await minPermissionDisplay;
			mediaStream = stream;
			recorderPhase = 'ready';
			await swap.transitionTo('recorder');
		} catch {
			await minPermissionDisplay;
			errorMessage = "Couldn't connect to your microphone";
			stopMediaTracks();
			await swap.transitionTo('error');
		}
	}

	async function retryPermission() {
		teardownAll();
		await swap.transitionTo('entry');
		await beginFlow();
	}

	async function startRecording() {
		if (!mediaStream || recorderPhase !== 'ready' || swap.current !== 'recorder') return;

		resetWaveform();
		startRecorder(mediaStream);
		recorderPhase = 'recording';
		startSampleInterval();
	}

	async function stopRecording() {
		await finishRecording();
	}

	async function deleteRecording() {
		resetRecordingData();
		stopPlayback();
		recorderPhase = 'ready';
	}

	async function togglePlayback() {
		if (!audioBlob || !hasRecording) return;

		if (!audioElement) {
			buildPlaybackElement();
		}

		if (recorderPhase === 'playback') {
			stopPlayback();
			recorderPhase = 'finished';
			return;
		}

		if (recorderPhase !== 'finished') return;

		await ensurePlaybackReady();
		playbackProgress = 0;
		recorderPhase = 'playback';
		await audioElement?.play();
		startPlaybackProgressLoop();
	}

	async function goToAddNote() {
		if (!hasRecording || (recorderPhase !== 'finished' && recorderPhase !== 'playback')) return;
		stopPlayback();
		recorderPhase = 'finished';
		await swap.transitionTo('add-note');
	}

	async function sendMemo() {
		if (!audioBlob || !note.trim()) return;

		await swap.transitionTo('sending');

		// Convert to WAV so the emailed attachment plays inline in Gmail.
		// Fall back to the raw recording if decoding fails.
		let uploadBlob = audioBlob;
		let uploadFilename = recordedMimeType.includes('mp4') ? 'voice-memo.m4a' : 'voice-memo.webm';
		try {
			uploadBlob = await convertToWav(audioBlob);
			uploadFilename = 'voice-memo.wav';
		} catch (conversionError) {
			console.warn('WAV conversion failed, uploading original recording:', conversionError);
		}

		const formData = new FormData();
		formData.append('message', note.trim());
		formData.append('audio', uploadBlob, uploadFilename);

		const durationMs = audioElement?.duration ? Math.round(audioElement.duration * 1000) : null;
		if (durationMs !== null) {
			formData.append('durationMs', String(durationMs));
		}

		try {
			const response = await fetch('/api/voice-memos', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			await swap.transitionTo('sent');

			clearTimeout(resetTimeout);
			resetTimeout = setTimeout(() => {
				void resetToEntry();
			}, animation.sentDisplayMs);
		} catch {
			errorMessage = "Couldn't send your voice memo";
			await swap.transitionTo('error');
		}
	}

	async function resetToEntry() {
		teardownAll();
		note = '';
		recorderPhase = 'ready';
		errorMessage = "Couldn't connect to your microphone";
		await swap.transitionTo('entry');
	}

	async function handleRootClick() {
		if (swap.current === 'entry') {
			await beginFlow();
			return;
		}

		if (swap.current === 'error') {
			await retryPermission();
		}
	}

	onDestroy(() => {
		clearTimeout(resetTimeout);
		teardownAll();
	});

	return {
		swap,
		get recorderPhase() {
			return recorderPhase;
		},
		get waveformSamples() {
			return visibleWaveform.samples;
		},
		get visibleProgressIndex() {
			return visibleWaveform.progressIndex;
		},
		get waveformAlign() {
			return visibleWaveform.align;
		},
		get playbackProgress() {
			return playbackProgress;
		},
		get note() {
			return note;
		},
		set note(value: string) {
			note = value.slice(0, messageConfig.maxLength);
		},
		get errorMessage() {
			return errorMessage;
		},
		get hasRecording() {
			return hasRecording;
		},
		get hasNote() {
			return hasNote;
		},
		beginFlow,
		retryPermission,
		startRecording,
		stopRecording,
		deleteRecording,
		togglePlayback,
		goToAddNote,
		sendMemo,
		resetToEntry,
		handleRootClick
	};
}
