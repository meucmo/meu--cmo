import { Router } from 'express';
import { pocketbaseUser } from '../middleware/pb-user.js';
import pocketbaseClient from '../utils/pocketbaseClient.js';
import { getUserSubscriptions } from '../api/ecommerce-subscriptions.js';

const router = Router();

// Preços mensais por product_id (em centavos de BRL).
const PRECO_POR_PRODUTO = {
	prod_01M0KDSVGV8DFW6D9GKMJREZSM: 5900, // Empresa
	prod_01M0KDSVRZN7FDR641X61KQWQM: 9700, // Pro Empresa
	prod_01M0KDSW0XK58E3C1303Y6A4QA: 39700, // Saúde
};

const TIER_POR_PRODUTO = {
	prod_01M0KDSVGV8DFW6D9GKMJREZSM: 'Empresa',
	prod_01M0KDSVRZN7FDR641X61KQWQM: 'Pro Empresa',
	prod_01M0KDSW0XK58E3C1303Y6A4QA: 'Saúde',
};

function mesChave(dataIso) {
	if (!dataIso) return null;
	const d = new Date(dataIso);
	if (Number.isNaN(d.getTime())) return null;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * GET /admin/metrics — métricas agregadas da plataforma (apenas admin).
 * Retorna: totais, MRR, clientes por plano, churn, evolução mensal e lista de clientes.
 */
router.get('/metrics', pocketbaseUser, async (req, res) => {
	const callerId = req.pocketbaseUserId;
	if (!callerId) {
		throw new Error('Autenticação necessária.');
	}

	// Verifica se o chamador é admin via cliente superuser.
	let caller;
	try {
		caller = await pocketbaseClient.collection('users').getOne(callerId);
	} catch {
		throw new Error('Usuário não encontrado.');
	}
	if (caller.role !== 'admin') {
		const err = new Error('Acesso restrito a administradores.');
		err.status = 403;
		throw err;
	}

	// Lista todos os usuários, empresas, planos e tarefas via superuser.
	const [users, empresas, planos, tarefas] = await Promise.all([
		pocketbaseClient.collection('users').getFullList({ sort: '-created' }),
		pocketbaseBaseList('empresas'),
		pocketbaseBaseList('planos_diarios'),
		pocketbaseBaseList('tarefas'),
	]);

	const empresaPorOwner = new Map(empresas.map((e) => [e.owner, e]));

	// Assinaturas por usuário (chama a API de ecommerce para cada usuário).
	const clientes = [];
	let mrr = 0;
	const clientesPorPlano = { Empresa: 0, 'Pro Empresa': 0, Saúde: 0, 'Sem assinatura': 0 };
	let ativas = 0;
	let canceladas = 0;

	for (const u of users) {
		let subs = [];
		try {
			subs = await getUserSubscriptions({ userId: u.id });
		} catch {
			subs = [];
		}
		const ativa = subs.find((s) => ['active', 'trialing'].includes(s.status));
		const cancelada = subs.some((s) => ['canceled', 'cancelled'].includes(s.status));

		if (ativa) {
			ativas += 1;
			const tier = TIER_POR_PRODUTO[ativa.product_id] || 'Sem assinatura';
			if (clientesPorPlano[tier] !== undefined) clientesPorPlano[tier] += 1;
			else clientesPorPlano['Sem assinatura'] += 1;
			mrr += PRECO_POR_PRODUTO[ativa.product_id] || 0;
		} else {
			clientesPorPlano['Sem assinatura'] += 1;
		}
		if (cancelada) canceladas += 1;

		clientes.push({
			id: u.id,
			nome: u.name || '',
			email: u.email || '',
			verificado: !!u.verified,
			criado: u.created,
			empresa: empresaPorOwner.get(u.id)?.nome || null,
			segmento: empresaPorOwner.get(u.id)?.segmento || null,
			plano: ativa ? TIER_POR_PRODUTO[ativa.product_id] || '—' : null,
			statusAssinatura: ativa ? ativa.status : cancelada ? 'cancelada' : 'nenhuma',
			renovacao: ativa?.current_period_end || null,
		});
	}

	// Evolução mensal: novos clientes e planos gerados.
	const novosPorMes = {};
	const planosPorMes = {};
	for (const u of users) {
		const k = mesChave(u.created);
		if (k) novosPorMes[k] = (novosPorMes[k] || 0) + 1;
	}
	for (const p of planos) {
		const k = mesChave(p.created);
		if (k) planosPorMes[k] = (planosPorMes[k] || 0) + 1;
	}

	const meses = Array.from(
		new Set([...Object.keys(novosPorMes), ...Object.keys(planosPorMes)]),
	).sort();
	const evolucao = meses.map((k) => ({
		mes: k,
		novosClientes: novosPorMes[k] || 0,
		planosGerados: planosPorMes[k] || 0,
	}));

	const tarefasConcluidas = tarefas.filter((t) => t.concluida).length;
	const taxaExecucao = tarefas.length
		? Math.round((tarefasConcluidas / tarefas.length) * 100)
		: 0;

	const churnRate = users.length
		? Math.round((canceladas / users.length) * 100)
		: 0;

	return res.json({
		totais: {
			clientes: users.length,
			empresas: empresas.length,
			planos: planos.length,
			tarefas: tarefas.length,
			assinaturasAtivas: ativas,
			mrrCentavos: mrr,
			churnRate,
			taxaExecucao,
		},
		clientesPorPlano,
		evolucao,
		clientes,
	});
});

// Helper: getFullList em coleções base via cliente superuser (authRefresh garante sessão).
async function pocketbaseBaseList(collection) {
	try {
		return await pocketbaseClient.collection(collection).getFullList({ sort: '-created' });
	} catch {
		return [];
	}
}

export default router;
