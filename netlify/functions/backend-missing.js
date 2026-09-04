/**
 * Fallback quando RAILWAY_BACKEND_URL não foi definida no build.
 * Evita que /hcgi/* caia no index.html do SPA e o frontend mostre erro genérico.
 */
exports.handler = async () => ({
	statusCode: 503,
	headers: { 'content-type': 'application/json; charset=utf-8' },
	body: JSON.stringify({
		code: 'backend_not_configured',
		message:
			'Backend não configurado. Defina RAILWAY_BACKEND_URL na Netlify com a URL pública do Railway (ex: https://seu-app.up.railway.app) e faça um novo deploy.',
	}),
});
