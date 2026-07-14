import { env } from '$env/dynamic/private';

const ANSWERING_MACHINE_URL = 'https://ndrewgood.com/answering-machine';

function buildSmsBody(message: string): string {
	const prefix = 'New voice memo to ndrewgood.com: ';
	const suffix = ` ${ANSWERING_MACHINE_URL}`;
	const maxBodyLength = 320;
	const available = Math.max(24, maxBodyLength - prefix.length - suffix.length);
	const trimmed = message.trim();
	const clipped =
		trimmed.length > available ? `${trimmed.slice(0, Math.max(0, available - 1)).trimEnd()}…` : trimmed;

	return `${prefix}${clipped}${suffix}`;
}

/**
 * Sends an SMS via Twilio. Firebase has no outbound SMS API for arbitrary text;
 * Firestore remains the source of truth, and Twilio delivers the notification.
 * Failures are logged and never block the voice-memo upload.
 */
export async function notifyVoiceMemoReceived(message: string): Promise<void> {
	const accountSid = env.TWILIO_ACCOUNT_SID;
	const authToken = env.TWILIO_AUTH_TOKEN;
	const fromNumber = env.TWILIO_FROM_NUMBER;
	const toNumber = env.VOICE_MEMO_NOTIFY_PHONE;

	if (!accountSid || !authToken || !fromNumber || !toNumber) {
		console.warn(
			'Voice memo SMS skipped: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, and VOICE_MEMO_NOTIFY_PHONE'
		);
		return;
	}

	const body = buildSmsBody(message);
	const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

	const response = await fetch(
		`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
		{
			method: 'POST',
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				To: toNumber,
				From: fromNumber,
				Body: body
			})
		}
	);

	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		throw new Error(`Twilio SMS failed (${response.status}): ${detail}`);
	}
}
