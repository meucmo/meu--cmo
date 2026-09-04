import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import fs from 'node:fs';
import routes from './routes/index.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import logger from './utils/appLogger.js';

const app = express();

app.disable('x-powered-by');

// CORS: permite o frontend na Netlify (meucmo.com) falar com o Railway
// quando o proxy same-origin não estiver ativo. Em modo gateway (proxy
// Netlify → Railway) o browser já é same-origin e o preflight nem ocorre.
const defaultAllowedOrigins = [
	'https://meucmo.com',
	'https://www.meucmo.com',
];
const extraOrigins = String(process.env.CORS_ALLOWED_ORIGINS || '')
	.split(',')
	.map((s) => s.trim())
	.filter(Boolean);
const allowedOrigins = new Set([...defaultAllowedOrigins, ...extraOrigins]);

app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (origin && allowedOrigins.has(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
		res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
		res.setHeader('Vary', 'Origin');
	}
	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}
	return next();
});

// PocketBase SEMPRE em /hcgi/platform (Netlify edge → Railway).
// Antes do body-parser para não consumir o stream do POST (cadastro/login).
const pbTarget = process.env.POCKETBASE_INTERNAL_URL || 'http://localhost:8090';
app.use(
	'/hcgi/platform',
	createProxyMiddleware({
		target: pbTarget,
		changeOrigin: true,
		pathRewrite: { '^/hcgi/platform': '' },
		ws: true,
		on: {
			error(err, _req, res) {
				logger.error(`PocketBase proxy error: ${err && err.message ? err.message : err}`);
				if (res && !res.headersSent) {
					res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
					res.end(
						JSON.stringify({
							code: 'pocketbase_unreachable',
							message:
								'Não foi possível falar com o PocketBase no Railway. Confira se o processo está no ar na porta 8090.',
						}),
					);
				}
			},
		},
	}),
);
logger.info(`PocketBase proxy /hcgi/platform → ${pbTarget}`);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes. Mounted at root for the Hostinger reverse-proxy environment,
// and additionally under /hcgi/api for self-hosted deployments (Railway, etc.)
// where the web client calls /hcgi/api/<route> directly on the same origin.
const apiRouter = routes();
app.use(apiRouter);
app.use('/hcgi/api', apiRouter);

// Opcional: servir o frontend estático no mesmo host (SERVE_WEB=true).
const SERVE_WEB = process.env.SERVE_WEB === 'true';

if (SERVE_WEB) {
	const webDist = path.resolve(process.cwd(), '../../dist/apps/web');
	if (fs.existsSync(webDist)) {
		app.use(express.static(webDist));
		app.get('*', (req, res, next) => {
			if (req.path.startsWith('/hcgi/')) return next();
			res.sendFile(path.join(webDist, 'index.html'));
		});
		logger.info(`Serving web build from ${webDist}`);
	} else {
		logger.warn(`SERVE_WEB=true but web build not found at ${webDist}`);
	}
}

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

app.use(errorMiddleware);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
	logger.info(`API server listening on port ${port}`);
});
