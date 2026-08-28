import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate } from 'react-router-dom';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
	Bot,
	CalendarDays,
	CheckCircle2,
	Clapperboard,
	Copy,
	HeartPulse,
	History,
	Image as ImageIcon,
	LayoutDashboard,
	Lightbulb,
	Loader2,
	LogOut,
	Megaphone,
	MessageSquare,
	RefreshCw,
	Send,
	Settings,
	ShieldCheck,
	Sparkles,
	Store,
	Target,
	TrendingUp,
	Video,
	CalendarRange,
	CalendarClock,
	Menu,
	Lock,
	FlaskConical,
	CreditCard,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';
import { useIntegratedAi } from '@/hooks/use-integrated-ai';
import { toast } from '@/hooks/use-toast';
import {
	generateAndSaveDailyPlan,
	generateAndSaveWeekPlan,
	generateAndSaveMonthPlan,
	isPlanRequestMessage,
	isPlanResponseMessage,
	todayKey,
} from '@/lib/dailyPlan';
import { getActiveTier, getTierLimits, TIER_LABELS, countTodayUserMessages } from '@/lib/planTier';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const TIPO_META = {
	stories: { label: 'Stories', icon: MessageSquare },
	reels: { label: 'Reels', icon: Clapperboard },
	post: { label: 'Post', icon: ImageIcon },
	acao_comercial: { label: 'Ação comercial', icon: Megaphone },
	relacionamento: { label: 'Relacionamento', icon: CheckCircle2 },
	educacao: { label: 'Educação', icon: Sparkles },
};

function TipoBadge({ tipo }) {
	const meta = TIPO_META[tipo] || TIPO_META.post;
	const Icon = meta.icon;
	return (
		<Badge variant="secondary" className="gap-1 font-medium">
			<Icon className="h-3 w-3" />
			{meta.label}
		</Badge>
	);
}

function SectionCard({ icon: Icon, titulo, children, accent }) {
	return (
		<div className="rounded-xl border bg-card p-4">
			<div className="flex items-center gap-2">
				<span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', accent || 'bg-accent')}>
					<Icon className="h-3.5 w-3.5 text-accent-foreground" />
				</span>
				<h3 className="text-sm font-semibold">{titulo}</h3>
			</div>
			<div className="mt-3 text-sm leading-relaxed text-foreground/90">{children}</div>
		</div>
	);
}

function RoteiroCard({ roteiro }) {
	if (!roteiro || typeof roteiro !== 'object') return null;
	const cenas = Array.isArray(roteiro.cenas) ? roteiro.cenas : [];

	const copiar = () => {
		const texto = [
			`🎬 ROTEIRO — ${roteiro.titulo || ''}`,
			`Duração estimada: ${roteiro.duracao_segundos || 30}s`,
			`Formato: ${roteiro.formato || 'vertical 9:16'}`,
			'',
			...cenas.map((cena) =>
				[
					`CENA — ${cena.nome || ''} (${cena.tempo || ''})`,
					`Fala/texto na tela: ${cena.fala || ''}`,
					`Ação/enquadramento: ${cena.acao || ''}`,
				].join('\n'),
			),
			'',
			`🎵 Sugestão de áudio: ${roteiro.audio || ''}`,
			`📝 Texto de apoio na tela: ${roteiro.texto_tela || ''}`,
			`💡 Dica de gravação: ${roteiro.dica_gravacao || ''}`,
		].join('\n');
		navigator.clipboard?.writeText(texto).then(() => {
			toast({ title: 'Roteiro copiado', description: 'Cole no seu bloco de notas e grave.' });
		});
	};

	return (
		<div className="rounded-xl border bg-card">
			<div className="flex items-center justify-between gap-3 border-b px-4 py-3">
				<div className="flex items-center gap-2">
					<Video className="h-4 w-4 text-primary" />
					<h3 className="text-sm font-semibold">Roteiro de vídeo do dia</h3>
				</div>
				<Button type="button" variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={copiar}>
					<Copy className="h-3.5 w-3.5" />
					Copiar
				</Button>
			</div>
			<div className="space-y-4 p-4">
				<div>
					<p className="font-display text-base font-semibold">{roteiro.titulo}</p>
					<p className="text-xs text-muted-foreground">
						{roteiro.formato || 'vertical 9:16'} · {roteiro.duracao_segundos || 30} segundos
					</p>
				</div>
				<div className="space-y-3">
					{cenas.map((cena, index) => (
						<div key={index} className="flex gap-3">
							<span className="mt-0.5 shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
								{cena.tempo || `Cena ${index + 1}`}
							</span>
							<div className="min-w-0">
								<p className="text-xs font-semibold uppercase tracking-wide text-primary">{cena.nome}</p>
								<p className="text-sm">{cena.fala}</p>
								{cena.acao && (
									<p className="mt-0.5 text-xs text-muted-foreground">Visual: {cena.acao}</p>
								)}
							</div>
						</div>
					))}
				</div>
				{(roteiro.audio || roteiro.texto_tela || roteiro.dica_gravacao) && (
					<div className="space-y-1.5 rounded-lg bg-accent/50 px-3 py-2.5 text-xs">
						{roteiro.audio && <p>🎵 Áudio: {roteiro.audio}</p>}
						{roteiro.texto_tela && <p>📝 Texto na tela: {roteiro.texto_tela}</p>}
						{roteiro.dica_gravacao && <p>💡 Dica: {roteiro.dica_gravacao}</p>}
					</div>
				)}
			</div>
		</div>
	);
}

function PlanoCompleto({ plano, tarefas, onToggleTarefa }) {
	const completo = plano.plano_completo;
	const concluidas = tarefas.filter((t) => t.concluida).length;
	const progresso = tarefas.length ? Math.round((concluidas / tarefas.length) * 100) : 0;

	if (!completo || typeof completo !== 'object') return null;
	const meta = completo.meta_do_dia || {};

	return (
		<div className="space-y-4">
			{completo.objetivo && (
				<div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-primary">Objetivo do dia</p>
					<p className="mt-1 text-sm font-medium">{completo.objetivo}</p>
				</div>
			)}
			{completo.briefing && (
				<p className="text-sm text-muted-foreground">{completo.briefing}</p>
			)}

			<div className="grid gap-4 sm:grid-cols-2">
				{completo.stories && (
					<SectionCard icon={MessageSquare} titulo="Stories" accent="bg-primary/10">
						<dl className="space-y-1.5">
							{completo.stories.horario && <Linha label="Horário" value={completo.stories.horario} />}
							{completo.stories.o_que_gravar && <Linha label="O que gravar" value={completo.stories.o_que_gravar} />}
							{completo.stories.texto && <Linha label="Texto na tela" value={completo.stories.texto} />}
							{completo.stories.cta && <Linha label="CTA" value={completo.stories.cta} />}
						</dl>
					</SectionCard>
				)}
				{completo.reels && (
					<SectionCard icon={Clapperboard} titulo="Reels" accent="bg-primary/10">
						<dl className="space-y-1.5">
							{completo.reels.horario && <Linha label="Horário ideal" value={completo.reels.horario} />}
							{completo.reels.tema && <Linha label="Tema" value={completo.reels.tema} />}
							{completo.reels.gancho && <Linha label="Gancho" value={completo.reels.gancho} />}
							{completo.reels.legenda && <Linha label="Legenda" value={completo.reels.legenda} />}
							{Array.isArray(completo.reels.hashtags) && completo.reels.hashtags.length > 0 && (
								<p className="pt-1 text-xs text-primary">{completo.reels.hashtags.join(' ')}</p>
							)}
						</dl>
					</SectionCard>
				)}
				{completo.post_feed && (
					<SectionCard icon={ImageIcon} titulo="Post de feed" accent="bg-primary/10">
						<dl className="space-y-1.5">
							{completo.post_feed.ideia_imagem && <Linha label="Imagem" value={completo.post_feed.ideia_imagem} />}
							{completo.post_feed.texto && <Linha label="Texto" value={completo.post_feed.texto} />}
							{completo.post_feed.cta && <Linha label="CTA" value={completo.post_feed.cta} />}
						</dl>
					</SectionCard>
				)}
				{completo.acao_comercial && (
					<SectionCard icon={Megaphone} titulo="Ação comercial" accent="bg-primary/10">
						<p>{completo.acao_comercial}</p>
					</SectionCard>
				)}
				{completo.acao_extra && (
					<SectionCard icon={Sparkles} titulo="Ação extra" accent="bg-accent">
						<p>{completo.acao_extra}</p>
					</SectionCard>
				)}
				{(meta.leads || meta.conversas || meta.agendamentos || meta.vendas) && (
					<SectionCard icon={Target} titulo="Meta do dia" accent="bg-primary/10">
						<dl className="space-y-1.5">
							{meta.leads && <Linha label="Leads" value={meta.leads} />}
							{meta.conversas && <Linha label="Conversas" value={meta.conversas} />}
							{meta.agendamentos && <Linha label="Agendamentos" value={meta.agendamentos} />}
							{meta.vendas && <Linha label="Vendas" value={meta.vendas} />}
						</dl>
					</SectionCard>
				)}
			</div>

			{Array.isArray(completo.checklist_ontem) && completo.checklist_ontem.length > 0 && (
				<div className="rounded-xl border bg-card p-4">
					<h3 className="text-sm font-semibold">Checklist de ontem</h3>
					<ul className="mt-2 space-y-1.5">
						{completo.checklist_ontem.map((item, i) => (
							<li key={i} className="flex items-start gap-2 text-sm">
								<CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								<span className="text-muted-foreground">{item}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			<RoteiroCard roteiro={completo.roteiro_video || plano.roteiro_video} />

			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold">Checklist de execução</h3>
					<span className="text-xs font-medium text-muted-foreground">{concluidas}/{tarefas.length}</span>
				</div>
				<Progress value={progresso} className="mt-2 h-2" />
				<div className="mt-3 space-y-2.5">
					{tarefas.map((tarefa) => (
						<div key={tarefa.id} className={cn('flex items-start gap-3', tarefa.concluida && 'opacity-60')}>
							<Checkbox
								checked={tarefa.concluida}
								onCheckedChange={() => onToggleTarefa(tarefa)}
								className="mt-0.5"
								aria-label={`Marcar "${tarefa.titulo}" como concluída`}
							/>
							<div className="min-w-0 flex-1">
								<TipoBadge tipo={tarefa.tipo} />
								<p className={cn('mt-1.5 text-sm font-medium', tarefa.concluida && 'line-through')}>{tarefa.titulo}</p>
								{tarefa.descricao && <p className="mt-1 text-sm text-muted-foreground">{tarefa.descricao}</p>}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function Linha({ label, value }) {
	return (
		<div className="flex gap-2">
			<dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
			<dd className="min-w-0 text-sm">{value}</dd>
		</div>
	);
}

function PlanoPanel({ empresa, plano, tarefas, loading, generating, onGenerate, onGenerateAmanha, onGenerateSemana, onGenerateMes, tierLimits, onToggleTarefa }) {
	const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

	if (loading) {
		return (
			<div className="space-y-4 p-5">
				<Skeleton className="h-7 w-2/3" />
				<Skeleton className="h-4 w-full" />
				<div className="space-y-3 pt-2">
					{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
				</div>
			</div>
		);
	}

	if (!plano) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
					<CalendarDays className="h-7 w-7 text-accent-foreground" />
				</div>
				<h2 className="mt-5 font-display text-xl font-bold">Seu plano de hoje ainda não existe</h2>
				<p className="mt-2 max-w-sm text-sm text-muted-foreground">
					{empresa.assistente_nome} monta em segundos o que postar, a ação comercial do dia e um roteiro
					de vídeo pronto para gravar — tudo com o contexto da {empresa.nome}.
				</p>
				<Button onClick={onGenerate} disabled={generating} className="mt-6 gap-2" size="lg">
					{generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
					{generating ? 'Gerando seu plano…' : 'Gerar plano do dia'}
				</Button>
				{generating && (
					<p className="mt-3 text-xs text-muted-foreground">
						{empresa.assistente_nome} está pensando na estratégia de hoje. Leva alguns segundos.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="border-b px-5 py-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{hoje}</p>
						<h2 className="mt-1 font-display text-lg font-bold leading-snug">{plano.foco || 'Plano do dia'}</h2>
					</div>
					<Button type="button" variant="outline" size="sm" onClick={onGenerate} disabled={generating} className="shrink-0 gap-1.5">
						{generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
						<span className="hidden sm:inline">{generating ? 'Gerando…' : 'Regerar'}</span>
					</Button>
				</div>
				{plano.resumo && <p className="mt-2 text-sm text-muted-foreground">{plano.resumo}</p>}

				<div className="mt-3 flex flex-wrap gap-2">
					<Button type="button" variant="secondary" size="sm" onClick={onGenerateAmanha} disabled={generating} className="gap-1.5">
						<CalendarClock className="h-3.5 w-3.5" />
						Plano de amanhã
					</Button>
					{tierLimits?.semana ? (
						<Button type="button" variant="secondary" size="sm" onClick={onGenerateSemana} disabled={generating} className="gap-1.5">
							<CalendarRange className="h-3.5 w-3.5" />
							Plano da semana
						</Button>
					) : (
						<LockedButton label="Plano da semana" to="/plans" />
					)}
					{tierLimits?.mes ? (
						<Button type="button" variant="secondary" size="sm" onClick={onGenerateMes} disabled={generating} className="gap-1.5">
							<CalendarDays className="h-3.5 w-3.5" />
							Calendário mensal
						</Button>
					) : (
						<LockedButton label="Calendário mensal" to="/plans" />
					)}
				</div>
			</div>

			<div className="flex-1 space-y-4 overflow-y-auto p-5">
				{plano.plano_completo ? (
					<PlanoCompleto plano={plano} tarefas={tarefas} onToggleTarefa={onToggleTarefa} />
				) : (
					<>
						<div className="space-y-2.5">
							{tarefas.map((tarefa) => (
								<div key={tarefa.id} className={cn('flex items-start gap-3 rounded-xl border bg-card p-4', tarefa.concluida && 'opacity-60')}>
									<Checkbox checked={tarefa.concluida} onCheckedChange={() => onToggleTarefa(tarefa)} className="mt-0.5" />
									<div className="min-w-0 flex-1">
										<TipoBadge tipo={tarefa.tipo} />
										<p className={cn('mt-1.5 text-sm font-medium', tarefa.concluida && 'line-through')}>{tarefa.titulo}</p>
										{tarefa.descricao && <p className="mt-1 text-sm text-muted-foreground">{tarefa.descricao}</p>}
									</div>
								</div>
							))}
						</div>
						<RoteiroCard roteiro={plano.roteiro_video} />
					</>
				)}
			</div>
		</div>
	);
}

function LockedButton({ label, to }) {
	return (
		<Button asChild variant="outline" size="sm" className="gap-1.5 opacity-70">
			<Link to="/plans">
				<Lock className="h-3.5 w-3.5" />
				{label}
			</Link>
		</Button>
	);
}

function ChatPanel({ empresa, tierLimits, mensagensRestantes }) {
	const { messages, isStreaming, isLoadingHistory, sendMessage } = useIntegratedAi();
	const [input, setInput] = useState('');
	const bottomRef = useRef(null);

	const visibleMessages = useMemo(
		() =>
			messages.filter(
				(m) =>
					!(m.role === 'user' && isPlanRequestMessage(m.content)) &&
					!(m.role === 'assistant' && isPlanResponseMessage(m.content)),
			),
		[messages],
	);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [visibleMessages.length, isStreaming]);

	const bloqueado = tierLimits && tierLimits.chatDiario !== Infinity && mensagensRestantes <= 0;

	const handleSend = async () => {
		const text = input.trim();
		if (!text || isStreaming || bloqueado) return;
		setInput('');
		try {
			await sendMessage(text);
		} catch (err) {
			if (err?.status === 403) {
				toast({
					variant: 'destructive',
					title: 'Confirme seu e-mail',
					description: 'Verifique sua caixa de entrada e confirme o e-mail para conversar com a IA.',
				});
			}
		}
	};

	return (
		<div className="flex h-full flex-col bg-muted/30">
			<div className="flex items-center gap-3 border-b bg-background px-5 py-3.5">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
					{(empresa.assistente_nome || 'C')[0].toUpperCase()}
				</div>
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold">{empresa.assistente_nome}</p>
					<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<span className="h-1.5 w-1.5 rounded-full bg-primary" />
						Gerente de marketing da {empresa.nome}
					</p>
				</div>
			</div>

			<div className="flex-1 space-y-4 overflow-y-auto p-5">
				{isLoadingHistory ? (
					<div className="space-y-3">
						{[0, 1, 2].map((i) => <Skeleton key={i} className={cn('h-14 rounded-2xl', i % 2 ? 'ml-auto w-2/3' : 'w-3/4')} />)}
					</div>
				) : visibleMessages.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
							<MessageSquare className="h-6 w-6 text-accent-foreground" />
						</div>
						<p className="mt-4 text-sm font-medium">Converse com {empresa.assistente_nome}</p>
						<p className="mt-1 max-w-xs text-xs text-muted-foreground">
							Peça ajustes no plano, ideias de conteúdo ou ajuda para gravar o vídeo de hoje.
						</p>
						<div className="mt-4 flex flex-wrap justify-center gap-2">
							{['O que posto hoje?', 'Crie um roteiro de Reels', 'Como vender mais hoje?'].map((s) => (
								<button key={s} type="button" onClick={() => setInput(s)} className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
									{s}
								</button>
							))}
						</div>
					</div>
				) : (
					visibleMessages.map((message, index) => (
						<div key={index} className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed', message.role === 'user' ? 'ml-auto rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm border bg-card')}>
							{message.content ? (
								<p className="whitespace-pre-wrap">{message.content}</p>
							) : (
								message.role === 'assistant' && (
									<span className="flex items-center gap-1.5 py-1">
										<span className="cmo-typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
										<span className="cmo-typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: '0.15s' }} />
										<span className="cmo-typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: '0.3s' }} />
									</span>
								)
							)}
							{message.images?.map((url, i) => <img key={i} src={url} alt="" loading="lazy" className="mt-2 rounded-lg" />)}
						</div>
					))
				)}
				<div ref={bottomRef} />
			</div>

			{bloqueado ? (
				<div className="border-t bg-background p-4 text-center">
					<p className="text-sm font-medium">Você atingiu o limite de 10 mensagens de hoje</p>
					<p className="mt-1 text-xs text-muted-foreground">Faça upgrade para conversar sem limites com {empresa.assistente_nome}.</p>
					<Button asChild size="sm" className="mt-3 gap-1.5">
						<Link to="/plans"><Sparkles className="h-3.5 w-3.5" />Ver planos</Link>
					</Button>
				</div>
			) : (
				<div className="border-t bg-background p-4">
					<div className="flex items-end gap-2">
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
							placeholder={`Mensagem para ${empresa.assistente_nome}…`}
							rows={1}
							className="max-h-32 min-h-[44px] resize-none"
						/>
						<Button type="button" size="icon" onClick={handleSend} disabled={!input.trim() || isStreaming} aria-label="Enviar mensagem" className="h-11 w-11 shrink-0">
							{isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
						</Button>
					</div>
					<p className="mt-2 text-center text-[11px] text-muted-foreground">
						{tierLimits && tierLimits.chatDiario !== Infinity
							? `${empresa.assistente_nome} pode cometer erros. ${mensagensRestantes} mensagens restantes hoje.`
							: `${empresa.assistente_nome} pode cometer erros. Revise o conteúdo antes de publicar.`}
					</p>
				</div>
			)}
		</div>
	);
}

function EvolucaoStats({ planos, tarefas }) {
	const agora = new Date();
	const seteDiasAtras = subDays(agora, 7);
	const trintaDiasAtras = subDays(agora, 30);

	const planos7 = planos.filter((p) => { try { return isAfter(parseISO(p.data), seteDiasAtras); } catch { return false; } });
	const planos30 = planos.filter((p) => { try { return isAfter(parseISO(p.data), trintaDiasAtras); } catch { return false; } });

	const tarefas7 = tarefas.filter((t) => isAfter(new Date(t.created), seteDiasAtras));
	const concluidas7 = tarefas7.filter((t) => t.concluida).length;
	const taxa7 = tarefas7.length ? Math.round((concluidas7 / tarefas7.length) * 100) : 0;

	const stats = [
		{ label: 'Planos (7 dias)', value: planos7.length, icon: CalendarDays },
		{ label: 'Planos (30 dias)', value: planos30.length, icon: CalendarRange },
		{ label: 'Tarefas concluídas (7 dias)', value: `${concluidas7}/${tarefas7.length}`, icon: CheckCircle2 },
		{ label: 'Taxa de execução', value: `${taxa7}%`, icon: TrendingUp },
	];

	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
			{stats.map((s) => (
				<div key={s.label} className="rounded-xl border bg-card p-3">
					<s.icon className="h-4 w-4 text-primary" />
					<p className="mt-2 font-display text-xl font-bold">{s.value}</p>
					<p className="text-[11px] text-muted-foreground">{s.label}</p>
				</div>
			))}
		</div>
	);
}

function EvolucaoChart({ planos, tarefas }) {
	// Últimos 14 dias: planos gerados e tarefas concluídas por dia.
	const dias = [];
	for (let i = 13; i >= 0; i--) {
		const d = subDays(new Date(), i);
		const chave = format(d, 'yyyy-MM-dd');
		const rotulo = format(d, 'dd/MM');
		const planosDia = planos.filter((p) => p.data === chave).length;
		const tarefasDia = tarefas.filter((t) => {
			try { return format(new Date(t.created), 'yyyy-MM-dd') === chave && t.concluida; } catch { return false; }
		}).length;
		dias.push({ rotulo, planos: planosDia, concluidas: tarefasDia });
	}

	return (
		<div className="mt-3 rounded-xl border bg-card p-3">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evolução (14 dias)</p>
				<div className="flex items-center gap-3 text-[11px] text-muted-foreground">
					<span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Planos</span>
					<span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent-foreground" />Concluídas</span>
				</div>
			</div>
			<ResponsiveContainer width="100%" height={180}>
				<AreaChart data={dias} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
					<defs>
						<linearGradient id="gradPlanos" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#0d7d6e" stopOpacity={0.35} />
							<stop offset="100%" stopColor="#0d7d6e" stopOpacity={0} />
						</linearGradient>
						<linearGradient id="gradConcluidas" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
							<stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
					<XAxis dataKey="rotulo" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={1} />
					<YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
					<Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }} />
					<Area type="monotone" dataKey="planos" name="Planos" stroke="#0d7d6e" strokeWidth={2} fill="url(#gradPlanos)" />
					<Area type="monotone" dataKey="concluidas" name="Concluídas" stroke="#14b8a6" strokeWidth={2} fill="url(#gradConcluidas)" />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

function SidebarNav({ empresa, user, tier, onLogout, onNavigate }) {
	const items = [
		{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ to: '/companies', label: 'Empresas', icon: Store },
		{ to: '/historico', label: 'Histórico', icon: History },
		{ to: '/ideias', label: 'Banco de ideias', icon: Lightbulb },
		{ to: '/subscriptions', label: 'Minha assinatura', icon: CreditCard },
		{ to: '/configuracoes', label: 'Configurações', icon: Settings },
	];
	if (user?.role === 'admin') {
		items.push({ to: '/exemplos', label: 'Exemplos e testes', icon: FlaskConical });
	}
	return (
		<nav className="flex flex-col gap-1">
			{items.map((item) => (
				<Button key={item.to} asChild variant="ghost" className="w-full justify-start gap-3" onClick={onNavigate}>
					<Link to={item.to}>
						<item.icon className="h-4 w-4" />
						{item.label}
					</Link>
				</Button>
			))}
			<Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={onLogout}>
				<LogOut className="h-4 w-4" />
				Sair
			</Button>
		</nav>
	);
}

export default function DashboardPage() {
	const { user, logout } = useAuth();
	const { subscriptions } = useSubscriptionAuth();
	const [empresas, setEmpresas] = useState([]);
	const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
	const [plano, setPlano] = useState(null);
	const [tarefas, setTarefas] = useState([]);
	const [todosPlanos, setTodosPlanos] = useState([]);
	const [todasTarefas, setTodasTarefas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [mobileView, setMobileView] = useState('plano');
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [mensagensHoje, setMensagensHoje] = useState(0);

	const tier = getActiveTier(subscriptions);
	const tierLimits = getTierLimits(subscriptions);
	const empresa = empresaSelecionada || empresas[0] || null;

	const mensagensRestantes = tierLimits && tierLimits.chatDiario !== Infinity
		? Math.max(0, tierLimits.chatDiario - mensagensHoje)
		: Infinity;

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const lista = await pb.collection('empresas').getFullList({ sort: '-created' });
			setEmpresas(lista);
			const atual = lista[0] || null;
			setEmpresaSelecionada(atual);

			if (atual) {
				const [planosHoje, todosPlanosList, todasTarefasList] = await Promise.all([
					pb.collection('planos_diarios').getList(1, 1, {
						filter: pb.filter('empresa = {:e} && data = {:d} && tipo = {:t}', { e: atual.id, d: todayKey(), t: 'diario' }),
					}),
					pb.collection('planos_diarios').getFullList({
						filter: pb.filter('empresa = {:e}', { e: atual.id }),
						sort: '-data',
					}),
					pb.collection('tarefas').getFullList({
						filter: pb.filter('empresa = {:e}', { e: atual.id }),
						sort: 'ordem',
					}),
				]);
				const planoAtual = planosHoje.items[0] || null;
				setPlano(planoAtual);
				setTodosPlanos(todosPlanosList);
				setTodasTarefas(todasTarefasList);
				if (planoAtual) {
					setTarefas(todasTarefasList.filter((t) => t.plano === planoAtual.id));
				} else {
					setTarefas([]);
				}
			}
			countTodayUserMessages().then(setMensagensHoje);
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao carregar', description: err?.message || 'Tente novamente.' });
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { loadData(); }, [loadData]);

	// Automação do plano do dia: substitui o cron job (Express hiberna quando ocioso,
	// então não há agendamento server-side). Ao abrir o painel, se o usuário tem
	// assinatura ativa mas ainda não gerou o plano de hoje, geramos automaticamente.
	const autoGenTriedRef = useRef(new Set());
	useEffect(() => {
		if (loading || generating || !empresa || !tier || plano) return;
		if (autoGenTriedRef.current.has(empresa.id)) return;
		autoGenTriedRef.current.add(empresa.id);
		(async () => {
			setGenerating(true);
			try {
				await generateAndSaveDailyPlan(empresa);
				await recarregarPlano(empresa);
				toast({ title: 'Plano do dia pronto!', description: `${empresa.assistente_nome} já preparou seu plano de hoje automaticamente.` });
			} catch (err) {
				// Falha silenciosa na automação — o usuário pode gerar manualmente.
			} finally {
				setGenerating(false);
			}
		})();
	}, [loading, generating, empresa, tier, plano]);

	const trocarEmpresa = async (empresaId) => {
		const atual = empresas.find((e) => e.id === empresaId);
		if (!atual) return;
		setEmpresaSelecionada(atual);
		try {
			const planosHoje = await pb.collection('planos_diarios').getList(1, 1, {
				filter: pb.filter('empresa = {:e} && data = {:d} && tipo = {:t}', { e: atual.id, d: todayKey(), t: 'diario' }),
			});
			const planoAtual = planosHoje.items[0] || null;
			setPlano(planoAtual);
			const [todosPlanosList, todasTarefasList] = await Promise.all([
				pb.collection('planos_diarios').getFullList({ filter: pb.filter('empresa = {:e}', { e: atual.id }), sort: '-data' }),
				pb.collection('tarefas').getFullList({ filter: pb.filter('empresa = {:e}', { e: atual.id }), sort: 'ordem' }),
			]);
			setTodosPlanos(todosPlanosList);
			setTodasTarefas(todasTarefasList);
			setTarefas(planoAtual ? todasTarefasList.filter((t) => t.plano === planoAtual.id) : []);
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao trocar de empresa' });
		}
	};

	const recarregarPlano = async (empresaAtual) => {
		const planosHoje = await pb.collection('planos_diarios').getList(1, 1, {
			filter: pb.filter('empresa = {:e} && data = {:d} && tipo = {:t}', { e: empresaAtual.id, d: todayKey(), t: 'diario' }),
		});
		const planoAtual = planosHoje.items[0] || null;
		setPlano(planoAtual);
		const todasTarefasList = await pb.collection('tarefas').getFullList({ filter: pb.filter('empresa = {:e}', { e: empresaAtual.id }), sort: 'ordem' });
		setTodasTarefas(todasTarefasList);
		setTarefas(planoAtual ? todasTarefasList.filter((t) => t.plano === planoAtual.id) : []);
		const todosPlanosList = await pb.collection('planos_diarios').getFullList({ filter: pb.filter('empresa = {:e}', { e: empresaAtual.id }), sort: '-data' });
		setTodosPlanos(todosPlanosList);
	};

	const handleGenerate = async () => {
		if (!empresa || generating) return;
		setGenerating(true);
		try {
			const { plano: novoPlano, tarefas: novasTarefas } = await generateAndSaveDailyPlan(empresa);
			await recarregarPlano(empresa);
			toast({ title: 'Plano do dia pronto!', description: `${empresa.assistente_nome} preparou ${novasTarefas.length} tarefas e um roteiro de vídeo para hoje.` });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Não foi possível gerar o plano', description: err?.status === 403 ? 'Confirme seu e-mail para usar a IA.' : err?.message || 'Tente novamente.' });
		} finally {
			setGenerating(false);
		}
	};

	const handleGenerateAmanha = async () => {
		if (!empresa || generating) return;
		setGenerating(true);
		try {
			await generateAndSaveDailyPlan(empresa, { amanha: true });
			toast({ title: 'Plano de amanhã pronto!', description: `${empresa.assistente_nome} já planejou o próximo dia.` });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Não foi possível gerar', description: err?.message || 'Tente novamente.' });
		} finally {
			setGenerating(false);
		}
	};

	const handleGenerateSemana = async () => {
		if (!empresa || generating) return;
		setGenerating(true);
		try {
			const result = await generateAndSaveWeekPlan(empresa);
			toast({ title: 'Plano da semana pronto!', description: `${result.dias?.length || 7} dias planejados por ${empresa.assistente_nome}.` });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Não foi possível gerar', description: err?.message || 'Tente novamente.' });
		} finally {
			setGenerating(false);
		}
	};

	const handleGenerateMes = async () => {
		if (!empresa || generating) return;
		setGenerating(true);
		try {
			const result = await generateAndSaveMonthPlan(empresa);
			toast({ title: 'Calendário mensal pronto!', description: `${result.dias?.length || 30} dias planejados por ${empresa.assistente_nome}.` });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Não foi possível gerar', description: err?.message || 'Tente novamente.' });
		} finally {
			setGenerating(false);
		}
	};

	const handleToggleTarefa = async (tarefa) => {
		const concluida = !tarefa.concluida;
		setTarefas((prev) => prev.map((i) => (i.id === tarefa.id ? { ...i, concluida } : i)));
		setTodasTarefas((prev) => prev.map((i) => (i.id === tarefa.id ? { ...i, concluida } : i)));
		try {
			await pb.collection('tarefas').update(tarefa.id, { concluida });
		} catch {
			setTarefas((prev) => prev.map((i) => (i.id === tarefa.id ? { ...i, concluida: !concluida } : i)));
			toast({ variant: 'destructive', title: 'Não foi possível atualizar a tarefa.' });
		}
	};

	if (!loading && empresas.length === 0) {
		return <Navigate to="/onboarding" replace />;
	}

	return (
		<div className="flex h-[100dvh] bg-background">
			<Helmet>
				<title>Painel — Meu CMO</title>
				<meta name="description" content="Seu plano de marketing do dia e o chat com sua IA gerente de marketing." />
			</Helmet>

			{/* Sidebar desktop */}
			<aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 lg:flex">
				<div className="flex h-14 items-center gap-2 border-b px-4">
					<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
						<Bot className="h-4 w-4 text-primary-foreground" />
					</span>
					<span className="font-display text-base font-bold tracking-tight">Meu CMO</span>
				</div>
				<div className="flex-1 overflow-y-auto p-3">
					<SidebarNav empresa={empresa} user={user} tier={tier} onLogout={logout} />
				</div>
				{empresa && (
					<div className="border-t p-3">
						<p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Empresa</p>
						<p className="mt-1 truncate px-2 text-sm font-medium">{empresa.nome}</p>
						{tier && <Badge variant="secondary" className="mt-2">{TIER_LABELS[tier]}</Badge>}
					</div>
				)}
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				{/* Top bar */}
				<header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
					<div className="flex items-center gap-3">
						<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-64 p-0">
								<div className="flex h-14 items-center gap-2 border-b px-4">
									<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
										<Bot className="h-4 w-4 text-primary-foreground" />
									</span>
									<span className="font-display text-base font-bold tracking-tight">Meu CMO</span>
								</div>
								<div className="p-3">
									<SidebarNav empresa={empresa} user={user} tier={tier} onLogout={logout} onNavigate={() => setSidebarOpen(false)} />
								</div>
							</SheetContent>
						</Sheet>
						<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary lg:hidden">
							<Bot className="h-4 w-4 text-primary-foreground" />
						</span>
						<span className="font-display text-base font-bold tracking-tight lg:hidden">Meu CMO</span>
						{empresa && (
							<span className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:flex">
								{empresa.segmento === 'saude' ? <HeartPulse className="h-3 w-3" /> : <Store className="h-3 w-3" />}
								{empresa.nome}
							</span>
						)}
						{empresas.length > 1 && (
							<select
								value={empresa?.id || ''}
								onChange={(e) => trocarEmpresa(e.target.value)}
								className="hidden rounded-lg border bg-background px-2 py-1 text-xs sm:block"
							>
								{empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
							</select>
						)}
					</div>
					<div className="flex items-center gap-1">
						{!tier && (
							<Button asChild size="sm" variant="outline" className="mr-1 hidden gap-1.5 sm:inline-flex">
								<Link to="/plans"><Sparkles className="h-3.5 w-3.5" />Assinar</Link>
							</Button>
						)}
						{user?.role === 'admin' && (
							<Button asChild variant="ghost" size="icon" aria-label="Painel administrativo">
								<Link to="/admin"><ShieldCheck className="h-4 w-4" /></Link>
							</Button>
						)}
						<ThemeToggle />
					</div>
				</header>

				{/* Evolução */}
				{empresa && todosPlanos.length > 0 && (
					<div className="hidden border-b bg-muted/20 px-5 py-3 lg:block">
						<EvolucaoStats planos={todosPlanos} tarefas={todasTarefas} />
						<EvolucaoChart planos={todosPlanos} tarefas={todasTarefas} />
					</div>
				)}

				{/* Mobile plan/chat toggle */}
				{empresa && (
					<div className="flex shrink-0 items-center gap-2 border-b bg-muted/30 px-4 py-2 lg:hidden">
						<Button type="button" variant={mobileView === 'plano' ? 'secondary' : 'ghost'} size="sm" className="flex-1 gap-1.5" onClick={() => setMobileView('plano')}>
							<CalendarDays className="h-3.5 w-3.5" />Plano do dia
						</Button>
						<Button type="button" variant={mobileView === 'chat' ? 'secondary' : 'ghost'} size="sm" className="flex-1 gap-1.5" onClick={() => setMobileView('chat')}>
							<MessageSquare className="h-3.5 w-3.5" />{empresa.assistente_nome}
						</Button>
					</div>
				)}

				<main className="grid min-h-0 flex-1 lg:grid-cols-2">
					{empresa ? (
						<>
							<section className={cn('min-h-0 border-r', mobileView === 'plano' ? 'block' : 'hidden lg:block')}>
								<PlanoPanel
									empresa={empresa}
									plano={plano}
									tarefas={tarefas}
									loading={loading}
									generating={generating}
									onGenerate={handleGenerate}
									onGenerateAmanha={handleGenerateAmanha}
									onGenerateSemana={handleGenerateSemana}
									onGenerateMes={handleGenerateMes}
									tierLimits={tierLimits}
									onToggleTarefa={handleToggleTarefa}
								/>
							</section>
							<section className={cn('min-h-0', mobileView === 'chat' ? 'block' : 'hidden lg:block')}>
								<ChatPanel empresa={empresa} tierLimits={tierLimits} mensagensRestantes={mensagensRestantes} />
							</section>
						</>
					) : (
						<div className="col-span-2 flex items-center justify-center p-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
