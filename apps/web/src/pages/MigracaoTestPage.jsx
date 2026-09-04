import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, ArrowLeft, Database } from 'lucide-react';
import { isSupabaseConfigured, supabaseUrl } from '@/lib/supabaseClient';
import { activeBackend } from '@/lib/dbBackend';
import { runSupabaseCompatTest } from '@/lib/supabaseCompatTest';

const STATUS_META = {
	ok: { label: 'Acessível', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-900' },
	denied: { label: 'RLS bloqueou (esperado sem sessão)', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-900' },
	missing: { label: 'Tabela não encontrada', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-900' },
	error: { label: 'Erro de conexão', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-900' },
};

export default function MigracaoTestPage() {
	const [report, setReport] = useState(null);
	const [running, setRunning] = useState(false);
	const backend = activeBackend();
	const configured = isSupabaseConfigured();

	const run = useCallback(async () => {
		setRunning(true);
		try {
			const result = await runSupabaseCompatTest();
			setReport(result);
		} finally {
			setRunning(false);
		}
	}, []);

	useEffect(() => {
		if (configured) void run();
	}, [configured, run]);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Helmet>
				<title>Validação da Migração — Meu CMO</title>
				<meta name="description" content="Página de validação da migração PocketBase para Supabase (acesso restrito, ambiente de teste)." />
				<meta name="robots" content="noindex,nofollow" />
			</Helmet>

			<div className="mx-auto max-w-3xl px-4 py-10">
				<Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
					<ArrowLeft className="h-4 w-4" /> Voltar ao início
				</Link>

				<header className="mt-6 flex items-center gap-3">
					<Database className="h-7 w-7 text-primary" />
					<div>
						<h1 className="font-display text-2xl font-bold">Validação da Migração — Supabase</h1>
						<p className="text-sm text-muted-foreground">
							Backend ativo: <span className="font-semibold text-foreground">{backend}</span> · PocketBase permanece intacto como fallback.
						</p>
					</div>
				</header>

				<section className="mt-6 rounded-xl border border-border bg-card p-5">
					<h2 className="font-display text-lg font-semibold">1. Configuração do cliente</h2>
					<ul className="mt-3 space-y-2 text-sm">
						<li className="flex items-center gap-2">
							{configured ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
							Variáveis <code className="rounded bg-muted px-1.5 py-0.5">VITE_SUPABASE_URL</code> e <code className="rounded bg-muted px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code>
						</li>
						<li className="flex items-center gap-2">
							{configured ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
							Endpoint: {configured ? (report?.url || supabaseUrl) : 'não definido'}
						</li>
						<li className="flex items-center gap-2">
							{backend === 'pocketbase' ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
							Flag <code className="rounded bg-muted px-1.5 py-0.5">VITE_USE_SUPABASE</code>: {backend === 'supabase' ? 'true' : 'false (padrão)'}
						</li>
					</ul>
					{!configured && (
						<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
							Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no ambiente (Netlify/Vite) e faça um novo deploy para rodar o teste. Nenhum segredo é inserido pelo chat.
						</p>
					)}
				</section>

				<section className="mt-5 rounded-xl border border-border bg-card p-5">
					<div className="flex items-center justify-between">
						<h2 className="font-display text-lg font-semibold">2. Teste de compatibilidade das tabelas</h2>
						<button
							type="button"
							onClick={run}
							disabled={!configured || running}
							className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
						>
							<RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} /> Reexecutar
						</button>
					</div>

					{!configured && (
						<p className="mt-3 text-sm text-muted-foreground">Configure o cliente para executar o teste.</p>
					)}

					{configured && !report && (
						<p className="mt-3 text-sm text-muted-foreground">Executando…</p>
					)}

					{report?.tables?.length > 0 && (
						<>
							<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
								{Object.entries(report.summary).map(([key, count]) => {
									const meta = STATUS_META[key] || STATUS_META.error;
									const Icon = meta.icon;
									return (
										<div key={key} className={`rounded-lg border ${meta.border} ${meta.bg} p-3`}>
											<div className="flex items-center gap-1.5">
												<Icon className={`h-4 w-4 ${meta.color}`} />
												<span className="text-xs font-medium text-muted-foreground">{meta.label}</span>
											</div>
											<p className={`mt-1 text-xl font-bold ${meta.color}`}>{count}</p>
										</div>
									);
								})}
							</div>

							<ul className="mt-4 divide-y divide-border">
								{report.tables.map((t) => {
									const meta = STATUS_META[t.status] || STATUS_META.error;
									const Icon = meta.icon;
									return (
										<li key={t.name} className="flex items-start gap-3 py-3">
											<Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.color}`} />
											<div className="min-w-0">
												<p className="font-mono text-sm font-semibold">{t.name}</p>
												<p className="text-xs text-muted-foreground">{meta.label}</p>
												{t.detail && <p className="mt-0.5 break-words text-xs text-muted-foreground">{t.detail}</p>}
											</div>
										</li>
									);
								})}
							</ul>
						</>
					)}
				</section>

				<p className="mt-6 text-xs text-muted-foreground">
					Etapa segura da migração: validação de mapeamento + teste de conexão. PocketBase intacto, sem migração de dados reais, sem alterações visuais.
				</p>
			</div>
		</div>
	);
}
