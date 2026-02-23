'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
    theme: Theme;
    toggle: () => void;
}>({ theme: 'light', toggle: () => { } });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('theme') as Theme | null;
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initial = saved ?? preferred;
        setTheme(initial);
        document.documentElement.setAttribute('data-theme', initial);
    }, []);

    const toggle = () => {
        const next: Theme = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem('theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    // Prevent hydration mismatch — render children always, theme applied via data-attr
    return (
        <ThemeContext.Provider value={{ theme: mounted ? theme : 'light', toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
