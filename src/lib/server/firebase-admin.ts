import { env } from '$env/dynamic/private';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: App | undefined;

function requireEnv(name: string, value: string | undefined): string {
	if (!value) {
		throw new Error(`Missing environment variable: ${name}`);
	}

	return value;
}

export function getFirebaseApp(): App {
	if (app) return app;

	const existing = getApps()[0];
	if (existing) {
		app = existing;
		return app;
	}

	const projectId = requireEnv('FIREBASE_PROJECT_ID', env.FIREBASE_PROJECT_ID);
	const clientEmail = requireEnv('FIREBASE_CLIENT_EMAIL', env.FIREBASE_CLIENT_EMAIL);
	const privateKey = requireEnv('FIREBASE_PRIVATE_KEY', env.FIREBASE_PRIVATE_KEY).replace(
		/\\n/g,
		'\n'
	);
	const storageBucket = requireEnv('FIREBASE_STORAGE_BUCKET', env.FIREBASE_STORAGE_BUCKET);

	app = initializeApp({
		credential: cert({ projectId, clientEmail, privateKey }),
		storageBucket
	});

	return app;
}

export function getAdminFirestore() {
	return getFirestore(getFirebaseApp());
}

export function getAdminStorage() {
	return getStorage(getFirebaseApp());
}
