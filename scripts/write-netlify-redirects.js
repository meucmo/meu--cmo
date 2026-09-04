/**
 * Gera dist/apps/web/_redirects no build da Netlify.
 * Expande RAILWAY_BACKEND_URL em tempo de build (mais confiável que ${VAR} no toml).
 * Edge function tem prioridade; este arquivo é fallback.
 * Também copia index.html → migracao-test/index.html para deep link físico.
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist/apps/web');
let backend = String(process.env.RAILWAY_BACKEND_URL || '')
	.trim()
	.replace(/\/$/, '');

// Aceita host sem protocolo (ex.: xxx.up.railway.app)
if (backend && !/^https?:\/\//i.test(backend)) {
	backend = `https://${backend.replace(/^\/+/, '')}`;
}
try {
	if (backend) {
		const u = new URL(backend);
		if (!u.hostname || !/\./.test(u.hostname)) throw new Error('bad host');
		backend = `${u.protocol}//${u.host}`;
	}
} catch {
	backend = '';
}

if (!fs.existsSync(dist)) {
	console.warn('[write-netlify-redirects] dist/apps/web não existe — pulando.');
	process.exit(0);
}

const lines = [];

if (backend) {
	lines.push(`# Proxy backend (build-time) → ${backend}`);
	lines.push(`/hcgi/platform/*  ${backend}/hcgi/platform/:splat  200!`);
	lines.push(`/hcgi/api/*       ${backend}/hcgi/api/:splat       200!`);
	console.log(`[write-netlify-redirects] proxy → ${backend}`);
} else {
	console.warn(
		'[write-netlify-redirects] RAILWAY_BACKEND_URL ausente ou inválida. ' +
			'Cadastro/login NÃO funcionarão até configurar a URL do Railway na Netlify.',
	);
	lines.push('/hcgi/*  /.netlify/functions/backend-missing  200!');
}

// Rotas de validação da migração (forçadas) + SPA genérico
lines.push('/migracao-test    /index.html   200!');
lines.push('/migracao-test/   /index.html   200!');
lines.push('/migracao-test.html /index.html 200!');
lines.push('/*    /index.html   200');

fs.writeFileSync(path.join(dist, '_redirects'), `${lines.join('\n')}\n`, 'utf8');
console.log('[write-netlify-redirects] wrote', path.join(dist, '_redirects'));

// Cópia física do shell SPA: Netlify serve arquivo real em /migracao-test/
// mesmo se _redirects/netlify.toml forem ignorados na UI do site.
const indexHtml = path.join(dist, 'index.html');
const migDir = path.join(dist, 'migracao-test');
if (fs.existsSync(indexHtml)) {
	fs.mkdirSync(migDir, { recursive: true });
	fs.copyFileSync(indexHtml, path.join(migDir, 'index.html'));
	fs.copyFileSync(indexHtml, path.join(dist, 'migracao-test.html'));
	console.log('[write-netlify-redirects] copiou shell SPA para migracao-test/ e migracao-test.html');
}
