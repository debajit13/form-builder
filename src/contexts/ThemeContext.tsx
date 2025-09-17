import { createContext, useEffect, useState, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { THEMES, STORAGE_KEYS } from '../utils/constants';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useLocalStorage<Theme>(STORAGE_KEYS.THEME, THEMES.SYSTEM);

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Update actualTheme when theme changes
  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setActualTheme(mediaQuery.matches ? 'dark' : 'light')
      } else if (theme === 'dark') {
        setActualTheme('dark')
      } else if (theme === 'light') {
        setActualTheme('light')
      }
    }

    updateActualTheme()
  }, [theme])

  // Listen to system theme changes only when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setActualTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [theme])

  // Apply the theme to the document
  useEffect(() => {
    const root = document.documentElement

    if (actualTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [actualTheme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    actualTheme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

