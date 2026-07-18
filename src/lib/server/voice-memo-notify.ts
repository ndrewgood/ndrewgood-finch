import { env } from '$env/dynamic/private';

const ANSWERING_MACHINE_URL = 'https://ndrewgood.com/answering-machine';

// Works without domain verification, but can only deliver to the Resend
// account owner's email. Set RESEND_FROM_EMAIL once ndrewgood.com is verified.
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';

// Gmail shows roughly 50-70 subject characters on desktop; the prefix uses ~30.
const SUBJECT_PREVIEW_MAX_LENGTH = 40;

function subjectPreview(message: string): string {
	if (message.length <= SUBJECT_PREVIEW_MAX_LENGTH) {
		return message;
	}

	return `${message.slice(0, SUBJECT_PREVIEW_MAX_LENGTH).trimEnd()}…`;
}

function escapeHtml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

/**
 * Sends an email via Resend when a new voice memo arrives, with the audio file
 * attached (memos are capped at 10MB, well under Resend's 40MB email limit).
 * Firestore remains the source of truth; the email is just a notification with
 * a link to the answering machine. Failures are logged and never block the
 * memo upload.
 */
export async function notifyVoiceMemoReceived(input: {
	message: string;
	audio: Buffer;
	mimeType: string;
	filename: string;
}): Promise<void> {
	const apiKey = env.RESEND_API_KEY;
	const toEmail = env.VOICE_MEMO_NOTIFY_EMAIL;
	const fromEmail = env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

	if (!apiKey || !toEmail) {
		console.warn('Voice memo email skipped: set RESEND_API_KEY and VOICE_MEMO_NOTIFY_EMAIL');
		return;
	}

	const trimmed = input.message.trim();

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: `ndrewgood.com <${fromEmail}>`,
			to: [toEmail],
			subject: `☎️ Ring ring! New voice memo: "${subjectPreview(trimmed)}"`,
			text: `"${trimmed}"\n\nListen: ${ANSWERING_MACHINE_URL}`,
			html: `<p>&ldquo;${escapeHtml(trimmed)}&rdquo;</p><p><a href="${ANSWERING_MACHINE_URL}">Listen on the answering machine</a></p>`,
			attachments: [
				{
					filename: input.filename,
					content: input.audio.toString('base64'),
					content_type: input.mimeType
				}
			]
		})
	});

	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		throw new Error(`Resend email failed (${response.status}): ${detail}`);
	}
}
