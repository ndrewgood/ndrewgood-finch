// 22.05kHz mono is plenty for voice and keeps a 1-minute memo around 2.6MB.
const TARGET_SAMPLE_RATE = 22050;

/**
 * Converts recorded audio (webm/opus or mp4/aac) to a mono 16-bit PCM WAV.
 * Gmail's inline player only supports wav/mp3, and MediaRecorder can't emit
 * either, so we re-encode in the browser before upload.
 */
export async function convertToWav(blob: Blob): Promise<Blob> {
	const encoded = await blob.arrayBuffer();

	const decodeContext = new AudioContext();
	let decoded: AudioBuffer;
	try {
		decoded = await decodeContext.decodeAudioData(encoded);
	} finally {
		void decodeContext.close();
	}

	// Re-render through an offline context to resample and downmix to mono.
	const offline = new OfflineAudioContext(
		1,
		Math.ceil(decoded.duration * TARGET_SAMPLE_RATE),
		TARGET_SAMPLE_RATE
	);
	const source = offline.createBufferSource();
	source.buffer = decoded;
	source.connect(offline.destination);
	source.start();
	const rendered = await offline.startRendering();

	return new Blob([encodeWavPcm16(rendered.getChannelData(0), TARGET_SAMPLE_RATE)], {
		type: 'audio/wav'
	});
}

function encodeWavPcm16(samples: Float32Array, sampleRate: number): ArrayBuffer {
	const dataLength = samples.length * 2;
	const buffer = new ArrayBuffer(44 + dataLength);
	const view = new DataView(buffer);

	const writeString = (offset: number, text: string) => {
		for (let i = 0; i < text.length; i++) {
			view.setUint8(offset + i, text.charCodeAt(i));
		}
	};

	writeString(0, 'RIFF');
	view.setUint32(4, 36 + dataLength, true);
	writeString(8, 'WAVE');
	writeString(12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true); // PCM format
	view.setUint16(22, 1, true); // mono
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 2, true); // byte rate
	view.setUint16(32, 2, true); // block align
	view.setUint16(34, 16, true); // bits per sample
	writeString(36, 'data');
	view.setUint32(40, dataLength, true);

	let offset = 44;
	for (let i = 0; i < samples.length; i++) {
		const clamped = Math.max(-1, Math.min(1, samples[i]));
		view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
		offset += 2;
	}

	return buffer;
}
