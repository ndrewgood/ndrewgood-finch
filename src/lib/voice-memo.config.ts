/**
 * Voice memo UI + animation tuning.
 * Adjust values here — components read from this file and CSS variables below.
 */
export const VOICE_MEMO_CONFIG = {
	message: {
		/** Max characters for the name/message field. */
		maxLength: 230
	},
	animation: {
		/** Slide/fade between states (entry, permission, recorder, add-note, sending, sent). */
		stateSwapMs: 200,
		/** How long the sent confirmation shows before resetting. */
		sentDisplayMs: 2000,
		/** Delay while "Sending voice memo..." is shown. */
		sendingDelayMs: 900,
		/** Container + control button hover/active transitions. */
		uiTransitionMs: 120,
		/** Minimum time on the awaiting-permission screen. */
		awaitingPermissionMinMs: 500
	},
	waveform: {
		/** One dot every N ms while recording. */
		sampleIntervalMs: 200,
		/** Visible bars in the waveform viewport. */
		barCount: 48,
		/** Max recording length before auto-stop. */
		maxRecordingMs: 60_000,
		/** Horizontal slide when a new dot is added (px). Match dot width + gap. */
		dotStepPx: 7,
		dotGapPx: 3,
		/** Waveform row slide when dots push left. */
		slideDurationMs: 250,
		/** Dot height + playback color transition. */
		dotTransitionMs: 150,
		minDotSizePx: 4,
		maxDotSizePx: 26,
		/** Higher = quieter dots stay smaller, louder peaks taller. */
		heightCurveExponent: 2,
		/** Mic input gain before normalization. */
		amplitudeInputGain: 6,
		amplitudeCurveExponent: 0.6,
		amplitudeCurveScale: 1.15,
		/** Minimum normalized sample (quiet ≈ small dot). */
		amplitudeFloor: 0.05
	}
} as const;

/** CSS custom properties for voice memo components. Apply to a root element's `style`. */
export function voiceMemoCssVars(
	config: typeof VOICE_MEMO_CONFIG = VOICE_MEMO_CONFIG
): string {
	const { animation, waveform } = config;

	return [
		`--voice-memo-state-swap-ms: ${animation.stateSwapMs}ms`,
		`--voice-memo-ui-ms: ${animation.uiTransitionMs}ms`,
		`--voice-memo-waveform-slide-ms: ${waveform.slideDurationMs}ms`,
		`--voice-memo-waveform-dot-ms: ${waveform.dotTransitionMs}ms`,
		`--voice-memo-waveform-gap: ${waveform.dotGapPx}px`
	].join('; ');
}
