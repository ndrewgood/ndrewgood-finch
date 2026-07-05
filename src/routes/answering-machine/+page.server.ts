import { fail, redirect } from '@sveltejs/kit';

import {
	clearSessionCookie,
	isAuthenticated,
	setSessionCookie,
	verifyPassword
} from '$lib/server/answering-machine-auth';
import { deleteVoiceMemo, listVoiceMemos } from '$lib/server/voice-memos';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	if (!isAuthenticated(cookies)) {
		return {
			authenticated: false as const,
			memos: [],
			loadError: false
		};
	}

	try {
		const memos = await listVoiceMemos();

		return {
			authenticated: true as const,
			memos,
			loadError: false
		};
	} catch (error) {
		console.error('Failed to load voice memos:', error);

		return {
			authenticated: true as const,
			memos: [],
			loadError: true
		};
	}
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password');

		if (typeof password !== 'string' || password.length === 0) {
			return fail(400, { loginError: 'Enter a password.' });
		}

		try {
			if (!verifyPassword(password)) {
				return fail(401, { loginError: 'Incorrect password.' });
			}
		} catch (error) {
			console.error('Answering machine auth is not configured:', error);
			return fail(500, { loginError: 'Login is not configured.' });
		}

		setSessionCookie(cookies);
		throw redirect(303, '/answering-machine');
	},
	logout: async ({ cookies }) => {
		clearSessionCookie(cookies);
		throw redirect(303, '/answering-machine');
	},
	delete: async ({ request, cookies }) => {
		if (!isAuthenticated(cookies)) {
			return fail(401, { deleteError: 'Not authenticated.' });
		}

		const formData = await request.formData();
		const id = formData.get('id');

		if (typeof id !== 'string' || id.length === 0) {
			return fail(400, { deleteError: 'Invalid memo.' });
		}

		try {
			await deleteVoiceMemo(id);
		} catch (error) {
			console.error('Failed to delete voice memo:', error);
			return fail(500, { deleteError: 'Could not delete memo.' });
		}

		throw redirect(303, '/answering-machine');
	}
};
