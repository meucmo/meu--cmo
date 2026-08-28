import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, HeartPulse, Loader2, Sparkles, Store } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const ESPECIALIDADES_LOCAL = [
	'Restaurante / alimentação',
	'Cafeteria',
	'Salão de beleza / barbearia',
	'Estética',
	'Academia / studio',
	'Pet shop',
	'Loja de roupas',
	'Mercado / conveniência',
	'Assistência técnica',
	'Imobiliária',
	'Outro comércio ou serviço',
];

const ESPECIALIDADES_SAUDE = [
	'Clínica médica',
	'Consultório médico',
	'Odontologia',
	'Psicologia',
	'Nutrição',
	'Fisioterapia',
	'Fonoaudiologia',
	'Estética de saúde',
	'Outro profissional de saúde',
];

const TONS = [
	{ value: 'profissional', label: 'Profissional', descricao: 'Objetivo e confiável' },
	{ value: 'descontraido', label: 'Descontraído', descricao: 'Leve e próximo' },
	{ value: 'acolhedor', label: 'Acolhedor', descricao: 'Caloroso e humano' },
	{ value: 'tecnico', label: 'Técnico', descricao: 'Educativo e preciso' },
];

const SUGESTOES_NOME = ['Maya', 'Theo', 'Lia', 'Max', 'Bia', 'Caio'];

export default function OnboardingPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [step, setStep] = useState(0);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		nome: '',
		segmento: '',
		especialidade: '',
		cidade: '',
		publico_alvo: '',
		descricao: '',
		assistente_nome: '',
		tom_de_voz: 'profissional',
	});

	const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
	const especialidades = form.segmento === 'saude' ? ESPECIALIDADES_SAUDE : ESPECIALIDADES_LOCAL;

	const canContinue =
		step === 0
			? Boolean(form.segmento)
			: step === 1
				? form.nome.trim().length >= 2 && Boolean(form.especialidade)
				: form.assistente_nome.trim().length >= 2;

	const handleFinish = async () => {
		setSaving(true);
		try {
			await pb.collection('empresas').create({
				nome: form.nome.trim(),
				segmento: form.segmento,
				especialidade: form.especialidade,
				cidade: form.cidade.trim(),
				publico_alvo: form.publico_alvo.trim(),
				descricao: form.descricao.trim(),
				assistente_nome: form.assistente_nome.trim(),
				tom_de_voz: form.tom_de_voz,
				owner: user.id,
			});
			toast({
				title: `${form.assistente_nome.trim()} está pronta para trabalhar!`,
				description: 'Sua empresa foi cadastrada. Vamos ao seu primeiro plano do dia.',
			});
			navigate('/dashboard', { replace: true });
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Não foi possível salvar',
				description: err?.message || 'Tente novamente em instantes.',
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex min-h-[100dvh] flex-col bg-muted/40">
			<Helmet>
				<title>Configure sua empresa — Meu CMO</title>
				<meta name="description" content="Cadastre sua empresa e escolha o nome da sua IA gerente de marketing." />
			</Helmet>
			<header className="flex items-center justify-between px-4 py-4 sm:px-6">
				<div className="flex items-center gap-2">
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<Bot className="h-4.5 w-4.5 text-primary-foreground" />
					</span>
					<span className="font-display text-lg font-bold tracking-tight">Meu CMO</span>
				</div>
				<ThemeToggle />
			</header>

			<main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-16 pt-6">
				<div className="mb-8 flex items-center gap-2">
					{[0, 1, 2].map((index) => (
						<div
							key={index}
							className={cn(
								'h-1.5 flex-1 rounded-full transition-colors',
								index <= step ? 'bg-primary' : 'bg-border',
							)}
						/>
					))}
				</div>

				{step === 0 && (
					<div>
						<h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
							Qual é o seu segmento?
						</h1>
						<p className="mt-2 text-muted-foreground">
							Sua IA adapta toda a estratégia — e, na saúde, segue regras de comunicação ética.
						</p>
						<div className="mt-8 grid gap-4 sm:grid-cols-2">
							<button
								type="button"
								onClick={() => set('segmento', 'negocio_local')}
								className={cn(
									'rounded-2xl border-2 bg-card p-6 text-left transition-all hover:shadow-md',
									form.segmento === 'negocio_local' ? 'border-primary shadow-md shadow-primary/10' : 'border-border',
								)}
							>
								<Store className={cn('h-7 w-7', form.segmento === 'negocio_local' ? 'text-primary' : 'text-muted-foreground')} />
								<h2 className="mt-4 font-display text-lg font-semibold">Negócio local</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									Comércio e serviços: lojas, restaurantes, salões, academias e mais.
								</p>
							</button>
							<button
								type="button"
								onClick={() => set('segmento', 'saude')}
								className={cn(
									'rounded-2xl border-2 bg-card p-6 text-left transition-all hover:shadow-md',
									form.segmento === 'saude' ? 'border-primary shadow-md shadow-primary/10' : 'border-border',
								)}
							>
								<HeartPulse className={cn('h-7 w-7', form.segmento === 'saude' ? 'text-primary' : 'text-muted-foreground')} />
								<h2 className="mt-4 font-display text-lg font-semibold">Área da saúde</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									Clínicas, consultórios e profissionais de saúde — comunicação ética, sem promessas.
								</p>
							</button>
						</div>
					</div>
				)}

				{step === 1 && (
					<div>
						<h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
							Conte sobre a sua empresa
						</h1>
						<p className="mt-2 text-muted-foreground">
							Quanto mais contexto, mais personalizado fica o plano do dia.
						</p>
						<div className="mt-8 space-y-4">
							<div className="space-y-2">
								<Label htmlFor="nome">Nome da empresa</Label>
								<Input
									id="nome"
									required
									placeholder="Ex.: Clínica Vida Plena"
									value={form.nome}
									onChange={(event) => set('nome', event.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Especialidade</Label>
								<Select value={form.especialidade} onValueChange={(value) => set('especialidade', value)}>
									<SelectTrigger>
										<SelectValue placeholder="Selecione a especialidade" />
									</SelectTrigger>
									<SelectContent>
										{especialidades.map((especialidade) => (
											<SelectItem key={especialidade} value={especialidade}>
												{especialidade}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="cidade">Cidade / região</Label>
									<Input
										id="cidade"
										placeholder="Ex.: Belo Horizonte"
										value={form.cidade}
										onChange={(event) => set('cidade', event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="publico">Público-alvo</Label>
									<Input
										id="publico"
										placeholder="Ex.: mulheres 30-50 da região"
										value={form.publico_alvo}
										onChange={(event) => set('publico_alvo', event.target.value)}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="descricao">Sobre o negócio (opcional)</Label>
								<Textarea
									id="descricao"
									rows={3}
									placeholder="O que você oferece, diferenciais, como é o atendimento…"
									value={form.descricao}
									onChange={(event) => set('descricao', event.target.value)}
								/>
							</div>
						</div>
					</div>
				)}

				{step === 2 && (
					<div>
						<h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
							Dê um nome à sua IA
						</h1>
						<p className="mt-2 text-muted-foreground">
							Ela será a gerente de marketing da {form.nome || 'sua empresa'} — e vai se apresentar com esse nome.
						</p>
						<div className="mt-8 space-y-5">
							<div className="space-y-2">
								<Label htmlFor="assistente">Nome do assistente</Label>
								<Input
									id="assistente"
									required
									placeholder="Ex.: Maya"
									value={form.assistente_nome}
									onChange={(event) => set('assistente_nome', event.target.value)}
								/>
								<div className="flex flex-wrap gap-2 pt-1">
									{SUGESTOES_NOME.map((sugestao) => (
										<button
											key={sugestao}
											type="button"
											onClick={() => set('assistente_nome', sugestao)}
											className={cn(
												'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
												form.assistente_nome === sugestao
													? 'border-primary bg-accent text-accent-foreground'
													: 'text-muted-foreground hover:border-primary/50',
											)}
										>
											{sugestao}
										</button>
									))}
								</div>
							</div>
							<div className="space-y-2">
								<Label>Tom de voz</Label>
								<div className="grid grid-cols-2 gap-2">
									{TONS.map((tom) => (
										<button
											key={tom.value}
											type="button"
											onClick={() => set('tom_de_voz', tom.value)}
											className={cn(
												'rounded-xl border-2 bg-card px-4 py-3 text-left transition-all',
												form.tom_de_voz === tom.value ? 'border-primary' : 'border-border hover:border-primary/40',
											)}
										>
											<p className="text-sm font-semibold">{tom.label}</p>
											<p className="text-xs text-muted-foreground">{tom.descricao}</p>
										</button>
									))}
								</div>
							</div>
							<div className="flex items-start gap-3 rounded-xl border bg-card p-4">
								<Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
								<p className="text-sm text-muted-foreground">
									{form.assistente_nome.trim() || 'Sua IA'} vai gerar o plano do dia, escrever roteiros de
									vídeo e conversar com você no chat — sempre com o contexto da sua empresa.
								</p>
							</div>
						</div>
					</div>
				)}

				<div className="mt-10 flex items-center justify-between">
					<Button
						type="button"
						variant="ghost"
						onClick={() => setStep((prev) => Math.max(0, prev - 1))}
						disabled={step === 0 || saving}
						className="gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Voltar
					</Button>
					{step < 2 ? (
						<Button type="button" onClick={() => setStep((prev) => prev + 1)} disabled={!canContinue} className="gap-2">
							Continuar
							<ArrowRight className="h-4 w-4" />
						</Button>
					) : (
						<Button type="button" onClick={handleFinish} disabled={!canContinue || saving} className="gap-2">
							{saving && <Loader2 className="h-4 w-4 animate-spin" />}
							Começar com {form.assistente_nome.trim() || 'minha IA'}
						</Button>
					)}
				</div>
			</main>
		</div>
	);
}
