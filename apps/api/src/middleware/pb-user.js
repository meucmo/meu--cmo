import { Buffer } from 'node:buffer';
import Pocketbase from 'pocketbase';

function unauthorizedError(message) {
	const error = new Error(message);
	error.status = 401;
	return error;
}

function decodeToken(raw) {
	try {
		const parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
		if (parsed?.token) {
			return parsed;
		}
	} catch {
		// Not a base64-encoded auth store payload — treat as a raw PB token.
	}
	return { token: raw, record: null };
}

/**
 * Authenticates the caller against PocketBase and attaches
 * `req.user = { sub, id }` (the shape the ecommerce subscriptions router
 * expects) plus `req.pocketbaseUserId`. Unlike the integrated-ai middleware
 * this does NOT require a verified email — subscription status must be
 * readable right after signup.
 */
export async function pocketbaseUser(req, res, next) {
	const raw = req.headers.authorization?.split(' ')?.[1];

	if (!raw) {
		return next(unauthorizedError('Authentication required.'));
	}

	try {
		const { token, record } = decodeToken(raw);
		const client = new Pocketbase(process.env.POCKETBASE_URL || 'http://localhost:8090');
		client.authStore.save(token, record);
		const collectionName = record?.collectionName || 'users';
		const refreshed = await client.collection(collectionName).authRefresh();

		req.user = { sub: refreshed.record.id, id: refreshed.record.id };
		req.pocketbaseUserId = refreshed.record.id;

		return next();
	} catch {
		return next(unauthorizedError('Your session has expired. Please sign in again.'));
	}
}
