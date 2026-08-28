import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle({ className }) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = mounted && resolvedTheme === 'dark';

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className={className}
			aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
		>
			{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</Button>
	);
}
