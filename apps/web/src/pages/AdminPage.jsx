import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate } from 'react-router-dom';
import {
	ArrowLeft,
	Bot,
	Building2,
	CreditCard,
	Loader2,
	ShieldCheck,
	Sparkles,
	TrendingDown,
	TrendingUp,
	Users,
	CalendarDays,
	CheckCircle2,
} from 'lucide-react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/format';
import ThemeToggle from '@/components/ThemeToggle';

const CORES_PLANO = ['#0d7d6e', '#14b8a6', '#5eead4', '#cbd5e1'];

function StatusAssinaturaBadge({ status }) {
	if (status === 'active') return <Badge className="bg-primary/15 text-primary">Ativa</Badge>;
	if (status === 'trialing') return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">Em teste</Badge>;
	if (status === 'cancelada') return <Badge variant="outline" className="text-muted-foreground">Cancelada</Badge>;
	if (status === 'past_due') return <Badge className="bg-destructive/15 text-destructive">Pagamento pendente</Badge>;
	return <Badge variant="outline">Sem assinatura</Badge>;
}

function StatCard({ icon: Icon, label, value, hint, accent }) {
	return (
		<div className="rounded-2xl border bg-card p-5">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Icon className="h-4 w-4" />
				{label}
			</div>
			<p className="mt-2 font-display text-3xl font-bold">{value}</p>
			{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
		</div>
	);
}

export default function AdminPage() {
	const { user } = useAuth();
	const [dados, setDados] = useState(null);
	const [loading, setLoading] = useState(true);

	const carregar = useCallback(async () => {
		setLoading(true);
		try {
			const res = await apiServerClient.fetch('/admin/metrics', {
				headers: { Authorization: `Bearer ${pb.authStore.token}` },
			});
			if (!res.ok) {
				throw new Error(`Falha ao carregar métricas (${res.status})`);
			}
			const json = await res.json();
			setDados(json);
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao carregar métricas', description: err?.message });
			setDados(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (user?.role === 'admin') carregar();
	}, [user?.role, carregar]);

	if (user && user.role !== 'admin') {
		return <Navigate to="/dashboard" replace />;
	}

	const totais = dados?.totais;
	const mrr = totais ? formatCurrency(totais.mrrCentavos / 100, { locale: 'pt-BR', currency: 'BRL' }) : '—';
	const dadosPlano = dados
		? Object.entries(dados.clientesPorPlano).map(([name, value]) => ({ name, value }))
		: [];

	return (
		<div className="min-h-[100dvh] bg-muted/40">
			<Helmet>
				<title>Administração — Meu CMO</title>
				<meta name="description" content="Painel administrativo do Meu CMO: clientes, receita, assinaturas e relatórios." />
			</Helmet>
			<header className="flex h-14 items-center justify-between border-b bg-background px-4">
				<div className="flex items-center gap-3">
					<Button asChild variant="ghost" size="icon" aria-label="Voltar ao painel">
						<Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
					</Button>
					<div className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"><Bot className="h-4 w-4 text-primary-foreground" /></span>
						<span className="font-display text-base font-bold tracking-tight">Meu CMO</span>
						<Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" />Admin</Badge>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={carregar} disabled={loading} className="gap-1.5">
						{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
						Atualizar
					</Button>
					<ThemeToggle />
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<h1 className="font-display text-2xl font-bold tracking-tight">Administração</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Visão geral da plataforma: clientes, receita recorrente (MRR), assinaturas e evolução.
				</p>

				{/* Métricas principais */}
				{loading ? (
					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
					</div>
				) : totais ? (
					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<StatCard icon={Users} label="Total de clientes" value={totais.clientes} hint={`${totais.assinaturasAtivas} com assinatura ativa`} />
						<StatCard icon={CreditCard} label="MRR (receita mensal)" value={mrr} hint="Receita recorrente estimada" accent="text-primary" />
						<StatCard icon={TrendingDown} label="Churn rate" value={`${totais.churnRate}%`} hint="Cancelamentos sobre o total" />
						<StatCard icon={CheckCircle2} label="Taxa de execução" value={`${totais.taxaExecucao}%`} hint="Tarefas concluídas" />
						<StatCard icon={Building2} label="Empresas cadastradas" value={totais.empresas} />
						<StatCard icon={CalendarDays} label="Planos gerados" value={totais.planos} hint="Total acumulado" />
						<StatCard icon={Sparkles} label="Assinaturas ativas" value={totais.assinaturasAtivas} />
						<StatCard icon={CheckCircle2} label="Tarefas criadas" value={totais.tarefas} />
					</div>
				) : null}

				{/* Gráficos */}
				{dados && (
					<div className="mt-6 grid gap-4 lg:grid-cols-2">
						<div className="rounded-2xl border bg-card p-5">
							<h2 className="font-display text-lg font-semibold">Evolução mensal</h2>
							<p className="mt-1 text-xs text-muted-foreground">Novos clientes e planos gerados por mês.</p>
							{dados.evolucao.length === 0 ? (
								<p className="py-10 text-center text-sm text-muted-foreground">Sem dados suficientes ainda.</p>
							) : (
								<ResponsiveContainer width="100%" height={260}>
									<BarChart data={dados.evolucao} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
										<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
										<XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
										<YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
										<Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
										<Legend />
										<Bar dataKey="novosClientes" name="Novos clientes" fill="#0d7d6e" radius={[4, 4, 0, 0]} />
										<Bar dataKey="planosGerados" name="Planos gerados" fill="#5eead4" radius={[4, 4, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							)}
						</div>

						<div className="rounded-2xl border bg-card p-5">
							<h2 className="font-display text-lg font-semibold">Clientes por plano</h2>
							<p className="mt-1 text-xs text-muted-foreground">Distribuição das assinaturas ativas.</p>
							<ResponsiveContainer width="100%" height={260}>
								<PieChart>
									<Pie data={dadosPlano} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
										{dadosPlano.map((_, i) => <Cell key={i} fill={CORES_PLANO[i % CORES_PLANO.length]} />)}
									</Pie>
									<Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				)}

				{/* Lista de clientes */}
				<div className="mt-6 rounded-2xl border bg-card">
					<div className="border-b px-5 py-4">
						<h2 className="font-display text-lg font-semibold">Clientes</h2>
						<p className="mt-1 text-xs text-muted-foreground">Nome, empresa, plano e status da assinatura.</p>
					</div>
					{loading ? (
						<div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
					) : !dados || dados.clientes.length === 0 ? (
						<p className="px-5 py-8 text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
									<tr>
										<th className="px-5 py-3 font-medium">Cliente</th>
										<th className="px-5 py-3 font-medium">Empresa</th>
										<th className="px-5 py-3 font-medium">Plano</th>
										<th className="px-5 py-3 font-medium">Status</th>
										<th className="px-5 py-3 font-medium">Renovação</th>
										<th className="px-5 py-3 font-medium">Cadastro</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{dados.clientes.map((c) => (
										<tr key={c.id} className="hover:bg-muted/30">
											<td className="px-5 py-3">
												<p className="font-medium">{c.nome || 'Sem nome'}</p>
												<p className="text-xs text-muted-foreground">{c.email}</p>
											</td>
											<td className="px-5 py-3">
												{c.empresa ? (
													<span className="flex flex-wrap items-center gap-1.5">
														<Badge variant="secondary">{c.empresa}</Badge>
														{c.segmento === 'saude' && <Badge variant="outline">Saúde</Badge>}
													</span>
												) : (
													<Badge variant="outline">Sem empresa</Badge>
												)}
											</td>
											<td className="px-5 py-3">{c.plano ? <Badge variant="secondary">{c.plano}</Badge> : <span className="text-muted-foreground">—</span>}</td>
											<td className="px-5 py-3"><StatusAssinaturaBadge status={c.statusAssinatura} /></td>
											<td className="px-5 py-3 text-xs text-muted-foreground">{c.renovacao ? formatDate(c.renovacao, { locale: 'pt-BR' }) : '—'}</td>
											<td className="px-5 py-3 text-xs text-muted-foreground">{c.criado ? formatDate(c.criado, { locale: 'pt-BR' }) : '—'}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<p className="mt-6 text-sm text-muted-foreground">
					Cancelamentos, upgrades e gestão de cobrança são feitos pelo portal de cobrança da loja.
					Cada cliente acompanha a própria assinatura em{' '}
					<Link to="/subscriptions" className="font-medium text-primary hover:underline">Minha assinatura</Link>.
				</p>
			</main>
		</div>
	);
}
