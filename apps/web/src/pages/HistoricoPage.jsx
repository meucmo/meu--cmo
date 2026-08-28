import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate } from 'react-router-dom';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Bot, CalendarDays, ChevronDown, Download, Loader2, Lock, Search } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';
import { getTierLimits } from '@/lib/planTier';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const PERIODOS = [
	{ id: 'hoje', label: 'Hoje', dias: 0 },
	{ id: '7', label: '7 dias', dias: 7 },
	{ id: '30', label: '30 dias', dias: 30 },
	{ id: '90', label: '90 dias', dias: 90 },
];

export default function HistoricoPage() {
	const { subscriptions } = useSubscriptionAuth();
	const tierLimits = getTierLimits(subscriptions);
	const [empresa, setEmpresa] = useState(undefined);
	const [planos, setPlanos] = useState([]);
	const [tarefasPorPlano, setTarefasPorPlano] = useState({});
	const [aberto, setAberto] = useState(null);
	const [periodo, setPeriodo] = useState('30');
	const [busca, setBusca] = useState('');

	const limiteDias = tierLimits ? tierLimits.historicoDias : 30;
	const periodosDisponiveis = PERIODOS.filter((p) => {
		if (p.dias === 0) return true;
		if (limiteDias === Infinity) return true;
		return p.dias <= limiteDias;
	});

	useEffect(() => {
		(async () => {
			try {
				const empresas = await pb.collection('empresas').getList(1, 1, { sort: '-created' });
				const empresaAtual = empresas.items[0] || null;
				setEmpresa(empresaAtual);
				if (!empresaAtual) return;

				const [planosList, tarefasList] = await Promise.all([
					pb.collection('planos_diarios').getFullList({
						filter: pb.filter('empresa = {:empresaId}', { empresaId: empresaAtual.id }),
						sort: '-data',
					}),
					pb.collection('tarefas').getFullList({
						filter: pb.filter('empresa = {:empresaId}', { empresaId: empresaAtual.id }),
						sort: 'ordem',
					}),
				]);

				setPlanos(planosList);
				const agrupadas = {};
				for (const tarefa of tarefasList) {
					(agrupadas[tarefa.plano] = agrupadas[tarefa.plano] || []).push(tarefa);
				}
				setTarefasPorPlano(agrupadas);
			} catch (err) {
				toast({ variant: 'destructive', title: 'Erro ao carregar histórico', description: err?.message });
				setEmpresa(null);
			}
		})();
	}, []);

	const planosFiltrados = useMemo(() => {
		const p = PERIODOS.find((x) => x.id === periodo);
		let lista = planos;
		if (p && p.dias === 0) {
			const hoje = format(new Date(), 'yyyy-MM-dd');
			lista = lista.filter((plano) => plano.data === hoje);
		} else if (p) {
			const limite = subDays(new Date(), p.dias);
			lista = lista.filter((plano) => {
				try { return isAfter(parseISO(plano.data), limite); } catch { return false; }
			});
		}
		const termo = busca.trim().toLowerCase();
		if (termo) {
			lista = lista.filter((plano) => {
				const texto = `${plano.titulo || ''} ${plano.foco || ''} ${plano.resumo || ''}`.toLowerCase();
				return texto.includes(termo);
			});
		}
		return lista;
	}, [planos, periodo, busca]);

	const exportarCsv = () => {
		const linhas = [['data', 'tipo', 'titulo', 'foco', 'resumo', 'tarefa', 'tipo_tarefa', 'concluida']];
		for (const plano of planosFiltrados) {
			const tarefas = tarefasPorPlano[plano.id] || [];
			if (tarefas.length === 0) {
				linhas.push([plano.data, plano.tipo || 'diario', plano.titulo || '', plano.foco || '', plano.resumo || '', '', '', '']);
			} else {
				for (const t of tarefas) {
					linhas.push([plano.data, plano.tipo || 'diario', plano.titulo || '', plano.foco || '', plano.resumo || '', t.titulo || '', t.tipo || '', t.concluida ? 'sim' : 'nao']);
				}
			}
		}
		const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
		const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `historio-planos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast({ title: 'Histórico exportado em CSV.' });
	};

	if (empresa === null) return <Navigate to="/onboarding" replace />;

	return (
		<div className="min-h-[100dvh] bg-muted/40">
			<Helmet>
				<title>Histórico de planos — Meu CMO</title>
				<meta name="description" content="Todos os planos de marketing diários gerados pela sua IA." />
			</Helmet>
			<header className="flex h-14 items-center justify-between border-b bg-background px-4">
				<div className="flex items-center gap-3">
					<Button asChild variant="ghost" size="icon" aria-label="Voltar"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
					<div className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"><Bot className="h-4 w-4 text-primary-foreground" /></span>
						<span className="font-display text-base font-bold tracking-tight">Meu CMO</span>
					</div>
				</div>
				<ThemeToggle />
			</header>

			<main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
				<h1 className="font-display text-2xl font-bold tracking-tight">Histórico de planos</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Todos os planos que {empresa?.assistente_nome || 'sua IA'} já gerou para a {empresa?.nome || 'sua empresa'}.
				</p>

				<div className="mt-5 flex flex-wrap items-center gap-2">
					{periodosDisponiveis.map((p) => (
						<Button
							key={p.id}
							type="button"
							variant={periodo === p.id ? 'secondary' : 'outline'}
							size="sm"
							onClick={() => setPeriodo(p.id)}
						>
							{p.label}
						</Button>
					))}
					{limiteDias !== Infinity && (
						<Button asChild variant="ghost" size="sm" className="gap-1.5 opacity-70">
							<Link to="/plans"><Lock className="h-3 w-3" />Desbloquear 90 dias</Link>
						</Button>
					)}
					<div className="relative ml-auto min-w-[180px] flex-1 sm:flex-none">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar palavra-chave..." className="pl-9" />
					</div>
					<Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={exportarCsv} disabled={planosFiltrados.length === 0}>
						<Download className="h-3.5 w-3.5" />Exportar CSV
					</Button>
				</div>

				{empresa === undefined ? (
					<div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
				) : planosFiltrados.length === 0 ? (
					<div className="mt-8 flex flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center">
						<CalendarDays className="h-8 w-8 text-muted-foreground" />
						<p className="mt-4 text-sm font-medium">Nenhum plano neste período</p>
						<p className="mt-1 text-sm text-muted-foreground">Gere seu primeiro plano do dia no painel principal.</p>
						<Button asChild className="mt-5"><Link to="/dashboard">Ir para o painel</Link></Button>
					</div>
				) : (
					<div className="mt-6 space-y-3">
						{planosFiltrados.map((plano) => {
							const tarefas = tarefasPorPlano[plano.id] || [];
							const concluidas = tarefas.filter((t) => t.concluida).length;
							const expandido = aberto === plano.id;
							let dataFormatada = plano.data;
							try { dataFormatada = format(parseISO(plano.data), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }); } catch { /* mantém bruto */ }
							const tipoLabel = plano.tipo === 'semana' ? 'Semana' : plano.tipo === 'mes' ? 'Mês' : 'Dia';

							return (
								<div key={plano.id} className="rounded-2xl border bg-card">
									<button type="button" onClick={() => setAberto(expandido ? null : plano.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{dataFormatada}</p>
												<Badge variant="outline" className="text-[10px]">{tipoLabel}</Badge>
											</div>
											<p className="mt-0.5 truncate font-display text-base font-semibold">{plano.titulo || plano.foco || 'Plano'}</p>
										</div>
										<Badge variant="secondary">{concluidas}/{tarefas.length} tarefas</Badge>
										<ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', expandido && 'rotate-180')} />
									</button>
									{expandido && (
										<div className="border-t px-5 py-4">
											{plano.resumo && <p className="text-sm text-muted-foreground">{plano.resumo}</p>}
											<ul className="mt-3 space-y-2">
												{tarefas.map((tarefa) => (
													<li key={tarefa.id} className="flex items-start gap-2.5 text-sm">
														<span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', tarefa.concluida ? 'bg-primary' : 'bg-border')} />
														<span className={cn(tarefa.concluida && 'text-muted-foreground line-through')}>{tarefa.titulo}</span>
													</li>
												))}
											</ul>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
}
