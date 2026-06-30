import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem('theme') || 'dark',
  
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    set({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
  },
  
  initTheme: () => {
    const theme = get().theme;
    document.documentElement.setAttribute('data-theme', theme);
  }
}));