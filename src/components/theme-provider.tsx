'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useChatStore } from '@/store/useChatStore';
import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useChatStore();

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme={theme} 
      value={{
        light: "light",
        dark: "dark", 
        system: "system"
      }}
      enableSystem
      disableTransitionOnChange
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  );
}


function ThemeSync() {
  const { theme: storeTheme } = useChatStore();

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    if (storeTheme !== currentTheme) {
      if (storeTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (storeTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (storeTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  }, [storeTheme]);

  useEffect(() => {
    if (storeTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [storeTheme]);

  return null;
}