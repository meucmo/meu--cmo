import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	Bell,
	Bot,
	Loader2,
	Lock,
	LogOut,
	Moon,
	ShieldAlert,
	Sun,
	User,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionAuth } from '@/contexts/SubscriptionAuthContext.jsx';
import { useTheme } from 'next-themes';
import { getActiveTier, TIER_LABELS } from '@/lib/planTier';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import ThemeToggle from '@/components/ThemeToggle';

const NOTIF_KEY = 'meucmo_notificacoes';

export default function ConfiguracoesPage() {
	const { user, refreshUser, logout } = useAuth();
	const { subscriptions } = useSubscriptionAuth();
	const { resolvedTheme, setTheme } = useTheme();
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [saving, setSaving] = useState(false);
	const [notificacoes, setNotificacoes] = useState(true);
	const tier = getActiveTier(subscriptions);

	// Senha
	const [senhaAtual, setSenhaAtual] = useState('');
	const [novaSenha, setNovaSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [salvandoSenha, setSalvandoSenha] = useState(false);

	// Deletar conta
	const [confirmDelete, setConfirmDelete] = useState('');
	const [deletando, setDeletando] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		setName(user?.name || '');
	}, [user]);

	useEffect(() => {
		const stored = localStorage.getItem(NOTIF_KEY);
		if (stored !== null) setNotificacoes(stored === 'true');
	}, []);

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			await pb.collection('users').update(user.id, { name: name.trim() });
			await refreshUser();
			toast({ title: 'Perfil atualizado!' });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro ao salvar', description: err?.message });
		} finally {
			setSaving(false);
		}
	};

	const handleNotificacoes = (checked) => {
		setNotificacoes(checked);
		localStorage.setItem(NOTIF_KEY, String(checked));
		toast({ title: checked ? 'Notificações ativadas' : 'Notificações desativadas' });
	};

	const handleSenha = async (e) => {
		e.preventDefault();
		setSalvandoSenha(true);
		try {
			// Valida a senha atual reautenticando
			await pb.collection('users').authWithPassword(user.email, senhaAtual);
			if (novaSenha.length < 8) {
				toast({ variant: 'destructive', title: 'A nova senha precisa ter no mínimo 8 caracteres.' });
				setSalvandoSenha(false);
				return;
			}
			if (novaSenha !== confirmarSenha) {
				toast({ variant: 'destructive', title: 'As senhas não coincidem.' });
				setSalvandoSenha(false);
				return;
			}
			await pb.collection('users').update(user.id, { password: novaSenha, passwordConfirm: confirmarSenha });
			setSenhaAtual('');
			setNovaSenha('');
			setConfirmarSenha('');
			toast({ title: 'Senha alterada com sucesso!' });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Senha atual incorreta ou não foi possível alterar.' });
		} finally {
			setSalvandoSenha(false);
		}
	};

	const handleDeletar = async () => {
		if (confirmDelete !== 'EXCLUIR') {
			toast({ variant: 'destructive', title: 'Digite EXCLUIR para confirmar.' });
			return;
		}
		setDeletando(true);
		try {
			await pb.collection('users').delete(user.id);
			logout();
			navigate('/', { replace: true });
		} catch (err) {
			toast({ variant: 'destructive', title: 'Não foi possível excluir a conta.', description: err?.message });
			setDeletando(false);
		}
	};

	return (
		<div className="min-h-[100dvh] bg-muted/40">
			<Helmet>
				<title>Configurações — Meu CMO</title>
				<meta name="description" content="Gerencie seu perfil, senha, preferências e conta no Meu CMO." />
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

			<main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
				<h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>

				{/* Perfil */}
				<form onSubmit={handleSave} className="mt-6 rounded-2xl border bg-card p-5">
					<div className="flex items-center gap-2 text-sm font-semibold"><User className="h-4 w-4" />Perfil</div>
					<div className="mt-4 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Seu nome</Label>
							<Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>E-mail</Label>
							<Input value={user?.email || ''} disabled className="bg-muted/50" />
						</div>
						<Button type="submit" disabled={saving} className="gap-2">
							{saving && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar perfil
						</Button>
					</div>
				</form>

				{/* Assinatura resumo */}
				<div className="mt-6 rounded-2xl border bg-card p-5">
					<div className="flex items-center justify-between">
						<p className="text-sm font-semibold">Assinatura</p>
						{tier ? <Badge variant="secondary">{TIER_LABELS[tier]}</Badge> : <Badge variant="outline">Sem assinatura</Badge>}
					</div>
					<p className="mt-2 text-sm text-muted-foreground">
						{tier
							? 'Gerencie cobrança, upgrade, downgrade e cancelamento na página da assinatura.'
							: 'Assine um plano para liberar todos os recursos.'}
					</p>
					<Button asChild variant="outline" size="sm" className="mt-4"><Link to="/subscriptions">Gerenciar assinatura</Link></Button>
				</div>

				{/* Alterar senha */}
				<form onSubmit={handleSenha} className="mt-6 rounded-2xl border bg-card p-5">
					<div className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4" />Alterar senha</div>
					<div className="mt-4 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="senhaAtual">Senha atual</Label>
							<Input id="senhaAtual" type="password" required value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="Sua senha atual" autoComplete="current-password" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="novaSenha">Nova senha</Label>
							<Input id="novaSenha" type="password" required value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
							<Input id="confirmarSenha" type="password" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="Repita a nova senha" autoComplete="new-password" />
						</div>
						<Button type="submit" disabled={salvandoSenha} className="gap-2">
							{salvandoSenha && <Loader2 className="h-4 w-4 animate-spin" />}
							Alterar senha
						</Button>
					</div>
				</form>

				{/* Preferências */}
				<div className="mt-6 rounded-2xl border bg-card p-5">
					<p className="text-sm font-semibold">Preferências</p>
					<div className="mt-4 space-y-5">
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-start gap-3">
								<Bell className="mt-0.5 h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">Notificações no app</p>
									<p className="text-xs text-muted-foreground">Receber avisos sobre planos e tarefas.</p>
								</div>
							</div>
							<Switch checked={notificacoes} onCheckedChange={handleNotificacoes} aria-label="Notificações" />
						</div>

						<div className="flex items-center justify-between gap-4">
							<div className="flex items-start gap-3">
								{resolvedTheme === 'dark' ? <Moon className="mt-0.5 h-4 w-4 text-muted-foreground" /> : <Sun className="mt-0.5 h-4 w-4 text-muted-foreground" />}
								<div>
									<p className="text-sm font-medium">Tema</p>
									<p className="text-xs text-muted-foreground">Alterne entre modo claro e escuro.</p>
								</div>
							</div>
							<div className="inline-flex rounded-lg border bg-background p-1">
								<button
									type="button"
									onClick={() => setTheme('light')}
									className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${resolvedTheme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
									aria-label="Modo claro"
								>
									<Sun className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={() => setTheme('dark')}
									className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${resolvedTheme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
									aria-label="Modo escuro"
								>
									<Moon className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Sair */}
				<div className="mt-6 rounded-2xl border bg-card p-5">
					<p className="text-sm font-semibold">Sessão</p>
					<Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => { logout(); navigate('/login', { replace: true }); }}>
						<LogOut className="h-4 w-4" />Sair da conta
					</Button>
				</div>

				{/* Zona de perigo */}
				<div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
					<div className="flex items-center gap-2 text-sm font-semibold text-destructive"><ShieldAlert className="h-4 w-4" />Zona de perigo</div>
					<p className="mt-2 text-sm text-muted-foreground">
						A exclusão da conta é permanente. Todos os seus dados — empresas, planos, histórico e
						conversas — serão apagados e não poderão ser recuperados.
					</p>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="destructive" size="sm" className="mt-4">Deletar conta</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Tem certeza absoluta?</DialogTitle>
								<DialogDescription>
									Essa ação não pode ser desfeita. Para confirmar, digite <strong>EXCLUIR</strong> abaixo.
								</DialogDescription>
							</DialogHeader>
							<Input
								value={confirmDelete}
								onChange={(e) => setConfirmDelete(e.target.value)}
								placeholder="EXCLUIR"
								autoFocus
							/>
							<DialogFooter>
								<Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
								<Button variant="destructive" onClick={handleDeletar} disabled={deletando} className="gap-2">
									{deletando && <Loader2 className="h-4 w-4 animate-spin" />}
									Excluir definitivamente
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<p className="mt-8 text-center text-xs text-muted-foreground">
					Ao continuar, você concorda com nossos{' '}
					<Link to="/termos" className="text-primary hover:underline">Termos de Serviço</Link> e{' '}
					<Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
				</p>
			</main>
		</div>
	);
}
