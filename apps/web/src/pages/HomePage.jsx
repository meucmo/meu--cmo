import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
	ArrowRight,
	Bot,
	CalendarCheck2,
	Check,
	ChevronDown,
	Clapperboard,
	GraduationCap,
	HeartPulse,
	Megaphone,
	MessagesSquare,
	Quote,
	ShieldCheck,
	Sparkles,
	Store,
	Video,
	Zap,
	Clock,
	TrendingUp,
	Users,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const MARQUEE_ITEMS = [
	'Plano do dia',
	'Roteiro de Reels',
	'Stories estratégicos',
	'Ações comerciais',
	'Chat com seu CMO',
	'Educação de pacientes',
	'Posicionamento profissional',
	'Calendário de conteúdo',
];

const PLANOS = [
	{
		nome: 'Empresa',
		preco: 'R$ 59',
		descricao: 'Para quem está começando a aparecer todos os dias.',
		itens: ['1 empresa', 'Plano do dia gerado por IA', 'Roteiro de vídeo pronto para gravar', 'Chat com seu CMO (10 msg/dia)'],
		destaque: false,
	},
	{
		nome: 'Pro Empresa',
		preco: 'R$ 97',
		descricao: 'Para negócios que querem acelerar com estratégia semanal.',
		itens: ['Tudo do plano Empresa', 'Planejamento semanal', 'Histórico completo', 'Relatórios de evolução'],
		destaque: true,
	},
	{
		nome: 'Saúde',
		preco: 'R$ 397',
		descricao: 'Marketing ético e educativo para clínicas e profissionais de saúde.',
		itens: ['Tudo do Pro Empresa', 'Estratégia especializada em saúde', 'Comunicação ética, sem promessas', 'Autoridade profissional'],
		destaque: false,
	},
];

const PROBLEMAS = [
	{ titulo: 'Você não sabe o que postar', texto: 'Toda manhã a mesma dúvida. A conta fica parada e o concorrente aparece primeiro.' },
	{ titulo: 'Não tem tempo para pensar', texto: 'Você precisa atender o cliente, cuidar do negócio e ainda criar conteúdo. Sobra pouco tempo.' },
	{ titulo: 'Agência é cara e distante', texto: 'Contratar um profissional de marketing custa caro e não entende o seu dia a dia.' },
];

const BENEFICIOS = [
	{ icon: CalendarCheck2, titulo: 'Plano do dia, todo dia', texto: 'Acorda e já sabe o que postar, qual ação comercial fazer e o que gravar — sem perder tempo pensando.' },
	{ icon: Clapperboard, titulo: 'Roteiro pronto para gravar', texto: 'Cena por cena, com fala, enquadramento e dica de gravação. É só pegar o celular e gravar.' },
	{ icon: MessagesSquare, titulo: 'Chat com seu CMO', texto: 'Converse lado a lado com sua IA, peça ajustes e tire dúvidas como faria com um gerente de marketing.' },
	{ icon: TrendingUp, titulo: 'Estratégia que evolui', texto: 'Planos semanais e mensais, histórico completo e relatórios de evolução para crescer com método.' },
];

const FEATURES = [
	{ icon: Sparkles, titulo: 'IA que entende seu negócio', texto: 'A IA aprende com o contexto da sua empresa — segmento, público, produtos e objetivos — para gerar planos que fazem sentido.' },
	{ icon: Video, titulo: 'Roteiros de vídeo profissionais', texto: 'Estrutura completa: gancho, desenvolvimento, entrega de valor e CTA final. Com sugestão de áudio e texto na tela.' },
	{ icon: Megaphone, titulo: 'Ações comerciais além das redes', texto: 'Não é só postar. O plano inclui ações de venda, relacionamento e educação que movem o caixa.' },
	{ icon: HeartPulse, titulo: 'Modo saúde com ética', texto: 'Para clínicas e profissionais: comunicação educativa, sem promessas de cura e sem linguagem agressiva.' },
	{ icon: Clock, titulo: 'Economize horas por semana', texto: 'O que levava horas de planejamento vira segundos. Você ganha tempo para atender e cuidar do negócio.' },
	{ icon: Users, titulo: 'Feito para pequenos negócios', texto: 'Comércios locais, serviços e profissionais autônomos. Não precisa de equipe de marketing nem de agência.' },
];

const DEPOIMENTOS = [
	{
		nome: 'Marina Costa',
		empresa: 'Cafeteria Doce Manhã · Recife/PE',
		texto: 'Antes eu passava a manhã sem saber o que postar. Hoje a IA já me entrega o plano do dia e o roteiro do Reels pronto. Dobrei as visitas no perfil em dois meses.',
	},
	{
		nome: 'Dr. Rafael Lima',
		empresa: 'Consultório de Nutrição · São Paulo/SP',
		texto: 'O modo saúde foi o que me conquistou. Conteúdo educativo, sem promessas absurdas. Meus pacientes elogiam a postagem e o consultório ficou mais procurado.',
	},
	{
		nome: 'Jéssica Alves',
		empresa: 'Studio Bem-Estar · Belo Horizonte/MG',
		texto: 'É como ter uma gerente de marketing só pra mim. Eu converso, peço ideias e ela ajusta na hora. Custo uma fração do que pagaria numa agência.',
	},
];

const FAQ = [
	{
		pergunta: 'Preciso saber algo de marketing para usar?',
		resposta: 'Não. O Meu CMO faz o trabalho pesado: você cadastra sua empresa uma vez e recebe o plano do dia pronto, com o que postar e o que fazer. Se quiser ajustar, é só conversar com a IA no chat.',
	},
	{
		pergunta: 'Como funciona a garantia de 7 dias?',
		resposta: 'A partir da ativação da assinatura você tem 7 dias para testar. Se não gostar, pedimos o reembolso integral, sem perguntas. É só entrar em contato pelo suporte.',
	},
	{
		pergunta: 'Posso cancelar quando quiser?',
		resposta: 'Sim. A assinatura é mensal e sem fidelidade. Você cancela direto no painel da sua conta e mantém o acesso até o fim do período já pago.',
	},
	{
		pergunta: 'A IA serve para qualquer tipo de negócio?',
		resposta: 'O Meu CMO é feito para pequenos negócios locais (comércios e serviços) e para profissionais e clínicas de saúde. A IA se adapta ao seu segmento e ao seu público.',
	},
	{
		pergunta: 'No plano Saúde a comunicação é diferente?',
		resposta: 'Sim. No modo saúde a IA prioriza educação do paciente, construção de confiança e posicionamento profissional — sempre de forma ética, sem promessas de resultado e sem linguagem agressiva.',
	},
	{
		pergunta: 'Meus dados ficam seguros?',
		resposta: 'Sim. Seus dados ficam isolados na sua conta, com acesso só seu. Não compartilhamos seus dados com terceiros para publicidade. Veja os detalhes na nossa Política de Privacidade.',
	},
];

function ChatMockup() {
	return (
		<div className="relative">
			<div className="absolute -left-6 -top-6 hidden rounded-xl border bg-card px-4 py-3 shadow-lg shadow-primary/10 lg:flex lg:items-center lg:gap-2">
				<Video className="h-4 w-4 text-primary" />
				<span className="text-xs font-medium">Roteiro de vídeo pronto</span>
			</div>
			<div className="absolute -bottom-6 -right-4 hidden rounded-xl border bg-card px-4 py-3 shadow-lg shadow-primary/10 lg:flex lg:items-center lg:gap-2">
				<CalendarCheck2 className="h-4 w-4 text-primary" />
				<span className="text-xs font-medium">Plano do dia gerado</span>
			</div>

			<div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10">
				<div className="flex items-center gap-3 border-b px-5 py-3.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
						M
					</div>
					<div>
						<p className="text-sm font-semibold">Maya</p>
						<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<span className="h-1.5 w-1.5 rounded-full bg-primary" />
							Gerente de marketing · online
						</p>
					</div>
				</div>
				<div className="space-y-4 p-5">
					<div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
						<p className="text-sm font-medium">Bom dia! Seu plano de hoje está pronto:</p>
						<ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
							<li className="flex items-center gap-2">
								<Clapperboard className="h-3.5 w-3.5 text-primary" />
								Reels: “3 erros que afastam clientes”
							</li>
							<li className="flex items-center gap-2">
								<MessagesSquare className="h-3.5 w-3.5 text-primary" />
								Stories: bastidores do atendimento
							</li>
							<li className="flex items-center gap-2">
								<Megaphone className="h-3.5 w-3.5 text-primary" />
								Ação: responder avaliações do Google
							</li>
						</ul>
					</div>
					<div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
						Perfeito! Me passa o roteiro do Reels?
					</div>
					<div className="flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3.5">
						<span className="cmo-typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
						<span className="cmo-typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: '0.15s' }} />
						<span className="cmo-typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: '0.3s' }} />
					</div>
				</div>
			</div>
		</div>
	);
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

const HomePage = () => {
	const { isAuthed } = useAuth();

	return (
		<div className="min-h-[100dvh] bg-background text-foreground">
			<Helmet>
				<title>Meu CMO — IA gerente de marketing para pequenos negócios</title>
				<meta
					name="description"
					content="O Meu CMO é uma IA que atua como gerente de marketing diário do seu negócio: plano do dia, roteiros de vídeo prontos para gravar e chat lado a lado com sua IA. Para negócios locais e profissionais de saúde."
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
						<a href="#como-funciona" className="transition-colors hover:text-foreground">Como funciona</a>
						<a href="#recursos" className="transition-colors hover:text-foreground">Recursos</a>
						<a href="#segmentos" className="transition-colors hover:text-foreground">Segmentos</a>
						<a href="#depoimentos" className="transition-colors hover:text-foreground">Depoimentos</a>
						<Link to="/plans" className="transition-colors hover:text-foreground">Planos</Link>
					</nav>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						{isAuthed ? (
							<Button asChild size="sm">
								<Link to="/dashboard">Ir para o app</Link>
							</Button>
						) : (
							<>
								<Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
									<Link to="/login">Entrar</Link>
								</Button>
								<Button asChild size="sm">
									<Link to="/cadastro">Começar agora</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</header>

			<main>
				{/* Hero */}
				<section className="relative overflow-hidden">
					<div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
					<div className="pointer-events-none absolute -left-24 top-64 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
					<div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
						<Reveal>
							<span className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
								<Sparkles className="h-3.5 w-3.5" />
								IA gerente de marketing, todos os dias
							</span>
							<h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
								Seu marketing diário,{' '}
								<span className="text-primary">planejado por IA</span>{' '}
								— como um CMO de verdade.
							</h1>
							<p className="mt-5 max-w-xl text-lg text-muted-foreground">
								O Meu CMO entrega todo dia o que postar, o que fazer e um roteiro de vídeo
								pronto para gravar — e conversa com você lado a lado, como a gerente de
								marketing da sua empresa.
							</p>
							<div className="mt-8 flex flex-col gap-3 sm:flex-row">
								<Button asChild size="lg" className="gap-2">
									<Link to="/cadastro">
										Criar minha conta
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
								<Button asChild size="lg" variant="outline">
									<Link to="/plans">Ver planos</Link>
								</Button>
							</div>
							<p className="mt-4 text-sm text-muted-foreground">
								Para negócios locais e profissionais de saúde. Planos a partir de R$ 59/mês.
							</p>
						</Reveal>
						<Reveal delay={0.15}>
							<ChatMockup />
						</Reveal>
					</div>
				</section>

				{/* Marquee */}
				<section className="border-y bg-muted/40 py-4" aria-hidden="true">
					<div className="flex overflow-hidden">
						<div className="animate-cmo-marquee flex shrink-0 items-center gap-8 pr-8">
							{[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
								<span key={index} className="flex items-center gap-8 whitespace-nowrap text-sm font-medium text-muted-foreground">
									{item}
									<span className="h-1 w-1 rounded-full bg-primary" />
								</span>
							))}
						</div>
					</div>
				</section>

				{/* Problema → Solução */}
				<section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
					<Reveal>
						<p className="text-xs font-semibold uppercase tracking-wide text-primary">O problema</p>
						<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
							Fazer marketing sozinho custa tempo e clientes
						</h2>
					</Reveal>
					<div className="mt-10 grid gap-6 md:grid-cols-3">
						{PROBLEMAS.map((p, i) => (
							<Reveal key={p.titulo} delay={i * 0.1}>
								<div className="h-full rounded-2xl border bg-card p-6">
									<h3 className="font-display text-base font-semibold">{p.titulo}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
								</div>
							</Reveal>
						))}
					</div>

					<Reveal>
						<div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
							<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
								<Zap className="h-5 w-5 text-primary-foreground" />
							</span>
							<h3 className="font-display text-xl font-semibold">A solução: um CMO que trabalha por você</h3>
							<p className="max-w-2xl text-sm text-muted-foreground">
								Uma IA que age como gerente de marketing diário: planeja, escreve roteiros, sugere ações
								comerciais e conversa com você — por uma fração do custo de uma agência.
							</p>
						</div>
					</Reveal>
				</section>

				{/* Benefícios */}
				<section className="border-t bg-muted/40">
					<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
						<Reveal>
							<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">O que você ganha</h2>
							<p className="mt-3 max-w-2xl text-muted-foreground">
								Resultados concretos no seu dia a dia, sem precisar virar especialista em marketing.
							</p>
						</Reveal>
						<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{BENEFICIOS.map((b, i) => (
								<Reveal key={b.titulo} delay={i * 0.08}>
									<div className="h-full rounded-2xl border bg-card p-6">
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
											<b.icon className="h-5 w-5 text-primary" />
										</div>
										<h3 className="mt-4 font-display text-base font-semibold">{b.titulo}</h3>
										<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.texto}</p>
									</div>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				{/* Como funciona */}
				<section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
					<Reveal>
						<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Como funciona</h2>
						<p className="mt-3 max-w-2xl text-muted-foreground">
							Em três passos, sua empresa ganha uma rotina de marketing profissional — sem
							precisar contratar uma agência.
						</p>
					</Reveal>
					<div className="mt-10 grid gap-6 md:grid-cols-3">
						{[
							{
								icon: Store,
								titulo: '1. Cadastre sua empresa',
								texto: 'Conte sobre seu negócio, seu público e escolha até o nome da sua IA — ela é só sua.',
							},
							{
								icon: CalendarCheck2,
								titulo: '2. Receba o plano do dia',
								texto: 'Todos os dias, um plano claro: Stories, Reels, posts e ações comerciais — com roteiro de vídeo pronto para gravar.',
							},
							{
								icon: MessagesSquare,
								titulo: '3. Converse com seu CMO',
								texto: 'Tire dúvidas e peça ajustes no chat, lado a lado com o plano — como faria com um gerente de marketing.',
							},
						].map((passo, index) => (
							<Reveal key={passo.titulo} delay={index * 0.1}>
								<div className="h-full rounded-2xl border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5">
									<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
										<passo.icon className="h-5 w-5 text-accent-foreground" />
									</div>
									<h3 className="mt-4 font-display text-lg font-semibold">{passo.titulo}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{passo.texto}</p>
								</div>
							</Reveal>
						))}
					</div>
				</section>

				{/* Recursos / Features */}
				<section id="recursos" className="border-t bg-muted/40">
					<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
						<Reveal>
							<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Recursos que entregam resultado</h2>
							<p className="mt-3 max-w-2xl text-muted-foreground">
								Cada recurso foi pensado para o dono de pequeno negócio que precisa de marketing sem complicação.
							</p>
						</Reveal>
						<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{FEATURES.map((f, i) => (
								<Reveal key={f.titulo} delay={i * 0.08}>
									<div className="h-full rounded-2xl border bg-card p-6">
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
											<f.icon className="h-5 w-5 text-primary" />
										</div>
										<h3 className="mt-4 font-display text-base font-semibold">{f.titulo}</h3>
										<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.texto}</p>
									</div>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				{/* Segmentos */}
				<section id="segmentos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
					<Reveal>
						<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Feito para o seu segmento</h2>
					</Reveal>
					<div className="mt-10 grid gap-6 lg:grid-cols-2">
						<Reveal>
							<div className="flex h-full flex-col rounded-2xl border bg-card p-8">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
									<Store className="h-6 w-6 text-primary" />
								</div>
								<h3 className="mt-5 font-display text-xl font-semibold">Negócios locais</h3>
								<p className="mt-2 text-muted-foreground">
									Comércios e serviços que precisam aparecer todos os dias para o cliente da
									região: cafeteria, salão, pet shop, academia, assistência técnica e mais.
								</p>
								<ul className="mt-5 space-y-2.5 text-sm">
									{['Conteúdo pensado para atrair cliente da sua cidade', 'Ações comerciais diárias além das redes sociais', 'Roteiros de vídeo graváveis com o celular'].map((item) => (
										<li key={item} className="flex items-start gap-2.5">
											<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</Reveal>
						<Reveal delay={0.1}>
							<div className="flex h-full flex-col rounded-2xl border bg-card p-8">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
									<HeartPulse className="h-6 w-6 text-primary" />
								</div>
								<h3 className="mt-5 font-display text-xl font-semibold">Área da saúde</h3>
								<p className="mt-2 text-muted-foreground">
									Consultórios, clínicas e profissionais de saúde com uma comunicação que
									constrói autoridade — respeitando a ética do setor.
								</p>
								<ul className="mt-5 space-y-2.5 text-sm">
									{['Prioridade para educação do paciente e construção de confiança', 'Posicionamento profissional antes de qualquer oferta', 'Agendamento sempre de forma sutil e natural'].map((item) => (
										<li key={item} className="flex items-start gap-2.5">
											<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
											<span>{item}</span>
										</li>
									))}
								</ul>
								<div className="mt-6 flex items-start gap-2.5 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
									<ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
									<span>
										Comunicação ética por padrão: sem promessas de resultado e sem
										linguagem promocional agressiva.
									</span>
								</div>
							</div>
						</Reveal>
					</div>
				</section>

				{/* Planos */}
				<section id="planos" className="border-t bg-muted/40">
					<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
						<Reveal>
							<h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">Planos para cada momento</h2>
							<p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
								Assinatura mensal, sem fidelidade. Cancele quando quiser.
							</p>
						</Reveal>
						<div className="mt-10 grid gap-6 md:grid-cols-3">
							{PLANOS.map((plano, index) => (
								<Reveal key={plano.nome} delay={index * 0.1}>
									<div
										className={`relative flex h-full flex-col rounded-2xl border p-7 ${
											plano.destaque
												? 'border-primary bg-card shadow-xl shadow-primary/10'
												: 'bg-card'
										}`}
									>
										{plano.destaque && (
											<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
												Mais popular
											</span>
										)}
										<h3 className="font-display text-lg font-semibold">{plano.nome}</h3>
										<p className="mt-1 text-sm text-muted-foreground">{plano.descricao}</p>
										<p className="mt-5">
											<span className="font-display text-4xl font-bold">{plano.preco}</span>
											<span className="text-sm text-muted-foreground">/mês</span>
										</p>
										<ul className="mt-5 flex-1 space-y-2.5 text-sm">
											{plano.itens.map((item) => (
												<li key={item} className="flex items-start gap-2.5">
													<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
													<span>{item}</span>
												</li>
											))}
										</ul>
										<Button asChild className="mt-7" variant={plano.destaque ? 'default' : 'outline'}>
											<Link to="/plans">Assinar {plano.nome}</Link>
										</Button>
									</div>
								</Reveal>
							))}
						</div>
						<Reveal>
							<p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
								<ShieldCheck className="h-4 w-4 text-primary" />
								Garantia de 7 dias. Não gostou? Devolvemos seu dinheiro.
							</p>
						</Reveal>
					</div>
				</section>

				{/* Depoimentos */}
				<section id="depoimentos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
					<Reveal>
						<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Quem usa, recomenda</h2>
						<p className="mt-3 max-w-2xl text-muted-foreground">
							Pequenos negócios que trocaram a indecisão por uma rotina de marketing profissional.
						</p>
					</Reveal>
					<div className="mt-10 grid gap-6 md:grid-cols-3">
						{DEPOIMENTOS.map((d, i) => (
							<Reveal key={d.nome} delay={i * 0.1}>
								<figure className="flex h-full flex-col rounded-2xl border bg-card p-6">
									<Quote className="h-7 w-7 text-primary/30" />
									<blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
										{d.texto}
									</blockquote>
									<figcaption className="mt-5 border-t pt-4">
										<p className="text-sm font-semibold">{d.nome}</p>
										<p className="text-xs text-muted-foreground">{d.empresa}</p>
									</figcaption>
								</figure>
							</Reveal>
						))}
					</div>
				</section>

				{/* FAQ */}
				<section id="faq" className="border-t bg-muted/40">
					<div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
						<Reveal>
							<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Perguntas frequentes</h2>
						</Reveal>
						<div className="mt-8">
							{FAQ.map((item) => (
								<FaqItem key={item.pergunta} pergunta={item.pergunta} resposta={item.resposta} />
							))}
						</div>
					</div>
				</section>

				{/* CTA final */}
				<section className="border-t bg-primary">
					<div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
						<Reveal>
							<GraduationCap className="mx-auto hidden" />
							<h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
								Sua empresa merece um CMO. Mesmo que seja uma IA.
							</h2>
							<p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
								Comece hoje: cadastre sua empresa, escolha o nome da sua assistente e receba
								o primeiro plano do dia em minutos.
							</p>
							<Button asChild size="lg" variant="secondary" className="mt-8 gap-2">
								<Link to="/cadastro">
									Criar minha conta
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</Reveal>
					</div>
				</section>
			</main>

			<footer className="border-t">
				<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
						<div className="lg:col-span-1">
							<div className="flex items-center gap-2">
								<span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
									<Bot className="h-3.5 w-3.5 text-primary-foreground" />
								</span>
								<span className="font-display font-semibold text-foreground">Meu CMO</span>
							</div>
							<p className="mt-3 max-w-xs text-sm text-muted-foreground">
								A IA gerente de marketing que planeja o seu dia e conversa com você.
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Produto</p>
							<ul className="mt-3 space-y-2 text-sm">
								<li><a href="#como-funciona" className="text-muted-foreground transition-colors hover:text-foreground">Como funciona</a></li>
								<li><a href="#recursos" className="text-muted-foreground transition-colors hover:text-foreground">Recursos</a></li>
								<li><Link to="/plans" className="text-muted-foreground transition-colors hover:text-foreground">Planos</Link></li>
							</ul>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conta</p>
							<ul className="mt-3 space-y-2 text-sm">
								<li><Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">Entrar</Link></li>
								<li><Link to="/cadastro" className="text-muted-foreground transition-colors hover:text-foreground">Criar conta</Link></li>
								<li><Link to="/subscriptions" className="text-muted-foreground transition-colors hover:text-foreground">Minha assinatura</Link></li>
							</ul>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legal</p>
							<ul className="mt-3 space-y-2 text-sm">
								<li><Link to="/termos" className="text-muted-foreground transition-colors hover:text-foreground">Termos de Serviço</Link></li>
								<li><Link to="/privacidade" className="text-muted-foreground transition-colors hover:text-foreground">Política de Privacidade</Link></li>
								<li><Link to="/?migracao=1" className="text-muted-foreground transition-colors hover:text-foreground">Validação da migração</Link></li>
							</ul>
						</div>
					</div>
					<div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
						© {new Date().getFullYear()} Meu CMO. Todos os direitos reservados.
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;
