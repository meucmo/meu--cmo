import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Bot, Loader2, MailCheck } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function LoginPage() {
	const { login, isAuthed } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [resetOpen, setResetOpen] = useState(false);
	const [resetEmail, setResetEmail] = useState('');
	const [resetLoading, setResetLoading] = useState(false);
	const [resetSent, setResetSent] = useState(false);

	if (isAuthed) {
		return <Navigate to="/dashboard" replace />;
	}

	const handleReset = async (event) => {
		event.preventDefault();
		if (!resetEmail.trim()) return;
		setResetLoading(true);
		try {
			await pb.collection('users').requestPasswordReset(resetEmail.trim());
			setResetSent(true);
			toast({ title: 'E-mail enviado', description: 'Confira sua caixa de entrada com o link de recuperação.' });
		} catch {
			toast({ variant: 'destructive', title: 'Não foi possível enviar o e-mail. Tente novamente.' });
		} finally {
			setResetLoading(false);
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setLoading(true);
		try {
			await login(email.trim(), password);
			navigate(location.state?.from || '/dashboard', { replace: true });
		} catch {
			setError('E-mail ou senha incorretos. Confira os dados e tente novamente.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-[100dvh] flex-col bg-muted/40">
			<Helmet>
				<title>Entrar — Meu CMO</title>
				<meta name="description" content="Acesse sua conta do Meu CMO e fale com sua IA gerente de marketing." />
			</Helmet>
			<header className="flex items-center justify-between px-4 py-4 sm:px-6">
				<Link to="/" className="flex items-center gap-2">
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<Bot className="h-4.5 w-4.5 text-primary-foreground" />
					</span>
					<span className="font-display text-lg font-bold tracking-tight">Meu CMO</span>
				</Link>
				<ThemeToggle />
			</header>
			<main className="flex flex-1 items-center justify-center px-4 pb-16">
				<div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
					<h1 className="font-display text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						Entre para falar com sua IA gerente de marketing.
					</p>
					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">E-mail</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								required
								placeholder="voce@empresa.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Senha</Label>
								<Dialog
									open={resetOpen}
									onOpenChange={(open) => {
										setResetOpen(open);
										if (!open) {
											setResetSent(false);
											setResetEmail('');
										}
									}}
								>
									<DialogTrigger asChild>
										<button type="button" className="text-xs font-medium text-primary hover:underline">
											Esqueci minha senha
										</button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Recuperar senha</DialogTitle>
											<DialogDescription>
												Informe seu e-mail e enviaremos um link para você criar uma nova senha. O link é válido por 24 horas.
											</DialogDescription>
										</DialogHeader>
										{resetSent ? (
											<div className="flex flex-col items-center gap-3 py-4 text-center">
												<span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
													<MailCheck className="h-6 w-6 text-primary" />
												</span>
												<p className="text-sm text-muted-foreground">
													Enviamos um e-mail para <strong>{resetEmail}</strong>. Confira sua caixa de entrada (e o spam) e clique no link para definir uma nova senha.
												</p>
											</div>
										) : (
											<form onSubmit={handleReset} className="space-y-4">
												<div className="space-y-2">
													<Label htmlFor="reset-email">E-mail</Label>
													<Input
														id="reset-email"
														type="email"
														required
														placeholder="voce@empresa.com"
														value={resetEmail}
														onChange={(event) => setResetEmail(event.target.value)}
													/>
												</div>
												<Button type="submit" className="w-full" disabled={resetLoading}>
													{resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
													Enviar link de recuperação
												</Button>
											</form>
										)}
										<DialogFooter>
											<Button variant="outline" onClick={() => setResetOpen(false)}>Fechar</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								required
								placeholder="Sua senha"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</div>
						{error && (
							<p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
						)}
						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Entrar
						</Button>
					</form>
					<p className="mt-6 text-center text-sm text-muted-foreground">
						Ainda não tem conta?{' '}
						<Link to="/cadastro" className="font-medium text-primary hover:underline">
							Criar conta
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
}
