/**
 * Feature flag de backend: seleciona entre PocketBase (padrão, fallback) e
 * Supabase durante a migração.
 *
 * Valor lido da variável de ambiente do Vite:
 *   VITE_USE_SUPABASE = "true" | "false"  (padrão: false)
 *
 * Enquanto for false, TODO o app continua usando PocketBase — nada muda.
 * A flag só deve virar true após a validação completa do mapeamento e dos
 * testes de compatibilidade (página /migracao-test).
 */
const USE_SUPABASE = String(import.meta.env?.VITE_USE_SUPABASE || '').toLowerCase() === 'true';

export function useSupabase() {
	return USE_SUPABASE;
}

export function activeBackend() {
	return USE_SUPABASE ? 'supabase' : 'pocketbase';
}

export default { useSupabase, activeBackend };
