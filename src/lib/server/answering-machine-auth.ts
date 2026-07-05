import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE = 'answering_machine_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret(): string {
	const secret = env.ANSWERING_MACHINE_SESSION_SECRET;
	if (!secret) {
		throw new Error('Missing environment variable: ANSWERING_MACHINE_SESSION_SECRET');
	}

	return secret;
}

function signPayload(payload: string): string {
	return createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

export function verifyPassword(password: string): boolean {
	const expected = env.ANSWERING_MACHINE_PASSWORD;
	if (!expected) {
		throw new Error('Missing environment variable: ANSWERING_MACHINE_PASSWORD');
	}

	if (password.length !== expected.length) {
		return false;
	}

	return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}

export function createSessionToken(): string {
	const payload = `authenticated:${Date.now()}`;
	return `${payload}.${signPayload(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
	if (!token) return false;

	const separatorIndex = token.lastIndexOf('.');
	if (separatorIndex === -1) return false;

	const payload = token.slice(0, separatorIndex);
	const signature = token.slice(separatorIndex + 1);
	if (!payload.startsWith('authenticated:')) return false;

	const expected = signPayload(payload);

	if (signature.length !== expected.length) {
		return false;
	}

	return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function isAuthenticated(cookies: Cookies): boolean {
	return verifySessionToken(cookies.get(SESSION_COOKIE));
}

export function setSessionCookie(cookies: Cookies) {
	cookies.set(SESSION_COOKIE, createSessionToken(), {
		path: '/answering-machine',
		httpOnly: true,
		secure: !dev,
		sameSite: 'strict',
		maxAge: SESSION_MAX_AGE_SECONDS
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/answering-machine' });
}
