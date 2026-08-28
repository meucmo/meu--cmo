import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
	ArrowLeft,
	Bot,
	CalendarClock,
	CreditCard,
	Loader2,
	Receipt,
	ShieldCheck,
	Sparkles,
	XCircle,
} from 'lucide-react';
import SubscriptionAccountSection from '@/components/SubscriptionAccountSection.jsx';
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton.jsx';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';
import { activeSubscription } from '@/lib/ecommerceSubscriptionsUtils';
import { getActiveTier, TIER_LABELS } from '@/lib/planTier';
import { formatDate } from '@/lib/format';

function StatusBadge({ status }) {
	if (status === 'trialing') {
		return <Badge className="gap-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-400">Em período de teste</Badge>;
	}
	if (status === 'active') {
		return <Badge className="gap-1.5 bg-primary/15 text-primary">Ativa</Badge>;
	}
	if (status === 'canceled' || status === 'cancelled') {
		return <Badge variant="outline" className="gap-1.5 text-muted-foreground">Cancelada</Badge>;
	}
	if (status === 'past_due') {
		return <Badge className="gap-1.5 bg-destructive/15 text-destructive">Pagamento pendente</Badge>;
	}
	return <Badge variant="outline">{status}</Badge>;
}

export default function SubscriptionsPage() {
	const { subscriptions, polling, pollingExhausted } = useSubscriptionAuth();
	const active = activeSubscription(subscriptions);
	const tier = getActiveTier(subscriptions);

	const renovacao = active?.current_period_end
		? formatDate(active.current_period_end, { locale: 'pt-BR' })
		: null;
	const inicio = active?.current_period_start
		? formatDate(active.current_period_start, { locale: 'pt-BR' })
		: null;

	return (
		<div className="min-h-[100dvh] bg-muted/40">
			<Helmet>
				<title>Minha assinatura — Meu CMO</title>
				<meta name="description" content="Veja seu plano atual, data de renovação e gerencie a cobrança da sua assinatura do Meu CMO." />
			</Helmet>
			<header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
				<div className="flex items-center gap-3">
					<Button asChild variant="ghost" size="icon" aria-label="Voltar ao painel">
						<Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
					</Button>
					<div className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"><Bot className="h-4 w-4 text-primary-foreground" /></span>
						<span className="font-display text-base font-bold tracking-tight">Meu CMO</span>
					</div>
				</div>
				<ThemeToggle />
			</header>

			<main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
				<header className="mb-8">
					<h1 className="font-display text-3xl font-bold tracking-tight">Minha assinatura</h1>
					<p className="mt-2 text-muted-foreground">
						Veja seu plano atual, data de renovação e gerencie a cobrança.
					</p>
				</header>

				{polling && (
					<div className="mb-6 flex items-center gap-3 rounded-xl border bg-card p-4">
						<Loader2 className="h-5 w-5 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">Finalizando seu pagamento…</p>
					</div>
				)}

				{pollingExhausted && !active && (
					<div className="mb-6 rounded-xl border bg-card p-4">
						<p className="text-sm font-medium">Quase lá</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Seu pagamento está sendo processado. Atualize a página em instantes para ver sua assinatura.
						</p>
					</div>
				)}

				{active ? (
					<div className="space-y-6">
						{/* Plano atual */}
						<section className="rounded-2xl border bg-card p-6">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plano atual</p>
									<h2 className="mt-1 font-display text-2xl font-bold">{active.product_title || (tier ? TIER_LABELS[tier] : 'Plano')}</h2>
									<div className="mt-2"><StatusBadge status={active.status} /></div>
								</div>
								<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
									<Sparkles className="h-6 w-6 text-primary" />
								</span>
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								{inicio && (
									<div className="rounded-xl bg-muted/40 p-4">
										<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
											<CalendarClock className="h-3.5 w-3.5" />Início do ciclo
										</div>
										<p className="mt-1.5 text-sm font-semibold">{inicio}</p>
									</div>
								)}
								{renovacao && (
									<div className="rounded-xl bg-muted/40 p-4">
										<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
											<CalendarClock className="h-3.5 w-3.5" />Próxima renovação
										</div>
										<p className="mt-1.5 text-sm font-semibold">{renovacao}</p>
									</div>
								)}
								{active.variant_title && (
									<div className="rounded-xl bg-muted/40 p-4">
										<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
											<CreditCard className="h-3.5 w-3.5" />Ciclo de cobrança
										</div>
										<p className="mt-1.5 text-sm font-semibold capitalize">{active.variant_title}</p>
									</div>
								)}
								{active.billing_interval && (
									<div className="rounded-xl bg-muted/40 p-4">
										<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
											<Receipt className="h-3.5 w-3.5" />Frequência
										</div>
										<p className="mt-1.5 text-sm font-semibold capitalize">{active.billing_interval}</p>
									</div>
								)}
							</div>

							<div className="mt-6 flex flex-wrap gap-3">
								<ManageSubscriptionButton className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60" />
								<Button asChild variant="outline" size="sm">
									<Link to="/plans">Ver todos os planos</Link>
								</Button>
							</div>
						</section>

						{/* Gerenciar cobrança */}
						<section className="rounded-2xl border bg-card p-6">
							<h2 className="font-display text-lg font-semibold">Gerenciar cobrança</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Pelo portal de cobrança você pode trocar de plano (upgrade ou downgrade), atualizar
								dados de pagamento, ver histórico de faturas e cancelar a assinatura.
							</p>
							<ul className="mt-4 space-y-2 text-sm">
								<li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Atualizar cartão e dados de pagamento</li>
								<li className="flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" />Histórico de faturas e notas</li>
								<li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Fazer upgrade ou downgrade</li>
								<li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-primary" />Cancelar a assinatura</li>
							</ul>
							<div className="mt-5">
								<ManageSubscriptionButton className="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60" />
							</div>
						</section>
					</div>
				) : (
					<div className="space-y-6">
						<section className="rounded-2xl border bg-card p-6">
							<div className="flex items-start gap-4">
								<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
									<Sparkles className="h-6 w-6 text-muted-foreground" />
								</span>
								<div>
									<h2 className="font-display text-lg font-semibold">Você ainda não tem assinatura</h2>
									<p className="mt-2 text-sm text-muted-foreground">
										Assine um plano para liberar o plano do dia, os roteiros de vídeo e o chat com
										sua IA gerente de marketing. Planos a partir de R$ 59/mês, com garantia de 7 dias.
									</p>
									<Button asChild className="mt-5 gap-2">
										<Link to="/plans"><Sparkles className="h-4 w-4" />Ver planos</Link>
									</Button>
								</div>
							</div>
						</section>

						<SubscriptionAccountSection className="hidden" />
					</div>
				)}
			</main>
		</div>
	);
}
