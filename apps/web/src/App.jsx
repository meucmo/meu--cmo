import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionAuthProvider } from '@/contexts/SubscriptionAuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop';
import InstallPrompt from '@/components/InstallPrompt';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import AdminPage from '@/pages/AdminPage';
import HistoricoPage from '@/pages/HistoricoPage';
import PlansPage from '@/pages/PlansPage.jsx';
import SubscriptionsPage from '@/pages/SubscriptionsPage.jsx';
import CompaniesPage from '@/pages/CompaniesPage.jsx';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage.jsx';
import ExemplosPage from '@/pages/ExemplosPage.jsx';
import IdeiasPage from '@/pages/IdeiasPage.jsx';
import TermosPage from '@/pages/TermosPage.jsx';
import PrivacyPage from '@/pages/PrivacyPage.jsx';

function App() {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<AuthProvider>
				<SubscriptionAuthProvider>
					<Router>
						<ScrollToTop />
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/login" element={<LoginPage />} />
							<Route path="/cadastro" element={<SignupPage />} />
							<Route path="/plans" element={<PlansPage />} />
							<Route path="/termos" element={<TermosPage />} />
							<Route path="/privacidade" element={<PrivacyPage />} />
							<Route
								path="/subscriptions"
								element={(
									<ProtectedRoute>
										<SubscriptionsPage />
									</ProtectedRoute>
								)}
							/>
							<Route
								path="/onboarding"
								element={(
									<ProtectedRoute>
										<OnboardingPage />
									</ProtectedRoute>
								)}
							/>
							<Route
								path="/dashboard"
								element={(
									<ProtectedRoute>
										<DashboardPage />
									</ProtectedRoute>
								)}
							/>
							<Route
								path="/companies"
								element={(
									<ProtectedRoute>
										<CompaniesPage />
									</ProtectedRoute>
								)}
							/>
							<Route
								path="/ideias"
								element={(
									<ProtectedRoute>
										<IdeiasPage />
									</ProtectedRoute>
								)}
							/>
							<Route
								path="/configuracoes"
								element={(
									<ProtectedRoute>
										<ConfiguracoesPage />
									</ProtectedRoute>
								)}
							/>
							<Route
								path="/historico"
								element={(
									<ProtectedRoute>
										<HistoricoPage />
									</ProtectedRoute>
								)}
							/>
							<Route
								path="/admin"
								element={(
									<ProtectedRoute>
										<AdminPage />
									</ProtectedRoute>
								)}
							/>
							<Route
								path="/exemplos"
								element={(
									<ProtectedRoute>
										<ExemplosPage />
									</ProtectedRoute>
								)}
							/>
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
						<InstallPrompt />
					</Router>
				</SubscriptionAuthProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
