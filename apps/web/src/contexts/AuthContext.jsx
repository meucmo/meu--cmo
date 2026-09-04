import React, { createContext, useContext, useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => (pb.authStore.isValid ? pb.authStore.record : null));

	useEffect(() => {
		const unsubscribe = pb.authStore.onChange(() => {
			setUser(pb.authStore.isValid ? pb.authStore.record : null);
		});
		return () => unsubscribe();
	}, []);

	const login = (email, password) => pb.collection('users').authWithPassword(email, password);

	const signup = async ({ name, email, password }) => {
		const payload = {
			name,
			email,
			password,
			passwordConfirm: password,
			role: 'customer',
			emailVisibility: false,
		};
		// Evita cancelamento automático do SDK se houver request em paralelo.
		await pb.collection('users').create(payload, { requestKey: `signup-create-${email}` });
		try {
			return await pb.collection('users').authWithPassword(email, password, {
				requestKey: `signup-auth-${email}`,
			});
		} catch (authErr) {
			// Conta já existe no servidor; o login falhou por outro motivo.
			const enriched = authErr || new Error('Falha ao entrar após criar a conta');
			enriched.accountCreated = true;
			throw enriched;
		}
	};

	const logout = () => pb.authStore.clear();

	const refreshUser = async () => {
		try {
			const refreshed = await pb.collection('users').authRefresh();
			return refreshed.record;
		} catch {
			return null;
		}
	};

	return (
		<AuthContext.Provider value={{ user, isAuthed: Boolean(user), login, signup, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within <AuthProvider>');
	}
	return context;
}
