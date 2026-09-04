import { isSupabaseConfigured, getSupabaseClient, supabaseUrl } from '@/lib/supabaseClient';

/**
 * Teste de compatibilidade/conexão Supabase — Stage de validação da migração.
 *
 * Não migra dados, não altera PocketBase, não insere registros.
 * Para cada tabela do schema Meu CMO, tenta um SELECT limit(1) e classifica
 * o resultado:
 *   - ok       : tabela acessível (respondeu, com ou sem linhas)
 *   - denied   : tabela existe mas RLS bloqueou a leitura (esperado p/ anon
 *                sem sessão autenticada)
 *   - missing  : tabela não encontrada (404 / schema divergente)
 *   - error    : falha de conexão ou erro inesperado
 *
 * Retorna um relatório estruturado para a página /migracao-test.
 */

const TABLES = [
	{ name: 'profiles', select: 'id' },
	{ name: 'empresas', select: 'id' },
	{ name: 'planos_diarios', select: 'id' },
	{ name: 'tarefas', select: 'id' },
	{ name: 'mensagens_chat', select: 'id' },
	{ name: 'ideias', select: 'id' },
];

function classifyError(error) {
	const msg = String(error?.message || error || '').toLowerCase();
	if (msg.includes('does not exist') || msg.includes('not found') || error?.code === 'PGRST205') {
		return 'missing';
	}
	if (
		msg.includes('permission') ||
		msg.includes('denied') ||
		msg.includes('jwt') ||
		error?.code === '42501' ||
		error?.code === 'PGRST301'
	) {
		return 'denied';
	}
	return 'error';
}

export async function runSupabaseCompatTest() {
	const report = {
		configured: isSupabaseConfigured(),
		url: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^.]+\.[^.]+).*$/, '$1') : '',
		startedAt: new Date().toISOString(),
		tables: [],
		summary: { ok: 0, denied: 0, missing: 0, error: 0 },
	};

	if (!report.configured) {
		return report;
	}

	const supabase = getSupabaseClient();

	for (const table of TABLES) {
		const entry = { name: table.name, status: 'ok', detail: '', rowCount: null };
		try {
			const { data, error } = await supabase
				.from(table.name)
				.select(table.select)
				.limit(1);
			if (error) {
				entry.status = classifyError(error);
				entry.detail = error.message || String(error);
			} else {
				entry.rowCount = Array.isArray(data) ? data.length : 0;
				entry.detail = `tabela acessível (${entry.rowCount} linha(s) retornada(s))`;
			}
		} catch (err) {
			entry.status = classifyError(err);
			entry.detail = err?.message || String(err);
		}
		report.tables.push(entry);
		report.summary[entry.status] = (report.summary[entry.status] || 0) + 1;
	}

	return report;
}

export { TABLES };
