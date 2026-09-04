import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para a migração PocketBase → Supabase.
 *
 * NÃO contém segredos: lê URL e chave anônima das variáveis de ambiente
 * do Vite (definidas pelo usuário no ambiente de deploy, nunca no chat):
 *   VITE_SUPABASE_URL      -> ex: https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY -> chave anônica (public) do projeto Supabase
 *
 * O cliente é criado de forma preguiçosa e só falha se for usado sem
 * configuração — assim o app continua 100% no PocketBase enquanto a flag
 * USE_SUPABASE estiver desligada (padrão).
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured() {
	return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let _client = null;

export function getSupabaseClient() {
	if (!isSupabaseConfigured()) {
		throw new Error(
			'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente.',
		);
	}
	if (!_client) {
		_client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
			auth: { persistSession: true, autoRefreshToken: true },
		});
	}
	return _client;
}

export const supabaseUrl = SUPABASE_URL;

export default { isSupabaseConfigured, getSupabaseClient, supabaseUrl };
