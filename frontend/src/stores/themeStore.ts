import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = localStorage.getItem('codepulse_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialDark = savedTheme ? savedTheme === 'dark' : true; // default dark for developer tool aesthetic

  // Sync with document element
  if (initialDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    isDark: initialDark,
    toggleTheme: () => {
      set((state) => {
        const nextDark = !state.isDark;
        if (nextDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('codepulse_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('codepulse_theme', 'light');
        }
        return { isDark: nextDark };
      });
    },
    setTheme: (dark: boolean) => {
      if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('codepulse_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('codepulse_theme', 'light');
      }
      set({ isDark: dark });
    },
  };
});

