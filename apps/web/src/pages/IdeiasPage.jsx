import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
	ArrowLeft,
	Bot,
	Lightbulb,
	Loader2,
	Plus,
	Search,
	Sparkles,
	Trash2,
	Copy,
	Filter,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const CATEGORIAS = [
	{ value: 'stories', label: 'Stories' },
	{ value: 'reels', label: 'Reels' },
	{ value: 'post', label: 'Post' },
	{ value: 'acao_comercial', label: 'Ação comercial' },
	{ value: 'relacionamento', label: 'Relacionamento' },
	{ value: 'educacao', label: 'Educação' },
	{ value: 'promocao', label: 'Promoção' },
	{ value: 'outro', label: 'Outro' },
];

const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.value, c.label]));

export default function IdeiasPage() {
	const { user } = useAuth();
	const [ideias, setIdeias] = useState(null);
	const [empresas, setEmpresas] = useState([]);
	const [busca, setBusca] = useState('');
	const [filtroCategoria, setFiltroCategoria] = useState('todas');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({ titulo: '', descricao: '', categoria: 'reels', tags: '', empresa: '' });

	const carregar = useCallback(async () => {
		try {
			const [lista, listaEmpresas] = await Promise.all([
				pb.collection('ideias').getFullList({ sort: '-created' }),
				pb.collection('empresas').getFullList({ sort: '-created' }),
			]);
			setIdeias(lista);
			setEmpresas(listaEmpresas);
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao carregar ideias', description: err?.message });
			setIdeias([]);
		}
	}, []);

	useEffect(() => {
		carregar();
	}, [carregar]);

	const filtradas = useMemo(() => {
		const termo = busca.trim().toLowerCase();
		return (ideias || []).filter((ideia) => {
			if (filtroCategoria !== 'todas' && ideia.categoria !== filtroCategoria) return false;
			if (!termo) return true;
			const texto = `${ideia.titulo} ${ideia.descricao || ''} ${ideia.tags || ''}`.toLowerCase();
			return texto.includes(termo);
		});
	}, [ideias, busca, filtroCategoria]);

	const handleSave = async (e) => {
		e.preventDefault();
		if (!form.titulo.trim()) return;
		setSaving(true);
		try {
			await pb.collection('ideias').create({
				titulo: form.titulo.trim(),
				descricao: form.descricao.trim(),
				categoria: form.categoria,
				tags: form.tags.trim(),
				empresa: form.empresa || null,
				owner: pb.authStore.record.id,
				reutilizada: false,
			});
			toast({ title: 'Ideia salva no banco!' });
			setForm({ titulo: '', descricao: '', categoria: 'reels', tags: '', empresa: '' });
			setDialogOpen(false);
			carregar();
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao salvar', description: err?.message });
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id) => {
		try {
			await pb.collection('ideias').delete(id);
			setIdeias((prev) => (prev || []).filter((i) => i.id !== id));
			toast({ title: 'Ideia removida.' });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao remover', description: err?.message });
		}
	};

	const handleReutilizar = async (ideia) => {
		const texto = `${ideia.titulo}\n\n${ideia.descricao || ''}\n\nTags: ${ideia.tags || '-'}`;
		try {
			await navigator.clipboard.writeText(texto);
			if (!ideia.reutilizada) {
				await pb.collection('ideias').update(ideia.id, { reutilizada: true });
				setIdeias((prev) => (prev || []).map((i) => (i.id === ideia.id ? { ...i, reutilizada: true } : i)));
			}
			toast({ title: 'Ideia copiada!', description: 'Cole no chat com seu CMO para incluir no próximo plano.' });
		} catch {
			toast({ variant: 'destructive', title: 'Não foi possível copiar.' });
		}
	};

	return (
		<div className="min-h-[100dvh] bg-muted/40">
			<Helmet>
				<title>Banco de ideias — Meu CMO</title>
				<meta name="description" content="Salve, organize e reutilize ideias de conteúdo de marketing no seu banco de ideias do Meu CMO." />
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

			<main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="font-display text-2xl font-bold tracking-tight">Banco de ideias</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Salve ideias de conteúdo, organize por categoria e reutilize nos seus planos.
						</p>
					</div>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button className="gap-2"><Plus className="h-4 w-4" />Nova ideia</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Nova ideia</DialogTitle>
								<DialogDescription>Capture uma ideia de conteúdo para usar depois nos seus planos.</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSave} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="titulo">Título</Label>
									<Input id="titulo" required placeholder="Ex: Reels mostrando bastidores" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
								</div>
								<div className="space-y-2">
									<Label htmlFor="descricao">Descrição</Label>
									<Textarea id="descricao" rows={3} placeholder="Como seria, gancho, CTA..." value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label>Categoria</Label>
										<Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
											<SelectTrigger><SelectValue /></SelectTrigger>
											<SelectContent>
												{CATEGORIAS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="tags">Tags</Label>
										<Input id="tags" placeholder="bastidores, dica, promo" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
									</div>
								</div>
								{empresas.length > 0 && (
									<div className="space-y-2">
										<Label>Empresa (opcional)</Label>
										<Select value={form.empresa || 'nenhuma'} onValueChange={(v) => setForm({ ...form, empresa: v === 'nenhuma' ? '' : v })}>
											<SelectTrigger><SelectValue /></SelectTrigger>
											<SelectContent>
												<SelectItem value="nenhuma">Nenhuma</SelectItem>
												{empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
											</SelectContent>
										</Select>
									</div>
								)}
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
									<Button type="submit" disabled={saving} className="gap-2">
										{saving && <Loader2 className="h-4 w-4 animate-spin" />}
										Salvar ideia
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{/* Filtros */}
				<div className="mt-6 flex flex-wrap items-center gap-3">
					<div className="relative flex-1 min-w-[200px]">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por palavra-chave..." className="pl-9" />
					</div>
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
							<SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
							<SelectContent>
								<SelectItem value="todas">Todas as categorias</SelectItem>
								{CATEGORIAS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Lista */}
				<div className="mt-6">
					{ideias === null ? (
						<div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
					) : filtradas.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
							<span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent"><Lightbulb className="h-7 w-7 text-accent-foreground" /></span>
							<h2 className="mt-4 font-display text-lg font-semibold">{ideias.length === 0 ? 'Seu banco de ideias está vazio' : 'Nenhuma ideia encontrada'}</h2>
							<p className="mt-1 max-w-sm text-sm text-muted-foreground">
								{ideias.length === 0 ? 'Salve ideias de conteúdo que surgirem no dia a dia para reutilizar nos seus planos.' : 'Tente ajustar a busca ou o filtro de categoria.'}
							</p>
						</div>
					) : (
						<div className="grid gap-3 sm:grid-cols-2">
							{filtradas.map((ideia) => (
								<div key={ideia.id} className={cn('flex flex-col rounded-xl border bg-card p-4', ideia.reutilizada && 'border-primary/30 bg-primary/5')}>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<Badge variant="secondary">{CATEGORIA_LABEL[ideia.categoria] || 'Outro'}</Badge>
												{ideia.reutilizada && <Badge className="gap-1 bg-primary/10 text-primary"><Sparkles className="h-3 w-3" />Reutilizada</Badge>}
											</div>
											<h3 className="mt-2 text-sm font-semibold leading-snug">{ideia.titulo}</h3>
										</div>
									</div>
									{ideia.descricao && <p className="mt-2 flex-1 text-sm text-muted-foreground">{ideia.descricao}</p>}
									{ideia.tags && <p className="mt-2 text-xs text-primary">{ideia.tags}</p>}
									<div className="mt-3 flex items-center gap-2">
										<Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => handleReutilizar(ideia)}>
											<Copy className="h-3.5 w-3.5" />Usar no plano
										</Button>
										<Button type="button" variant="ghost" size="icon" className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => handleDelete(ideia.id)} aria-label="Remover ideia">
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
