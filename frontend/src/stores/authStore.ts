
import { create } from 'zustand';
import type { User, UserSession, TwoFactorSetupData } from '../types';
import { mockAuthApi } from '../api/mock/mockAuthApi';
import { apiClient } from '../api/client';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
} from 'firebase/auth';


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




interface ApiUser {
  id: string | number;
  username: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
}

const LEGACY_KEYS = [
  'bugpulse_mock_current_user',
  'codepulse_access_token',
  'codepulse_refresh_token',
  'codepulse_user',
];

function clearLegacySession() {
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
}

function mapApiUser(apiUser: ApiUser, firebaseUser: FirebaseUser): User {
  return {
    id: String(apiUser.id),
    name: apiUser.full_name || firebaseUser.displayName || apiUser.username,
    username: apiUser.username,
    email: apiUser.email,
    avatarUrl: firebaseUser.photoURL || '',
    role: 'developer',
    title: 'Developer',
    twoFactorEnabled: false,
    emailVerified: firebaseUser.emailVerified,
    createdAt:
      firebaseUser.metadata.creationTime || new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
}

async function syncWithBackend(firebaseUser: FirebaseUser) {
  const token = await firebaseUser.getIdToken();

  // Creates the backend user record if it doesn't exist yet.
  await apiClient.post('/auth/session');

  const response = await apiClient.get<ApiUser>('/auth/me');

  return {
    user: mapApiUser(response.data, firebaseUser),
    token,
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  const useMock = typeof window !== 'undefined' && import.meta.env.VITE_USE_MOCK === 'true';
  let initialUser: User | null = null;
  let initialToken: string | null = null;
  let initialRefresh: string | null = null;

  if (useMock && typeof window !== 'undefined') {
    const savedUserJson = localStorage.getItem('bugpulse_mock_current_user');
    initialToken = localStorage.getItem('codepulse_access_token');
    initialRefresh = localStorage.getItem('codepulse_refresh_token');
    if (savedUserJson && initialToken) {
      try {
        initialUser = JSON.parse(savedUserJson);
      } catch {
        initialUser = null;
      }
    }
  }

  return {
    user: initialUser,
    accessToken: initialToken,
    refreshToken: initialRefresh,
    isAuthenticated: !!initialUser,
    isLoading: !initialUser,
    error: null,

    twoFactorRequired: false,
    tempToken: null,
    pendingUser: null,

    login: async (email: string, pass: string) => {
      set({ isLoading: true, error: null });
      const useMockEnv = import.meta.env.VITE_USE_MOCK === 'true';

      if (useMockEnv && (email.toLowerCase().includes('acme.dev') || email.toLowerCase().includes('codepulse.ai'))) {
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
            isLoading: false,
            twoFactorRequired: false,
            tempToken: null,
            pendingUser: null,
          });
          return { success: true };
        } catch (mockErr: unknown) {
          const msg = mockErr instanceof Error ? mockErr.message : 'Login failed.';
          set({ error: msg, isLoading: false });
          return { success: false };
        }
      }

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      pass
      
    );

    const { user, token } = await syncWithBackend(credential.user);

    set({
      user,
      accessToken: token,
      refreshToken: null,
      isAuthenticated: true,
      isLoading: false,
      twoFactorRequired: false,
      tempToken: null,
      pendingUser: null,
    });

    return { success: true };
  } catch (err: unknown) {
    if (auth.currentUser) {
  await signOut(auth).catch(() => undefined);
}
    const msg =
      err instanceof Error ? err.message : 'Login failed.';

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

const credential = await createUserWithEmailAndPassword(
  auth,
  email,
  pass
);

await updateFirebaseProfile(credential.user, {
  displayName: name,
});
await sendEmailVerification(credential.user);
// Create/sync the backend user record.
await syncWithBackend(credential.user);

// Registration must not leave the user authenticated.
await signOut(auth);

set({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  twoFactorRequired: false,
  tempToken: null,
  pendingUser: null,
  error: null,
});

return {
  success: true,
  message: 'Account created successfully. Please sign in.',
};

  } catch (err: unknown) {
    if (auth.currentUser) {
      await signOut(auth).catch(() => undefined);
    }

    const msg =
      err instanceof Error ? err.message : 'Registration failed.';

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: msg,
    });

    return { success: false, message: msg };
  }
},




loginWithOAuth: async (provider: 'google' | 'github') => {
  set({ isLoading: true, error: null });

  try {
    if (provider === 'github') {
      throw new Error(
        'GitHub sign-in is not configured yet. Please use Google or email sign-in.'
      );
    }

    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });

    const credential = await signInWithPopup(auth, googleProvider);

    const { user, token } = await syncWithBackend(credential.user);

    set({
      user,
      accessToken: token,
      refreshToken: null,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      twoFactorRequired: false,
      tempToken: null,
      pendingUser: null,
    });

    return true;
  } catch (err: unknown) {
    const firebaseError = err as { code?: string; message?: string };

    // Closing the Google popup is not an authentication failure.
    if (firebaseError.code === 'auth/popup-closed-by-user') {
      set({ isLoading: false, error: null });
      return false;
    }

    const message =
      firebaseError.message || 'Google sign-in failed. Please try again.';

    // Don't leave a newly authenticated Firebase account signed in if
    // the backend session could not be established.
    if (auth.currentUser) {
      await signOut(auth).catch(() => undefined);
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: message,
    });

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
  void signOut(auth).catch((err: unknown) => {
    console.error('Firebase sign-out failed:', err);
  });

  clearLegacySession();

  set({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    twoFactorRequired: false,
    tempToken: null,
    pendingUser: null,
    error: null,
  });
},


    clearError: () => set({ error: null }),
  };
});

onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    clearLegacySession();

    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      twoFactorRequired: false,
      tempToken: null,
      pendingUser: null,
    });

    return;
  }

  useAuthStore.setState({ isLoading: true });

  try {
    const { user, token } = await syncWithBackend(firebaseUser);

    // Ignore stale requests if this user has signed out
    // or another account has signed in.
    if (auth.currentUser?.uid !== firebaseUser.uid) {
      return;
    }

    useAuthStore.setState({
      user,
      accessToken: token,
      refreshToken: null,
      isAuthenticated: true,
      isLoading: false,
      twoFactorRequired: false,
      tempToken: null,
      pendingUser: null,
    });
  } catch (err: unknown) {
    // Don't let an old request overwrite the latest auth state.
    if (auth.currentUser?.uid !== firebaseUser.uid) {
      return;
    }

    console.error('Failed to restore authentication session:', err);

    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Could not restore your session. Please sign in again.',
    });
  }
});
