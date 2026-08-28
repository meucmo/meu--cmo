import { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'meucmo:install-dismissed';
const INSTALLED_KEY = 'meucmo:installed';

function isStandalone() {
	if (typeof window === 'undefined') return false;
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		window.matchMedia('(display-mode: fullscreen)').matches ||
		// iOS Safari
		window.navigator.standalone === true
	);
}

function isIOS() {
	if (typeof window === 'undefined') return false;
	const ua = window.navigator.userAgent.toLowerCase();
	return /iphone|ipad|ipod/.test(ua) && !/crios|fxios|edgios/.test(ua);
}

export default function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [showAndroid, setShowAndroid] = useState(false);
	const [showIOS, setShowIOS] = useState(false);

	useEffect(() => {
		if (isStandalone()) {
			try {
				localStorage.setItem(INSTALLED_KEY, '1');
			} catch {
				/* ignore */
			}
			return;
		}

		// Already dismissed or installed before
		let dismissed = false;
		try {
			dismissed = localStorage.getItem(DISMISS_KEY) === '1';
		} catch {
			/* ignore */
		}
		if (dismissed) return;

		const onBeforeInstall = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setShowAndroid(true);
		};

		const onAppInstalled = () => {
			setShowAndroid(false);
			setShowIOS(false);
			setDeferredPrompt(null);
			try {
				localStorage.setItem(INSTALLED_KEY, '1');
			} catch {
				/* ignore */
			}
		};

		window.addEventListener('beforeinstallprompt', onBeforeInstall);
		window.addEventListener('appinstalled', onAppInstalled);

		// iOS has no beforeinstallprompt — show manual instructions on Safari
		if (isIOS()) {
			const t = setTimeout(() => setShowIOS(true), 1500);
			return () => {
				window.removeEventListener('beforeinstallprompt', onBeforeInstall);
				window.removeEventListener('appinstalled', onAppInstalled);
				clearTimeout(t);
			};
		}

		return () => {
			window.removeEventListener('beforeinstallprompt', onBeforeInstall);
			window.removeEventListener('appinstalled', onAppInstalled);
		};
	}, []);

	const dismiss = () => {
		setShowAndroid(false);
		setShowIOS(false);
		try {
			localStorage.setItem(DISMISS_KEY, '1');
		} catch {
			/* ignore */
		}
	};

	const install = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		try {
			await deferredPrompt.userChoice;
		} catch {
			/* ignore */
		}
		setDeferredPrompt(null);
		setShowAndroid(false);
	};

	if (!showAndroid && !showIOS) return null;

	return (
		<div
			role="dialog"
			aria-label="Instalar aplicativo"
			className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
		>
			<div className="rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/80">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Download className="h-5 w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="font-display text-sm font-semibold text-foreground">
							Instale o Meu CMO
						</p>
						<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
							{showAndroid
								? 'Adicione à tela inicial e acesse como um app nativo, em tela cheia.'
								: 'Toque em Compartilhar e depois em “Adicionar à Tela de Início” para usar como app.'}
						</p>

						{showIOS && (
							<ol className="mt-2 space-y-1 text-xs text-muted-foreground">
								<li className="flex items-center gap-1.5">
									<Share className="h-3.5 w-3.5 text-primary" />
									Toque no botão Compartilhar
								</li>
								<li className="flex items-center gap-1.5">
									<PlusSquare className="h-3.5 w-3.5 text-primary" />
									Escolha “Adicionar à Tela de Início”
								</li>
							</ol>
						)}

						<div className="mt-3 flex items-center gap-2">
							{showAndroid && (
								<Button size="sm" onClick={install} className="h-8">
									<Download className="mr-1.5 h-4 w-4" />
									Instalar
								</Button>
							)}
							<Button
								size="sm"
								variant="ghost"
								onClick={dismiss}
								className="h-8 text-muted-foreground"
							>
								Não agora
							</Button>
						</div>
					</div>
					<button
						type="button"
						onClick={dismiss}
						aria-label="Fechar"
						className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
