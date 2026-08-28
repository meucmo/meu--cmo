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
		await pb.collection('users').create({
			name,
			email,
			password,
			passwordConfirm: password,
		});
		return pb.collection('users').authWithPassword(email, password);
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
