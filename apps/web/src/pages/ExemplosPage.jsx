import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate } from 'react-router-dom';
import {
	ArrowLeft,
	Bot,
	CheckCircle2,
	Copy,
	FlaskConical,
	Loader2,
	RefreshCw,
	ShieldCheck,
	Sparkles,
	Store,
	HeartPulse,
	XCircle,
	ClipboardCheck,
	FileText,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import {
	EXEMPLOS,
	validarPlano,
	planoParaTexto,
} from '@/lib/exemplosPlano';
import { generateAndSaveDailyPlan } from '@/lib/dailyPlan';

function isDev() {
	return import.meta.env && import.meta.env.DEV;
}

function CampoCadastro({ label, value }) {
	if (!value) return null;
	return (
		<div className="flex gap-2 text-sm">
			<span className="shrink-0 w-40 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
			<span className="min-w-0 text-foreground/90">{value}</span>
		</div>
	);
}

function PlanoExemploView({ exemplo }) {
	const { cadastro, plano } = exemplo;
	const copiar = () => {
		navigator.clipboard?.writeText(planoParaTexto(exemplo)).then(() => {
			toast({ title: 'Plano copiado', description: 'O texto completo do exemplo foi copiado.' });
		});
	};

	return (
		<div className="space-y-5">
			{/* Cadastro simulado */}
			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center gap-2">
					<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
						<Store className="h-3.5 w-3.5 text-accent-foreground" />
					</span>
					<h3 className="text-sm font-semibold">Cadastro simulado</h3>
				</div>
				<div className="mt-3 space-y-1.5">
					<CampoCadastro label="Empresa" value={cadastro.nome} />
					<CampoCadastro label="Segmento" value={cadastro.segmento === 'saude' ? 'Saúde' : 'Negócio local'} />
					<CampoCadastro label="Cidade" value={`${cadastro.cidade}-${cadastro.estado}`} />
					<CampoCadastro label="Especialidade" value={cadastro.especialidade} />
					<CampoCadastro label="Público-alvo" value={cadastro.publico_alvo} />
					<CampoCadastro label="Objetivo" value={cadastro.objetivos} />
					<CampoCadastro label="Contexto/promoção" value={cadastro.promocoes_atuais} />
					<CampoCadastro label="Assistente" value={cadastro.assistente_nome} />
				</div>
			</div>

			{/* Plano do dia */}
			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
							<ClipboardCheck className="h-3.5 w-3.5 text-primary" />
						</span>
						<h3 className="text-sm font-semibold">Plano do dia (formato Parte 1, seção 2)</h3>
					</div>
					<Button type="button" variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={copiar}>
						<Copy className="h-3.5 w-3.5" />Copiar plano
					</Button>
				</div>

				<div className="mt-3 space-y-4">
					<div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
						<p className="text-xs font-semibold uppercase tracking-wide text-primary">Objetivo do dia</p>
						<p className="mt-1 text-sm font-medium">{plano.objetivo}</p>
					</div>
					<p className="text-sm text-muted-foreground">{plano.briefing}</p>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-primary">Stories</p>
							<p className="mt-1.5 text-sm">{plano.stories.horario} · {plano.stories.o_que_gravar}</p>
							<p className="text-xs text-muted-foreground">Texto: {plano.stories.texto}</p>
							<p className="text-xs text-muted-foreground">CTA: {plano.stories.cta}</p>
						</div>
						<div className="rounded-lg border p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-primary">Reels</p>
							<p className="mt-1.5 text-sm">{plano.reels.horario} · {plano.reels.tema}</p>
							<p className="text-xs text-muted-foreground">Gancho: {plano.reels.gancho}</p>
							<p className="text-xs text-primary">{Array.isArray(plano.reels.hashtags) ? plano.reels.hashtags.join(' ') : plano.reels.hashtags}</p>
						</div>
						<div className="rounded-lg border p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-primary">Post de feed</p>
							<p className="mt-1.5 text-sm">{plano.post_feed.ideia_imagem}</p>
							<p className="text-xs text-muted-foreground">CTA: {plano.post_feed.cta}</p>
						</div>
						<div className="rounded-lg border p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-primary">Meta do dia</p>
							<p className="mt-1.5 text-xs text-muted-foreground">Leads: {plano.meta_do_dia.leads}</p>
							<p className="text-xs text-muted-foreground">Conversas: {plano.meta_do_dia.conversas}</p>
							<p className="text-xs text-muted-foreground">Agendamentos: {plano.meta_do_dia.agendamentos}</p>
							<p className="text-xs text-muted-foreground">Vendas: {plano.meta_do_dia.vendas}</p>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-primary">Ação comercial</p>
							<p className="mt-1.5 text-sm">{plano.acao_comercial}</p>
						</div>
						<div className="rounded-lg border p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-primary">Ação extra</p>
							<p className="mt-1.5 text-sm">{plano.acao_extra}</p>
						</div>
					</div>

					<div className="rounded-lg border p-3">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Checklist de ontem</p>
						<ul className="mt-1.5 space-y-1">
							{(plano.checklist_ontem || []).map((item, i) => (
								<li key={i} className="flex items-start gap-2 text-sm">
									<CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
									<span className="text-muted-foreground">{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			{/* Roteiro de vídeo */}
			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center gap-2">
					<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
						<FileText className="h-3.5 w-3.5 text-primary" />
					</span>
					<h3 className="text-sm font-semibold">Roteiro de vídeo (formato Parte 1, seção 3)</h3>
				</div>
				<div className="mt-3 space-y-3">
					<div>
						<p className="font-display text-base font-semibold">{plano.roteiro_video.titulo}</p>
						<p className="text-xs text-muted-foreground">{plano.roteiro_video.formato} · {plano.roteiro_video.duracao_segundos}s</p>
					</div>
					<div className="space-y-2.5">
						{(plano.roteiro_video.cenas || []).map((cena, i) => (
							<div key={i} className="flex gap-3">
								<span className="mt-0.5 shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">{cena.tempo}</span>
								<div className="min-w-0">
									<p className="text-xs font-semibold uppercase tracking-wide text-primary">{cena.nome}</p>
									<p className="text-sm">{cena.fala}</p>
									<p className="mt-0.5 text-xs text-muted-foreground">Visual: {cena.acao}</p>
								</div>
							</div>
						))}
					</div>
					<div className="space-y-1 rounded-lg bg-accent/50 px-3 py-2.5 text-xs">
						<p>🎵 Áudio: {plano.roteiro_video.audio}</p>
						<p>📝 Texto na tela: {plano.roteiro_video.texto_tela}</p>
						<p>💡 Dica: {plano.roteiro_video.dica_gravacao}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function ValidacaoPainel({ resultado }) {
	if (!resultado) return null;
	const { conformidade, checagens, problemas } = resultado;
	const cor = conformidade >= 90 ? 'text-primary' : conformidade >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-destructive';
	return (
		<div className="space-y-4">
			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Score de conformidade</p>
						<p className={cn('font-display text-3xl font-bold', cor)}>{conformidade}%</p>
					</div>
					{conformidade >= 90 ? (
						<Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10"><CheckCircle2 className="h-3 w-3" />Conforme</Badge>
					) : (
						<Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Desvios</Badge>
					)}
				</div>
				<Progress value={conformidade} className="mt-3 h-2" />
			</div>

			<div className="rounded-xl border bg-card p-4">
				<h3 className="text-sm font-semibold">Checagens automáticas</h3>
				<ul className="mt-3 space-y-2">
					{checagens.map((c, i) => (
						<li key={i} className="flex items-start gap-2.5 text-sm">
							{c.ok ? (
								<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							) : (
								<XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
							)}
							<div className="min-w-0">
								<p className={cn('font-medium', c.ok ? 'text-foreground' : 'text-foreground')}>{c.label}</p>
								<p className="text-xs text-muted-foreground">{c.detalhe}</p>
							</div>
						</li>
					))}
				</ul>
			</div>

			{problemas.length > 0 && (
				<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
					<h3 className="text-sm font-semibold text-destructive">Desvios e correções sugeridas</h3>
					<ul className="mt-2 space-y-1.5">
						{problemas.map((p, i) => (
							<li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
								<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
								{p}
							</li>
						))}
					</ul>
					<p className="mt-3 text-xs text-muted-foreground">
						Ajuste o prompt em <code className="rounded bg-muted px-1 py-0.5 text-[11px]">apps/api/src/constants/prompts.js</code> para corrigir os desvios recorrentes.
					</p>
				</div>
			)}
		</div>
	);
}

function TestePanel({ exemplo }) {
	const { cadastro, plano: esperado } = exemplo;
	const saude = cadastro.segmento === 'saude';
	const [gerando, setGerando] = useState(false);
	const [resultado, setResultado] = useState(null);
	const [planoGerado, setPlanoGerado] = useState(null);
	const [empresaTeste, setEmpresaTeste] = useState(null);

	const esperadoValidacao = useMemo(
		() => validarPlano(esperado, { saude }),
		[esperado, saude],
	);

	const usarComoTemplate = async () => {
		try {
			const ownerId = pb.authStore.record.id;
			const existente = await pb.collection('empresas').getList(1, 1, {
				filter: pb.filter('nome = {:n} && owner = {:o}', { n: `${cadastro.nome} (teste)`, o: ownerId }),
			});
			if (existente.items[0]) {
				setEmpresaTeste(existente.items[0]);
				toast({ title: 'Empresa de teste já existe', description: 'Reutilizando a empresa de teste criada antes.' });
				return;
			}
			const criada = await pb.collection('empresas').create({
				nome: `${cadastro.nome} (teste)`,
				segmento: cadastro.segmento,
				especialidade: cadastro.especialidade,
				cidade: cadastro.cidade,
				estado: cadastro.estado,
				instagram: cadastro.instagram,
				whatsapp: cadastro.whatsapp,
				publico_alvo: cadastro.publico_alvo,
				objetivos: cadastro.objetivos,
				promocoes_atuais: cadastro.promocoes_atuais,
				assistente_nome: cadastro.assistente_nome,
				tom_de_voz: cadastro.tom_de_voz,
				owner: ownerId,
				onboarding_completo: true,
			});
			setEmpresaTeste(criada);
			toast({ title: 'Empresa de teste criada', description: `${criada.nome} pronta para gerar planos de teste.` });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao criar empresa de teste', description: err?.message || 'Tente novamente.' });
		}
	};

	const gerar = async () => {
		let empresa = empresaTeste;
		if (!empresa) {
			try {
				const ownerId = pb.authStore.record.id;
				const existente = await pb.collection('empresas').getList(1, 1, {
					filter: pb.filter('nome = {:n} && owner = {:o}', { n: `${cadastro.nome} (teste)`, o: ownerId }),
				});
				empresa = existente.items[0] || null;
				if (empresa) setEmpresaTeste(empresa);
			} catch { /* ignore */ }
		}
		if (!empresa) {
			toast({ variant: 'destructive', title: 'Crie a empresa de teste primeiro', description: 'Clique em "Usar como template".' });
			return;
		}
		setGerando(true);
		setResultado(null);
		setPlanoGerado(null);
		try {
			const { plano } = await generateAndSaveDailyPlan(empresa);
			const json = plano?.plano_completo || null;
			setPlanoGerado(json);
			const res = validarPlano(json, { saude });
			setResultado(res);
			toast({
				title: `Plano gerado — ${res.conformidade}% conforme`,
				description: res.ok ? 'A saída está no formato esperado.' : `${res.problemas.length} desvio(s) detectado(s).`,
			});
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Não foi possível gerar',
				description: err?.status === 403 ? 'Confirme seu e-mail para usar a IA.' : err?.message || 'Tente novamente.',
			});
		} finally {
			setGerando(false);
		}
	};

	return (
		<div className="space-y-5">
			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center gap-2">
					<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
						<FlaskConical className="h-3.5 w-3.5 text-primary" />
					</span>
					<h3 className="text-sm font-semibold">Modo teste — {cadastro.nome}</h3>
					{saude && <Badge variant="outline" className="gap-1"><HeartPulse className="h-3 w-3" />Modo Saúde</Badge>}
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					Gera um plano real com a IA usando os dados simulados deste exemplo e compara a saída com o
					formato esperado da Parte 1. {saude && 'Valida também as regras éticas do Modo Saúde.'}
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Button type="button" variant="outline" size="sm" onClick={usarComoTemplate} className="gap-1.5">
						<Store className="h-3.5 w-3.5" />
						{empresaTeste ? 'Empresa de teste pronta' : 'Usar como template'}
					</Button>
					<Button type="button" size="sm" onClick={gerar} disabled={gerando} className="gap-1.5">
						{gerando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
						{gerando ? 'Gerando…' : resultado ? 'Regenerar' : 'Gerar plano de teste'}
					</Button>
				</div>
				{empresaTeste && (
					<p className="mt-3 text-xs text-muted-foreground">
						Empresa de teste: <span className="font-medium text-foreground">{empresaTeste.nome}</span>
					</p>
				)}
			</div>

			{gerando && (
				<div className="space-y-3">
					<Skeleton className="h-7 w-1/2" />
					<Skeleton className="h-24 w-full rounded-xl" />
					<Skeleton className="h-24 w-full rounded-xl" />
				</div>
			)}

			{resultado && (
				<div className="grid gap-5 lg:grid-cols-2">
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saída da IA</p>
						<ValidacaoPainel resultado={resultado} />
					</div>
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exemplo esperado (referência)</p>
						<div className="rounded-xl border bg-muted/30 p-4">
							<p className="font-display text-base font-semibold">{esperado.objetivo}</p>
							<p className="mt-1 text-xs text-muted-foreground">Conformidade de referência: {esperadoValidacao.conformidade}%</p>
							<div className="mt-3 space-y-1.5">
								{esperadoValidacao.checagens.slice(0, 6).map((c, i) => (
									<div key={i} className="flex items-center gap-2 text-xs">
										<CheckCircle2 className="h-3.5 w-3.5 text-primary" />
										<span className="text-muted-foreground">{c.label}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{planoGerado && (
				<details className="rounded-xl border bg-card p-4">
					<summary className="cursor-pointer text-sm font-semibold">Ver JSON bruto gerado pela IA</summary>
					<pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-muted/50 p-3 text-[11px] leading-relaxed">
						{JSON.stringify(planoGerado, null, 2)}
					</pre>
				</details>
			)}
		</div>
	);
}

export default function ExemplosPage() {
	const { user } = useAuth();
	const [aba, setAba] = useState('barbearia');

	// Acesso restrito: admin ou modo desenvolvimento.
	if (user && user.role !== 'admin' && !isDev()) {
		return <Navigate to="/dashboard" replace />;
	}

	const exemploAtivo = EXEMPLOS.find((e) => e.id === aba) || EXEMPLOS[0];

	return (
		<div className="min-h-[100dvh] bg-muted/40">
			<Helmet>
				<title>Exemplos e Validação — Meu CMO</title>
				<meta name="description" content="Exemplos de plano do dia e validação automática do formato da IA (Parte 1)." />
			</Helmet>
			<header className="flex h-14 items-center justify-between border-b bg-background px-4">
				<div className="flex items-center gap-3">
					<Button asChild variant="ghost" size="icon" aria-label="Voltar ao painel">
						<Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
					</Button>
					<div className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
							<Bot className="h-4 w-4 text-primary-foreground" />
						</span>
						<span className="font-display text-base font-bold tracking-tight">Meu CMO</span>
						<Badge variant="secondary" className="gap-1">
							<FlaskConical className="h-3 w-3" />Exemplos
						</Badge>
					</div>
				</div>
				<ThemeToggle />
			</header>

			<main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="font-display text-2xl font-bold tracking-tight">Exemplos e validação de formato</h1>
						<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
							Dois casos de teste prontos para validar se a IA gera planos exatamente no formato da
							Parte 1 (seções 2 e 3). Compare a saída real com o exemplo esperado e veja o score de
							conformidade.
						</p>
					</div>
					<Badge variant="outline" className="hidden gap-1 sm:inline-flex">
						<ShieldCheck className="h-3 w-3" />
						{user?.role === 'admin' ? 'Acesso admin' : 'Modo dev'}
					</Badge>
				</div>

				<Tabs value={aba} onValueChange={setAba} className="mt-6">
					<TabsList className="grid w-full max-w-md grid-cols-2">
						{EXEMPLOS.map((e) => (
							<TabsTrigger key={e.id} value={e.id} className="gap-1.5">
								{e.exemplo.cadastro.segmento === 'saude' ? <HeartPulse className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
								{e.label}
							</TabsTrigger>
						))}
					</TabsList>

					{EXEMPLOS.map((e) => (
						<TabsContent key={e.id} value={e.id} className="mt-5 space-y-6">
							<p className="text-xs text-muted-foreground">{e.subtitulo}</p>

							<Tabs defaultValue="exemplo">
								<TabsList>
									<TabsTrigger value="exemplo" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Exemplo esperado</TabsTrigger>
									<TabsTrigger value="teste" className="gap-1.5"><FlaskConical className="h-3.5 w-3.5" />Testar IA</TabsTrigger>
								</TabsList>
								<TabsContent value="exemplo" className="mt-4">
									<PlanoExemploView exemplo={e.exemplo} />
								</TabsContent>
								<TabsContent value="teste" className="mt-4">
									<TestePanel exemplo={e.exemplo} />
								</TabsContent>
							</Tabs>
						</TabsContent>
					))}
				</Tabs>
			</main>
		</div>
	);
}
