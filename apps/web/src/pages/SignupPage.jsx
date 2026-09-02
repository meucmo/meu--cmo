import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Bot, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignupPage() {
	const { signup, isAuthed } = useAuth();
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	if (isAuthed) {
		return <Navigate to="/dashboard" replace />;
	}

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');

		if (password.length < 8) {
			setError('A senha precisa ter pelo menos 8 caracteres.');
			return;
		}
		if (password !== confirm) {
			setError('As senhas não coincidem. Confira e tente novamente.');
			return;
		}

		setLoading(true);
		try {
			await signup({ name: name.trim(), email: email.trim(), password });
			toast({
				title: 'Conta criada!',
				description: 'Enviamos um e-mail de verificação para você. Confira sua caixa de entrada.',
			});
			navigate('/onboarding', { replace: true });
		} catch (err) {
			const status = err?.status ?? 0;
			const data = err?.response?.data || {};
			const emailError = data.email?.message;

			if (status === 0) {
				setError('Sem conexão com o servidor. Verifique sua internet e tente novamente em alguns segundos.');
			} else if (status === 429) {
				setError('Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.');
			} else if (emailError) {
				setError('Este e-mail já está em uso. Tente entrar na sua conta.');
			} else if (data.password?.message) {
				setError('A senha não atende aos requisitos. Use ao menos 8 caracteres.');
			} else if (data.email?.code || data.email) {
				setError('E-mail inválido. Confira o endereço digitado.');
			} else {
				setError('Não foi possível criar sua conta agora. Tente novamente em instantes.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-[100dvh] flex-col bg-muted/40">
			<Helmet>
				<title>Criar conta — Meu CMO</title>
				<meta name="description" content="Crie sua conta no Meu CMO e ganhe uma IA gerente de marketing para o seu negócio." />
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
					<h1 className="font-display text-2xl font-bold tracking-tight">Crie sua conta</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						Em minutos, sua IA gerente de marketing começa a trabalhar.
					</p>
					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Seu nome</Label>
							<Input
								id="name"
								autoComplete="name"
								required
								placeholder="Como podemos te chamar?"
								value={name}
								onChange={(event) => setName(event.target.value)}
							/>
						</div>
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
							<Label htmlFor="password">Senha</Label>
							<Input
								id="password"
								type="password"
								autoComplete="new-password"
								required
								placeholder="Mínimo de 8 caracteres"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm">Confirmar senha</Label>
							<Input
								id="confirm"
								type="password"
								autoComplete="new-password"
								required
								placeholder="Repita a senha"
								value={confirm}
								onChange={(event) => setConfirm(event.target.value)}
							/>
						</div>
						{error && (
							<p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
						)}
						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Criar conta
						</Button>
					</form>
					<p className="mt-6 text-center text-sm text-muted-foreground">
						Já tem conta?{' '}
						<Link to="/login" className="font-medium text-primary hover:underline">
							Entrar
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
}
