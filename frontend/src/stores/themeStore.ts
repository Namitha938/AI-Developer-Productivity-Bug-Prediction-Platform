import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

const syncThemeToDOM = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    localStorage.setItem('tracepoint_theme', 'dark');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('codepulse_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    localStorage.setItem('tracepoint_theme', 'light');
    localStorage.setItem('theme', 'light');
    localStorage.setItem('codepulse_theme', 'light');
  }
};

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme =
    localStorage.getItem('tracepoint_theme') ||
    localStorage.getItem('theme') ||
    localStorage.getItem('codepulse_theme');

  // Default to true (dark) if not set, or restore saved theme
  const initialDark = savedTheme ? savedTheme === 'dark' : true;

  // Sync initially with document element
  syncThemeToDOM(initialDark);

  return {
    isDark: initialDark,
    toggleTheme: () => {
      set((state) => {
        const nextDark = !state.isDark;
        syncThemeToDOM(nextDark);
        return { isDark: nextDark };
      });
    },
    setTheme: (dark: boolean) => {
      syncThemeToDOM(dark);
      set({ isDark: dark });
    },
  };
});
