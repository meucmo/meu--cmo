import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, Building2, HeartPulse, Loader2, Plus, Store, Trash2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';
import { getTierLimits } from '@/lib/planTier';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export default function CompaniesPage() {
	const { user } = useAuth();
	const { subscriptions } = useSubscriptionAuth();
	const navigate = useNavigate();
	const [empresas, setEmpresas] = useState(undefined);
	const [criando, setCriando] = useState(false);
	const [form, setForm] = useState({ nome: '', segmento: 'negocio_local', assistente_nome: '' });
	const tierLimits = getTierLimits(subscriptions);

	const carregar = async () => {
		try {
			const lista = await pb.collection('empresas').getFullList({ sort: '-created' });
			setEmpresas(lista);
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao carregar empresas' });
			setEmpresas([]);
		}
	};

	useEffect(() => { carregar(); }, []);

	const podeCriar = !tierLimits || tierLimits.empresas === Infinity || (empresas?.length || 0) < tierLimits.empresas;

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!form.nome.trim() || !form.assistente_nome.trim()) return;
		setCriando(true);
		try {
			await pb.collection('empresas').create({
				nome: form.nome.trim(),
				segmento: form.segmento,
				assistente_nome: form.assistente_nome.trim(),
				tom_de_voz: 'profissional',
				owner: user.id,
			});
			toast({ title: 'Empresa cadastrada!', description: 'Configure os detalhes no onboarding.' });
			setForm({ nome: '', segmento: 'negocio_local', assistente_nome: '' });
			carregar();
		} catch (err) {
			toast({ variant: 'destructive', title: 'Não foi possível cadastrar', description: err?.message });
		} finally {
			setCriando(false);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Excluir esta empresa e todos os seus planos?')) return;
		try {
			await pb.collection('empresas').delete(id);
			carregar();
			toast({ title: 'Empresa excluída' });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao excluir' });
		}
	};

	if (empresas === null) return <Navigate to="/onboarding" replace />;

	return (
		<div className="min-h-[100dvh] bg-muted/40">
			<Helmet>
				<title>Empresas — Meu CMO</title>
				<meta name="description" content="Gerencie as empresas cadastradas no Meu CMO." />
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
				<h1 className="font-display text-2xl font-bold tracking-tight">Empresas</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{tierLimits && tierLimits.empresas !== Infinity
						? `Seu plano permite ${tierLimits.empresas} empresa(s).`
						: 'Empresas ilimitadas no seu plano.'}
				</p>

				{empresas === undefined ? (
					<div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
				) : (
					<>
						<div className="mt-6 space-y-3">
							{empresas.map((e) => (
								<div key={e.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
									<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
										{e.segmento === 'saude' ? <HeartPulse className="h-5 w-5 text-accent-foreground" /> : <Store className="h-5 w-5 text-accent-foreground" />}
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate font-display text-base font-semibold">{e.nome}</p>
										<p className="text-xs text-muted-foreground">IA: {e.assistente_nome}</p>
									</div>
									<Button asChild size="sm" variant="outline"><Link to="/dashboard">Abrir</Link></Button>
									<Button size="icon" variant="ghost" onClick={() => handleDelete(e.id)} aria-label="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
								</div>
							))}
							{empresas.length === 0 && (
								<p className="rounded-2xl border bg-card px-6 py-10 text-center text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
							)}
						</div>

						{podeCriar ? (
							<form onSubmit={handleCreate} className="mt-8 rounded-2xl border bg-card p-5">
								<h2 className="font-display text-lg font-semibold">Cadastrar nova empresa</h2>
								<div className="mt-4 space-y-4">
									<div className="space-y-2">
										<Label htmlFor="nome">Nome da empresa</Label>
										<Input id="nome" required placeholder="Ex.: Clínica Vida Plena" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
									</div>
									<div className="space-y-2">
										<Label>Segmento</Label>
										<div className="grid grid-cols-2 gap-2">
											<button type="button" onClick={() => setForm({ ...form, segmento: 'negocio_local' })} className={cn('rounded-xl border-2 bg-background px-4 py-3 text-left', form.segmento === 'negocio_local' ? 'border-primary' : 'border-border')}>
												<Store className="h-4 w-4" /><p className="mt-1 text-sm font-medium">Negócio local</p>
											</button>
											<button type="button" onClick={() => setForm({ ...form, segmento: 'saude' })} className={cn('rounded-xl border-2 bg-background px-4 py-3 text-left', form.segmento === 'saude' ? 'border-primary' : 'border-border')}>
												<HeartPulse className="h-4 w-4" /><p className="mt-1 text-sm font-medium">Saúde</p>
											</button>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="assistente">Nome do assistente</Label>
										<Input id="assistente" required placeholder="Ex.: Maya" value={form.assistente_nome} onChange={(e) => setForm({ ...form, assistente_nome: e.target.value })} />
									</div>
									<Button type="submit" disabled={criando} className="gap-2">
										{criando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
										Cadastrar empresa
									</Button>
								</div>
							</form>
						) : (
							<div className="mt-8 rounded-2xl border bg-card p-5 text-center">
								<Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
								<p className="mt-3 text-sm font-medium">Limite de empresas atingido</p>
								<p className="mt-1 text-sm text-muted-foreground">Faça upgrade para cadastrar mais empresas.</p>
								<Button asChild className="mt-4"><Link to="/plans">Ver planos</Link></Button>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
}
