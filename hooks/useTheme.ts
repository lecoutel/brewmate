import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';

export function useTheme(): [Theme, (theme: Theme) => void] {
  const getInitialTheme = useCallback((): Theme => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme && (storedTheme === Theme.Light || storedTheme === Theme.Dark)) {
        return storedTheme;
      }
      // If no explicit theme in localStorage, or if 'theme' was 'system' (which we don't store)
      // then rely on system preference.
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return Theme.Dark;
      }
    }
    return Theme.Light; // Default fallback
  }, []);

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((themeToApply: Theme) => {
    const root = window.document.documentElement;
    let applySystemTheme = themeToApply === Theme.System;
    let isDark: boolean;

    if (applySystemTheme) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      localStorage.removeItem('theme');
    } else {
      isDark = themeToApply === Theme.Dark;
      localStorage.setItem('theme', themeToApply);
    }

    root.classList.remove(isDark ? Theme.Light : Theme.Dark);
    root.classList.add(isDark ? Theme.Dark : Theme.Light);
  }, []);

  useEffect(() => {
    // Initialize theme on first load based on initial state
    applyTheme(theme);
  }, [theme, applyTheme]); // Rerun when theme state changes

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only update if the current theme is 'system' or if no theme is explicitly set in localStorage.
      // This means if user manually set Light/Dark, system changes shouldn't override it.
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (theme === Theme.System || !storedTheme) {
        // If current theme state is System, or nothing in localStorage, then update based on system change
        setThemeState(mediaQuery.matches ? Theme.Dark : Theme.Light);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]); // Re-attach listener if `theme` (the state variable) changes, to ensure logic is current

  // This is the function exposed to components to change the theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme); // Update state, which triggers useEffect to applyTheme
  };
  
  return [theme, setTheme];
}
