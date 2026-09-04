/**
 * Proxy same-origin /hcgi/* → backend Railway (PocketBase + Express).
 * Lê RAILWAY_BACKEND_URL em runtime (variável da Netlify).
 * Sem essa variável, devolve 503 JSON em vez de 404 HTML opaco.
 */

function jsonResponse(status, body) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json; charset=utf-8' },
	});
}

export default async (request) => {
	let raw = '';
	try {
		if (typeof Netlify !== 'undefined' && Netlify.env && typeof Netlify.env.get === 'function') {
			raw = Netlify.env.get('RAILWAY_BACKEND_URL') || '';
		}
	} catch {
		/* ignore */
	}
	if (!raw) {
		try {
			raw = Deno.env.get('RAILWAY_BACKEND_URL') || '';
		} catch {
			raw = '';
		}
	}

	// Aceita host sem protocolo (ex.: xxx.up.railway.app) e normaliza para https://
	let backend = String(raw).trim().replace(/\/$/, '');

	if (!backend) {
		return jsonResponse(503, {
			code: 'backend_not_configured',
			message:
				'Backend não configurado. Defina RAILWAY_BACKEND_URL na Netlify (URL pública do Railway, ex: https://seu-app.up.railway.app) e faça um novo deploy.',
		});
	}

	if (!/^https?:\/\//i.test(backend)) {
		// Valor comum na Netlify: só o hostname, sem https://
		backend = `https://${backend.replace(/^\/+/, '')}`;
	}

	// Rejeita valores claramente inválidos (espaços, path-only, etc.)
	try {
		const u = new URL(backend);
		if (!u.hostname || !/\./.test(u.hostname)) {
			throw new Error('hostname inválido');
		}
		backend = `${u.protocol}//${u.host}`;
	} catch {
		return jsonResponse(503, {
			code: 'backend_url_invalid',
			message:
				'RAILWAY_BACKEND_URL inválida. Use o host do Railway (ex: seu-app.up.railway.app) ou a URL completa com https://.',
		});
	}

	const incoming = new URL(request.url);
	const targetUrl = `${backend}${incoming.pathname}${incoming.search}`;

	const headers = new Headers(request.headers);
	headers.delete('host');
	headers.delete('netlify-vary');
	headers.set('x-forwarded-host', incoming.host);
	headers.set('x-forwarded-proto', incoming.protocol.replace(':', ''));

	const init = {
		method: request.method,
		headers,
		redirect: 'manual',
	};

	if (request.method !== 'GET' && request.method !== 'HEAD') {
		init.body = request.body;
	}

	try {
		const upstream = await fetch(targetUrl, init);
		const responseHeaders = new Headers(upstream.headers);
		responseHeaders.delete('content-encoding');
		responseHeaders.delete('content-length');
		responseHeaders.delete('transfer-encoding');

		return new Response(upstream.body, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers: responseHeaders,
		});
	} catch (err) {
		return jsonResponse(502, {
			code: 'backend_unreachable',
			message:
				'Não foi possível conectar ao backend. Confira se o serviço no Railway está online e se RAILWAY_BACKEND_URL está correta.',
			detail: String(err && err.message ? err.message : err),
		});
	}
};
