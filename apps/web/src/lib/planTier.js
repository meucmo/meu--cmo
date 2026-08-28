import pb from '@/lib/pocketbaseClient';

// IDs dos produtos de assinatura (loja da plataforma).
const TIER_PRODUCT_IDS = {
	empresa: 'prod_01M0KDSVGV8DFW6D9GKMJREZSM',
	pro: 'prod_01M0KDSVRZN7FDR641X61KQWQM',
	saude: 'prod_01M0KDSW0XK58E3C1303Y6A4QA',
};

/**
 * Determina o tier do plano ativo a partir da lista de assinaturas.
 * Retorna 'empresa' | 'pro' | 'saude' | null (sem assinatura ativa).
 */
export function getActiveTier(subscriptions) {
	const ativas = (subscriptions || []).filter(
		(s) => s && (s.status === 'active' || s.status === 'trialing'),
	);
	if (ativas.some((s) => s.product_id === TIER_PRODUCT_IDS.saude)) return 'saude';
	if (ativas.some((s) => s.product_id === TIER_PRODUCT_IDS.pro)) return 'pro';
	if (ativas.some((s) => s.product_id === TIER_PRODUCT_IDS.empresa)) return 'empresa';
	return null;
}

export const TIER_LABELS = {
	empresa: 'Empresa',
	pro: 'Pro Empresa',
	saude: 'Saúde',
};

// Limites por tier (Parte 2, seção 3).
export const TIER_LIMITS = {
	empresa: {
		label: 'Empresa',
		chatDiario: 10,
		historicoDias: 30,
		empresas: 1,
		planosDiarios: 1,
		semana: false,
		mes: false,
		roteiroVideoDiario: false, // 1 roteiro detalhado por semana
	},
	pro: {
		label: 'Pro Empresa',
		chatDiario: Infinity,
		historicoDias: Infinity,
		empresas: Infinity,
		planosDiarios: Infinity,
		semana: true,
		mes: true,
		roteiroVideoDiario: true,
	},
	saude: {
		label: 'Saúde',
		chatDiario: Infinity,
		historicoDias: Infinity,
		empresas: Infinity,
		planosDiarios: Infinity,
		semana: true,
		mes: true,
		roteiroVideoDiario: true,
	},
};

export function getTierLimits(subscriptions) {
	const tier = getActiveTier(subscriptions);
	return tier ? TIER_LIMITS[tier] : null;
}

/**
 * Conta quantas mensagens de usuário foram enviadas hoje (para gating de chat).
 */
export async function countTodayUserMessages() {
	try {
		if (!pb.authStore.isValid) return 0;
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const records = await pb.collection('_integratedAiMessages').getFullList({
			filter: pb.filter('created >= {:start} && role = {:role}', {
				start: start.toISOString().replace('T', ' ').slice(0, 19),
				role: 'user',
			}),
		});
		return records.length;
	} catch {
		return 0;
	}
}
