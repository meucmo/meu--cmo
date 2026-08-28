import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import fs from 'node:fs';
import routes from './routes/index.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import logger from './utils/appLogger.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes. Mounted at root for the Hostinger reverse-proxy environment,
// and additionally under /hcgi/api for self-hosted deployments (Railway, etc.)
// where the web client calls /hcgi/api/<route> directly on the same origin.
const apiRouter = routes();
app.use(apiRouter);
app.use('/hcgi/api', apiRouter);

// Self-hosted gateway mode: serve the built web app and proxy PocketBase on
// the same origin so the web client's /hcgi/platform and /hcgi/api paths work.
// Enable with SERVE_WEB=true (set on Railway). Off by default to preserve the
// Hostinger platform behaviour.
const SERVE_WEB = process.env.SERVE_WEB === 'true';

if (SERVE_WEB) {
	const pbTarget = process.env.POCKETBASE_INTERNAL_URL || 'http://localhost:8090';
	app.use(
		'/hcgi/platform',
		createProxyMiddleware({
			target: pbTarget,
			changeOrigin: true,
			pathRewrite: { '^/hcgi/platform': '' },
			ws: true,
		}),
	);

	const webDist = path.resolve(process.cwd(), '../../dist/apps/web');
	if (fs.existsSync(webDist)) {
		app.use(express.static(webDist));
		// SPA fallback: any non-API, non-file route returns index.html
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
