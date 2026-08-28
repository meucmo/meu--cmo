import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Bot, Check, ChevronDown, Minus, ShieldCheck, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const COMPARACAO = [
	{ recurso: 'Plano do dia gerado por IA', empresa: true, pro: true, saude: true },
	{ recurso: 'Roteiro de vídeo pronto para gravar', empresa: true, pro: true, saude: true },
	{ recurso: 'Chat com seu CMO', empresa: '10 msg/dia', pro: 'Ilimitado', saude: 'Ilimitado' },
	{ recurso: 'Número de empresas', empresa: '1', pro: 'Ilimitado', saude: 'Ilimitado' },
	{ recurso: 'Plano da semana', empresa: false, pro: true, saude: true },
	{ recurso: 'Calendário mensal', empresa: false, pro: true, saude: true },
	{ recurso: 'Histórico de planos', empresa: '30 dias', pro: 'Completo', saude: 'Completo' },
	{ recurso: 'Relatórios de evolução', empresa: false, pro: true, saude: true },
	{ recurso: 'Estratégia especializada em saúde', empresa: false, pro: false, saude: true },
	{ recurso: 'Comunicação ética (modo saúde)', empresa: false, pro: false, saude: true },
	{ recurso: 'Suporte por e-mail', empresa: true, pro: true, saude: true },
	{ recurso: 'Garantia de 7 dias', empresa: true, pro: true, saude: true },
];

const FAQ_PLANOS = [
	{
		pergunta: 'Como funciona a cobrança?',
		resposta: 'A assinatura é mensal e renovada automaticamente até você cancelar. O pagamento é processado por um provedor seguro e você pode gerenciar tudo pelo painel da sua conta.',
	},
	{
		pergunta: 'Posso trocar de plano depois?',
		resposta: 'Sim. Você pode fazer upgrade ou downgrade a qualquer momento pelo painel de gerenciamento da assinatura. O valor é ajustado proporcionalmente no próximo ciclo.',
	},
	{
		pergunta: 'E se eu não gostar?',
		resposta: 'Você tem 7 dias de garantia a partir da ativação. Se não estiver satisfeito, devolvemos 100% do valor — sem perguntas.',
	},
	{
		pergunta: 'Tem fidelidade ou multa?',
		resposta: 'Não. A assinatura é mensal e sem fidelidade. Cancele quando quiser, direto no painel, e mantenha o acesso até o fim do período já pago.',
	},
	{
		pergunta: 'Qual a diferença do plano Saúde?',
		resposta: 'O plano Saúde inclui tudo do Pro Empresa, mais estratégia especializada em comunicação ética para clínicas e profissionais de saúde: educação do paciente, posicionamento profissional e agendamento sutil.',
	},
	{
		pergunta: 'Posso testar antes de pagar?',
		resposta: 'A garantia de 7 dias funciona como um período de teste: você assina, usa à vontade e, se não fizer sentido, pede o reembolso integral dentro desse prazo.',
	},
];

const PLANOS = [
	{
		nome: 'Empresa',
		preco: 'R$ 59',
		periodo: '/mês',
		destaque: false,
		descricao: 'Para o pequeno negócio local que quer um plano de marketing todo dia.',
		recursos: [
			'Plano do dia gerado por IA',
			'Roteiro de vídeo pronto para gravar',
			'Chat com seu CMO (10 msg/dia)',
			'1 empresa',
			'Histórico de 30 dias',
			'Suporte por e-mail',
		],
	},
	{
		nome: 'Pro Empresa',
		preco: 'R$ 97',
		periodo: '/mês',
		destaque: true,
		descricao: 'Para quem quer crescer mais rápido com estratégia de semana e mês.',
		recursos: [
			'Tudo do plano Empresa',
			'Chat ilimitado com seu CMO',
			'Empresas ilimitadas',
			'Plano da semana + calendário mensal',
			'Histórico completo + relatórios',
			'Suporte por e-mail',
		],
	},
	{
		nome: 'Saúde',
		preco: 'R$ 397',
		periodo: '/mês',
		destaque: false,
		descricao: 'Para clínicas e profissionais de saúde, com comunicação ética.',
		recursos: [
			'Tudo do plano Pro Empresa',
			'Estratégia especializada em saúde',
			'Comunicação ética (modo saúde)',
			'Educação do paciente e posicionamento',
			'Agendamento sutil',
			'Suporte por e-mail',
		],
	},
];

function PlanCard({ plano, isAuthed }) {
	return (
		<div className={`relative flex flex-col rounded-2xl border bg-card p-6 ${plano.destaque ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
			{plano.destaque && (
				<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
					Mais popular
				</span>
			)}
			<h3 className="font-display text-xl font-bold tracking-tight">{plano.nome}</h3>
			<p className="mt-1 text-sm text-muted-foreground">{plano.descricao}</p>
			<p className="mt-4 text-3xl font-bold">
				{plano.preco}
				<span className="text-sm font-normal text-muted-foreground"> {plano.periodo}</span>
			</p>
			<ul className="mt-5 space-y-2.5 text-sm">
				{plano.recursos.map((recurso) => (
					<li key={recurso} className="flex items-start gap-2">
						<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
						<span>{recurso}</span>
					</li>
				))}
			</ul>
			<div className="mt-6">
				<Button asChild className="w-full" variant={plano.destaque ? 'default' : 'outline'}>
					<Link to={isAuthed ? '/subscriptions' : '/cadastro'}>
						Escolher plano
					</Link>
				</Button>
			</div>
		</div>
	);
}

function Celula({ valor }) {
	if (valor === true) {
		return (
			<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
				<Check className="h-3.5 w-3.5 text-primary" />
			</span>
		);
	}
	if (valor === false) {
		return (
			<span className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground/40">
				<Minus className="h-3.5 w-3.5" />
			</span>
		);
	}
	return <span className="text-sm font-medium">{valor}</span>;
}

function FaqItem({ pergunta, resposta }) {
	const [aberto, setAberto] = useState(false);
	return (
		<div className="border-b">
			<button
				type="button"
				onClick={() => setAberto((v) => !v)}
				className="flex w-full items-center justify-between gap-4 py-5 text-left"
				aria-expanded={aberto}
			>
				<span className="font-medium">{pergunta}</span>
				<ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${aberto ? 'rotate-180' : ''}`} />
			</button>
			{aberto && <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{resposta}</p>}
		</div>
	);
}

export default function PlansPage() {
	const { isAuthed } = useAuth();

	return (
		<div className="min-h-[100dvh] bg-muted/40">
			<Helmet>
				<title>Planos — Meu CMO</title>
				<meta
					name="description"
					content="Assine o Meu CMO: Empresa R$ 59/mês, Pro Empresa R$ 97/mês ou Saúde R$ 397/mês. IA gerente de marketing para o seu negócio. Garantia de 7 dias."
				/>
			</Helmet>
			<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
					<Link to="/" className="flex items-center gap-2">
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<Bot className="h-4.5 w-4.5 text-primary-foreground" />
						</span>
						<span className="font-display text-lg font-bold tracking-tight">Meu CMO</span>
					</Link>
					<nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
						<Link to="/" className="transition-colors hover:text-foreground">Início</Link>
						<a href="#comparacao" className="transition-colors hover:text-foreground">Comparação</a>
						<a href="#faq" className="transition-colors hover:text-foreground">Dúvidas</a>
					</nav>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						{isAuthed ? (
							<Button asChild size="sm" variant="outline">
								<Link to="/dashboard">Ir para o app</Link>
							</Button>
						) : (
							<Button asChild size="sm" variant="outline">
								<Link to="/login">Entrar</Link>
							</Button>
						)}
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
				<header className="mb-10 text-center">
					<span className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
						<Sparkles className="h-3.5 w-3.5" />
						Garantia de 7 dias
					</span>
					<h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						Escolha o plano ideal
					</h1>
					<p className="mx-auto mt-3 max-w-xl text-muted-foreground">
						Assinatura mensal, sem fidelidade. Sua IA gerente de marketing começa a trabalhar
						assim que a assinatura é confirmada.
					</p>
				</header>

				{/* Planos */}
				<div className="grid gap-6 md:grid-cols-3">
					{PLANOS.map((plano) => (
						<PlanCard key={plano.nome} plano={plano} isAuthed={isAuthed} />
					))}
				</div>

				<p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
					<ShieldCheck className="h-4 w-4 text-primary" />
					Pagamento seguro. Cancele quando quiser, direto na sua conta.
				</p>

				{/* Comparação */}
				<section id="comparacao" className="mt-20">
					<h2 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
						Compare os planos
					</h2>
					<p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
						Tudo o que está incluído em cada plano, lado a lado.
					</p>

					<div className="mt-8 overflow-x-auto">
						<table className="w-full min-w-[640px] border-collapse">
							<thead>
								<tr className="border-b">
									<th className="py-4 pr-4 text-left text-sm font-semibold">Recurso</th>
									<th className="px-4 py-4 text-center text-sm font-semibold">
										Empresa
										<span className="mt-0.5 block text-xs font-normal text-muted-foreground">R$ 59/mês</span>
									</th>
									<th className="rounded-t-xl bg-primary/5 px-4 py-4 text-center text-sm font-semibold">
										Pro Empresa
										<span className="mt-0.5 block text-xs font-normal text-muted-foreground">R$ 97/mês</span>
									</th>
									<th className="px-4 py-4 text-center text-sm font-semibold">
										Saúde
										<span className="mt-0.5 block text-xs font-normal text-muted-foreground">R$ 397/mês</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{COMPARACAO.map((linha, i) => (
									<tr key={linha.recurso} className={i % 2 ? 'bg-muted/30' : ''}>
										<td className="py-3.5 pr-4 text-sm text-foreground/90">{linha.recurso}</td>
										<td className="px-4 py-3.5 text-center"><Celula valor={linha.empresa} /></td>
										<td className="bg-primary/5 px-4 py-3.5 text-center"><Celula valor={linha.pro} /></td>
										<td className="px-4 py-3.5 text-center"><Celula valor={linha.saude} /></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				{/* Garantia */}
				<section className="mt-16">
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
						<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
							<ShieldCheck className="h-6 w-6 text-primary-foreground" />
						</span>
						<h2 className="font-display text-xl font-semibold">Garantia de 7 dias</h2>
						<p className="max-w-xl text-sm text-muted-foreground">
							A partir da ativação da assinatura você tem 7 dias para testar o Meu CMO à vontade.
							Se não fizer sentido para o seu negócio, devolvemos 100% do valor — sem perguntas e sem burocracia.
						</p>
					</div>
				</section>

				{/* FAQ */}
				<section id="faq" className="mx-auto mt-16 max-w-3xl">
					<h2 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
						Dúvidas sobre os planos
					</h2>
					<div className="mt-8">
						{FAQ_PLANOS.map((item) => (
							<FaqItem key={item.pergunta} pergunta={item.pergunta} resposta={item.resposta} />
						))}
					</div>
				</section>

				{/* CTA */}
				<section className="mt-16 text-center">
					<Button asChild size="lg" className="gap-2">
						<Link to="/cadastro">
							Começar agora
						</Link>
					</Button>
					<p className="mt-3 text-sm text-muted-foreground">
						Cancele quando quiser. Sem fidelidade.
					</p>
				</section>
			</main>

			<footer className="border-t">
				<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
					<div className="flex items-center gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
							<Bot className="h-3.5 w-3.5 text-primary-foreground" />
						</span>
						<span className="font-display font-semibold text-foreground">Meu CMO</span>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-5">
						<Link to="/" className="transition-colors hover:text-foreground">Início</Link>
						<Link to="/termos" className="transition-colors hover:text-foreground">Termos</Link>
						<Link to="/privacidade" className="transition-colors hover:text-foreground">Privacidade</Link>
						<Link to="/login" className="transition-colors hover:text-foreground">Entrar</Link>
					</div>
					<p>© {new Date().getFullYear()} Meu CMO</p>
				</div>
			</footer>
		</div>
	);
}
