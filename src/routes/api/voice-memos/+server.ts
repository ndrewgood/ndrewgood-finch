import { error, json } from '@sveltejs/kit';

import { resolveUploadMimeType, saveVoiceMemo } from '$lib/server/voice-memos';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let formData: FormData;

	try {
		formData = await request.formData();
	} catch {
		throw error(400, 'Invalid form data');
	}

	const message = formData.get('message');
	const audio = formData.get('audio');
	const durationMsRaw = formData.get('durationMs');

	if (typeof message !== 'string' || !message.trim()) {
		throw error(400, 'Message is required');
	}

	if (!(audio instanceof Blob) || audio.size === 0) {
		throw error(400, 'Audio file is required');
	}

	const durationMs =
		typeof durationMsRaw === 'string' && durationMsRaw.length > 0
			? Number.parseInt(durationMsRaw, 10)
			: null;

	try {
		const result = await saveVoiceMemo({
			audio: Buffer.from(await audio.arrayBuffer()),
			mimeType: resolveUploadMimeType(audio.type),
			message,
			durationMs: Number.isFinite(durationMs) ? durationMs : null
		});

		return json({ id: result.id });
	} catch (uploadError) {
		console.error('Voice memo upload failed:', uploadError);

		if (uploadError instanceof Error) {
			if (
				uploadError.message === 'Message is required' ||
				uploadError.message === 'Audio file is required' ||
				uploadError.message === 'Audio file is too large' ||
				uploadError.message === 'Unsupported audio format' ||
				uploadError.message === 'Message is too long'
			) {
				throw error(400, uploadError.message);
			}
		}

		throw error(500, 'Failed to save voice memo');
	}
};
