import { randomUUID } from 'node:crypto';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminFirestore, getAdminStorage } from '$lib/server/firebase-admin';
import { VOICE_MEMO_CONFIG } from '$lib/voice-memo.config';

const COLLECTION = 'voiceMemos';
const MAX_MESSAGE_LENGTH = VOICE_MEMO_CONFIG.message.maxLength;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SIGNED_URL_TTL_MS = 60 * 60 * 1000;

const ALLOWED_MIME_TYPES = new Set([
	'audio/webm',
	'audio/mp4',
	'audio/m4a',
	'audio/x-m4a'
]);

function normalizeMimeType(mimeType: string): string {
	const base = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';

	// Some browsers record audio-only data with a video/webm container type.
	if (base === 'video/webm') {
		return 'audio/webm';
	}

	return base;
}

export type VoiceMemoRecord = {
	id: string;
	message: string;
	audioPath: string;
	mimeType: string;
	durationMs: number | null;
	sizeBytes: number;
	createdAt: string;
	audioUrl: string;
};

function extensionForMimeType(mimeType: string): string {
	if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
		return 'm4a';
	}

	return 'webm';
}

function assertAllowedUpload(input: { audio: Buffer; mimeType: string; message: string }) {
	if (!input.message.trim()) {
		throw new Error('Message is required');
	}

	if (input.message.trim().length > MAX_MESSAGE_LENGTH) {
		throw new Error('Message is too long');
	}

	if (input.audio.length === 0) {
		throw new Error('Audio file is required');
	}

	if (input.audio.length > MAX_FILE_SIZE_BYTES) {
		throw new Error('Audio file is too large');
	}

	if (!ALLOWED_MIME_TYPES.has(normalizeMimeType(input.mimeType))) {
		throw new Error('Unsupported audio format');
	}
}

export function resolveUploadMimeType(mimeType: string): string {
	return normalizeMimeType(mimeType || 'audio/webm');
}

export async function saveVoiceMemo(input: {
	audio: Buffer;
	mimeType: string;
	message: string;
	durationMs: number | null;
}): Promise<{ id: string }> {
	assertAllowedUpload(input);

	const mimeType = resolveUploadMimeType(input.mimeType);
	const id = randomUUID();
	const audioPath = `voice-memos/${id}.${extensionForMimeType(mimeType)}`;
	const bucket = getAdminStorage().bucket();

	await bucket.file(audioPath).save(input.audio, {
		contentType: mimeType,
		metadata: {
			cacheControl: 'private, max-age=3600'
		}
	});

	await getAdminFirestore()
		.collection(COLLECTION)
		.doc(id)
		.set({
			message: input.message.trim(),
			audioPath,
			mimeType,
			durationMs: input.durationMs,
			sizeBytes: input.audio.length,
			createdAt: FieldValue.serverTimestamp()
		});

	return { id };
}

async function getSignedAudioUrl(audioPath: string): Promise<string> {
	const [url] = await getAdminStorage()
		.bucket()
		.file(audioPath)
		.getSignedUrl({
			action: 'read',
			expires: Date.now() + SIGNED_URL_TTL_MS
		});

	return url;
}

export async function listVoiceMemos(): Promise<VoiceMemoRecord[]> {
	const snapshot = await getAdminFirestore()
		.collection(COLLECTION)
		.orderBy('createdAt', 'desc')
		.get();

	const memos = await Promise.all(
		snapshot.docs.map(async (doc) => {
			const data = doc.data();
			const audioPath = String(data.audioPath);
			const createdAt = data.createdAt?.toDate?.() as Date | undefined;

			return {
				id: doc.id,
				message: String(data.message),
				audioPath,
				mimeType: String(data.mimeType),
				durationMs: typeof data.durationMs === 'number' ? data.durationMs : null,
				sizeBytes: Number(data.sizeBytes),
				createdAt: (createdAt ?? new Date()).toISOString(),
				audioUrl: await getSignedAudioUrl(audioPath)
			};
		})
	);

	return memos;
}

export async function deleteVoiceMemo(id: string): Promise<void> {
	const docRef = getAdminFirestore().collection(COLLECTION).doc(id);
	const snapshot = await docRef.get();

	if (!snapshot.exists) {
		throw new Error('Voice memo not found');
	}

	const audioPath = snapshot.data()?.audioPath;

	await docRef.delete();

	if (typeof audioPath === 'string' && audioPath.length > 0) {
		await getAdminStorage().bucket().file(audioPath).delete({ ignoreNotFound: true });
	}
}
