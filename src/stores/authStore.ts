import { create } from 'zustand';
import { User } from '../types';
import { mockCurrentUser, mockUsers } from '../api/mockData';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  loginWithGitHub: () => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Read saved session or use mock default user
  const savedUserJson = localStorage.getItem('codepulse_user');
  const savedToken = localStorage.getItem('codepulse_access_token');
  
  let initialUser: User | null = mockCurrentUser;
  let initialToken: string | null = 'mock-jwt-token-active-session-xyz789';

  if (savedUserJson) {
    try {
      initialUser = JSON.parse(savedUserJson);
      initialToken = savedToken || 'token-loaded';
    } catch {
      // fallback
    }
  } else {
    // initialize default demo user
    localStorage.setItem('codepulse_user', JSON.stringify(mockCurrentUser));
    localStorage.setItem('codepulse_access_token', initialToken);
    localStorage.setItem('codepulse_refresh_token', 'mock-refresh-token-active');
  }

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialUser,
    isLoading: false,
    error: null,

    login: async (email: string) => {
      set({ isLoading: true, error: null });
      await new Promise((r) => setTimeout(r, 800));

      const matchedUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
        id: 'usr-' + Math.random().toString(36).substring(2, 7),
        name: email.split('@')[0].replace('.', ' '),
        email,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        role: 'developer' as const,
        title: 'Software Engineer',
        createdAt: new Date().toISOString(),
        lastActive: 'Just now'
      };

      const token = 'jwt-' + Math.random().toString(36).substring(2);
      localStorage.setItem('codepulse_user', JSON.stringify(matchedUser));
      localStorage.setItem('codepulse_access_token', token);
      localStorage.setItem('codepulse_refresh_token', 'refresh-' + Math.random().toString(36).substring(2));

      set({
        user: matchedUser,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    },

    register: async (name: string, email: string) => {
      set({ isLoading: true, error: null });
      await new Promise((r) => setTimeout(r, 900));

      const newUser: User = {
        id: 'usr-' + Math.random().toString(36).substring(2, 7),
        name,
        email,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        role: 'developer',
        title: 'Fullstack Engineer',
        createdAt: new Date().toISOString(),
        lastActive: 'Just now'
      };

      const token = 'jwt-' + Math.random().toString(36).substring(2);
      localStorage.setItem('codepulse_user', JSON.stringify(newUser));
      localStorage.setItem('codepulse_access_token', token);
      localStorage.setItem('codepulse_refresh_token', 'refresh-' + Math.random().toString(36).substring(2));

      set({
        user: newUser,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    },

    loginWithGitHub: async () => {
      set({ isLoading: true, error: null });
      await new Promise((r) => setTimeout(r, 1000));

      const ghUser: User = {
        ...mockCurrentUser,
        githubUsername: 'octocat-dev',
        title: 'Principal Developer',
      };

      const token = 'gh-oauth-jwt-' + Math.random().toString(36).substring(2);
      localStorage.setItem('codepulse_user', JSON.stringify(ghUser));
      localStorage.setItem('codepulse_access_token', token);
      localStorage.setItem('codepulse_refresh_token', 'gh-refresh-token');

      set({
        user: ghUser,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    },

    logout: () => {
      localStorage.removeItem('codepulse_user');
      localStorage.removeItem('codepulse_access_token');
      localStorage.removeItem('codepulse_refresh_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  };
});

