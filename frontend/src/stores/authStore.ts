import { create } from 'zustand';
import { User, UserSession, TwoFactorSetupData } from '../types';
import { mockAuthApi } from '../api/mock/mockAuthApi';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 2FA Challenge State
  twoFactorRequired: boolean;
  tempToken: string | null;
  pendingUser: Partial<User> | null;

  // Methods
  login: (email: string, pass: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  verify2FA: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  cancel2FA: () => void;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  uploadAvatar: (dataUrlOrFile: string | File) => Promise<string>;
  deleteAvatar: () => Promise<void>;
  enable2FA: (code: string) => Promise<boolean>;
  disable2FA: (password: string, code: string) => Promise<boolean>;
  regenerateBackupCodes: () => Promise<string[]>;
  toggleProvider: (provider: 'google' | 'github', connect: boolean) => Promise<void>;
  deleteAccount: (confirmEmail: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const STORAGE_USER_KEY = 'bugpulse_mock_current_user';
const STORAGE_ACCESS_KEY = 'codepulse_access_token';
const STORAGE_REFRESH_KEY = 'codepulse_refresh_token';

export const useAuthStore = create<AuthState>((set, get) => {
  // Read saved session
  const savedUserJson = localStorage.getItem(STORAGE_USER_KEY);
  const savedToken = localStorage.getItem(STORAGE_ACCESS_KEY);
  const savedRefresh = localStorage.getItem(STORAGE_REFRESH_KEY);

  let initialUser: User | null = null;
  if (savedUserJson && savedToken) {
    try {
      initialUser = JSON.parse(savedUserJson);
    } catch {
      initialUser = null;
    }
  }

  return {
    user: initialUser,
    accessToken: savedToken,
    refreshToken: savedRefresh,
    isAuthenticated: !!initialUser,
    isLoading: false,
    error: null,

    twoFactorRequired: false,
    tempToken: null,
    pendingUser: null,

    login: async (email: string, pass: string) => {
      set({ isLoading: true, error: null });
      try {
        const res = await mockAuthApi.login({ email, password: pass });

        if (res.requires2FA) {
          set({
            twoFactorRequired: true,
            tempToken: res.tempToken || null,
            pendingUser: res.user || null,
            isLoading: false,
          });
          return { success: false, requires2FA: true };
        }

        set({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          isAuthenticated: true,
          twoFactorRequired: false,
          tempToken: null,
          pendingUser: null,
          isLoading: false,
        });

        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Incorrect email or password.';
        set({ error: msg, isLoading: false });
        return { success: false };
      }
    },

    verify2FA: async (code: string, isBackupCode = false) => {
      const tempToken = get().tempToken;
      if (!tempToken) {
        set({ error: '2FA session expired. Please sign in again.' });
        return false;
      }

      set({ isLoading: true, error: null });
      try {
        const res = await mockAuthApi.verify2FALogin({ tempToken, code, isBackupCode });
        set({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          isAuthenticated: true,
          twoFactorRequired: false,
          tempToken: null,
          pendingUser: null,
          isLoading: false,
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid code.';
        set({ error: msg, isLoading: false });
        return false;
      }
    },

    cancel2FA: () => {
      set({
        twoFactorRequired: false,
        tempToken: null,
        pendingUser: null,
        error: null,
      });
    },

    register: async (name: string, email: string, pass: string) => {
      set({ isLoading: true, error: null });
      try {
        const res = await mockAuthApi.register({ name, email, password: pass });
        set({ isLoading: false });
        return { success: true, message: res.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed.';
        set({ error: msg, isLoading: false });
        return { success: false };
      }
    },

    loginWithOAuth: async (provider: 'google' | 'github') => {
      set({ isLoading: true, error: null });
      try {
        // In mock mode, simulate successful OAuth grant
        await new Promise((r) => setTimeout(r, 600));

        const stored = await mockAuthApi.getCurrentUser();
        const email = `${stored.username}@${provider === 'google' ? 'gmail.com' : 'github.com'}`;
        const updated: User = {
          ...stored,
          email,
          connectedAccounts: [
            { provider, connected: true, email, connectedAt: new Date().toISOString() },
            ...(stored.connectedAccounts || []).filter((a) => a.provider !== provider),
          ],
        };

        const accessToken = 'oauth_jwt_' + Math.random().toString(36).substring(2);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
        localStorage.setItem(STORAGE_ACCESS_KEY, accessToken);

        set({
          user: updated,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'OAuth sign-in failed.';
        set({ error: msg, isLoading: false });
        return false;
      }
    },

    updateProfile: async (updates: Partial<User>) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await mockAuthApi.updateProfile(updates);
        set({ user: updated, isLoading: false });
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update profile.';
        set({ error: msg, isLoading: false });
        throw err;
      }
    },

    uploadAvatar: async (dataUrlOrFile: string | File) => {
      set({ isLoading: true, error: null });
      try {
        const res = await mockAuthApi.uploadAvatar(dataUrlOrFile);
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, avatarUrl: res.avatarUrl };
          set({ user: updated, isLoading: false });
        }
        return res.avatarUrl;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Avatar upload failed.';
        set({ error: msg, isLoading: false });
        throw err;
      }
    },

    deleteAvatar: async () => {
      set({ isLoading: true, error: null });
      try {
        await mockAuthApi.deleteAvatar();
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, avatarUrl: '' };
          set({ user: updated, isLoading: false });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to remove avatar.';
        set({ error: msg, isLoading: false });
        throw err;
      }
    },

    enable2FA: async (code: string) => {
      set({ isLoading: true, error: null });
      try {
        const res = await mockAuthApi.enable2FA(code);
        set({ user: res.user, isLoading: false });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to enable 2FA.';
        set({ error: msg, isLoading: false });
        throw err;
      }
    },

    disable2FA: async (password: string, code: string) => {
      set({ isLoading: true, error: null });
      try {
        const res = await mockAuthApi.disable2FA({ password, code });
        set({ user: res.user, isLoading: false });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to disable 2FA.';
        set({ error: msg, isLoading: false });
        throw err;
      }
    },

    regenerateBackupCodes: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await mockAuthApi.regenerateBackupCodes();
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, backupCodesRemaining: res.backupCodes.length },
            isLoading: false,
          });
        }
        return res.backupCodes;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to regenerate backup codes.';
        set({ error: msg, isLoading: false });
        throw err;
      }
    },

    toggleProvider: async (provider: 'google' | 'github', connect: boolean) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await mockAuthApi.toggleProvider(provider, connect);
        set({ user: updated, isLoading: false });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update linked account.';
        set({ error: msg, isLoading: false });
        throw err;
      }
    },

    deleteAccount: async (confirmEmail: string) => {
      set({ isLoading: true, error: null });
      try {
        await mockAuthApi.deleteAccount(confirmEmail);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete account.';
        set({ error: msg, isLoading: false });
        throw err;
      }
    },

    logout: () => {
      mockAuthApi.logout();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        twoFactorRequired: false,
        tempToken: null,
        pendingUser: null,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  };
});
