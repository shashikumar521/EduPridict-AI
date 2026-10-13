import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('edupredict_theme') as Theme | null;
        if (saved === 'dark' || saved === 'light') {
          return saved;
        }
      } catch {
        // storage disabled or error
      }
    }
    // Default to 'light' per user specification: "Match my first light-theme screenshot using these colors"
    return 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        if (body) {
          body.classList.add('dark');
          body.classList.remove('light');
          body.style.backgroundColor = '#090a0f';
          body.style.color = '#f4f4f5';
        }
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        if (body) {
          body.classList.remove('dark');
          body.classList.add('light');
          body.style.backgroundColor = '#F7F9FC';
          body.style.color = '#11182E';
        }
      }
      try {
        localStorage.setItem('edupredict_theme', theme);
      } catch {
        // ignore storage errors
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
