
import { create } from 'zustand';
import type { User } from '../types';
import { apiClient } from '../api/client';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  GithubAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as updateFirebasePassword,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
  getMultiFactorResolver,
TotpMultiFactorGenerator,
type MultiFactorResolver,
type MultiFactorError,
  linkWithCredential,
} from 'firebase/auth';
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  twoFactorRequired: boolean;
  tempToken: string | null;
  pendingUser: Partial<User> | null;

  login: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; requires2FA?: boolean }>;

  verify2FA: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  cancel2FA: () => void;

  register: (
    name: string,
    email: string,
    pass: string
  ) => Promise<{ success: boolean; message?: string }>;

  loginWithOAuth: (provider: 'google' | 'github') => Promise<boolean>;
changePassword: (
  currentPassword: string,
  newPassword: string
) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  uploadAvatar: (dataUrlOrFile: string | File) => Promise<string>;
  deleteAvatar: () => Promise<void>;

  enable2FA: (code: string) => Promise<boolean>;
  disable2FA: (password: string, code: string) => Promise<boolean>;
  regenerateBackupCodes: () => Promise<string[]>;

  toggleProvider: (
    provider: 'google' | 'github',
    connect: boolean
  ) => Promise<void>;

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
  role?: 'user' | 'admin' | 'tech_lead' | 'developer';
}

const LEGACY_KEYS = [
  'bugpulse_mock_current_user',
  'codepulse_access_token',
  'codepulse_refresh_token',
  'codepulse_user',
];

function clearLegacySession() {
  if (typeof window === 'undefined') return;

  LEGACY_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
}
let pendingMfaResolver: MultiFactorResolver | null = null;
function mapApiUser(apiUser: ApiUser, firebaseUser: FirebaseUser): User {
  return {
    id: String(apiUser.id),
    name:
      firebaseUser.displayName ||
      apiUser.full_name ||
      apiUser.username,
    username: apiUser.username,
    email: apiUser.email,
    avatarUrl: firebaseUser.photoURL || '',
    role:
  apiUser.role === 'admin'
    ? 'admin'
    : apiUser.role === 'tech_lead'
      ? 'tech_lead'
      : 'developer',
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

  // The API client should attach the current Firebase ID token.
  await apiClient.post('/auth/session');

  const response = await apiClient.get<ApiUser>('/auth/me');

  if (!response.data.is_active) {
    throw new Error('This account is inactive. Please contact support.');
  }

  return {
    user: mapApiUser(response.data, firebaseUser),
    token,
  };
}

function unsupportedFeature(message: string): Error {
  return new Error(message);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  twoFactorRequired: false,
  tempToken: null,
  pendingUser: null,


login: async (email: string, pass: string) => {
  set({ isLoading: true, error: null });
  pendingMfaResolver = null;

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      pass
    );

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

    return { success: true };
  } catch (err: unknown) {
    const firebaseError = err as {
      code?: string;
      message?: string;
    };

    if (firebaseError.code === 'auth/multi-factor-auth-required') {
      try {
        pendingMfaResolver = getMultiFactorResolver(
          auth,
          err as MultiFactorError
        );

        const hasTotpFactor = pendingMfaResolver.hints.some(
          (hint) =>
            hint.factorId === TotpMultiFactorGenerator.FACTOR_ID
        );

        if (!hasTotpFactor) {
          pendingMfaResolver = null;
          throw new Error(
            'No supported authenticator factor was found for this account.'
          );
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          twoFactorRequired: true,
          tempToken: null,
          pendingUser: null,
        });

        return { success: false, requires2FA: true };
      } catch (resolverError: unknown) {
        pendingMfaResolver = null;

        set({
          isLoading: false,
          twoFactorRequired: false,
          error:
            resolverError instanceof Error
              ? resolverError.message
              : 'Could not start two-factor verification.',
        });

        return { success: false };
      }
    }

    pendingMfaResolver = null;

    if (auth.currentUser) {
      await signOut(auth).catch(() => undefined);
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: firebaseError.message || 'Login failed.',
      twoFactorRequired: false,
      tempToken: null,
      pendingUser: null,
    });

    return { success: false };
  }
},



verify2FA: async (code: string, isBackupCode = false) => {
  if (isBackupCode) {
    set({
      error: 'Backup codes are not implemented yet. Enter an authenticator code.',
    });
    return false;
  }

  const resolver = pendingMfaResolver;
  const otp = code.replace(/\s/g, '');

  if (!resolver) {
    set({
      error: 'Your sign-in challenge has expired. Please sign in again.',
      twoFactorRequired: false,
    });
    return false;
  }

  if (!/^\d{6}$/.test(otp)) {
    set({ error: 'Enter the six-digit code from your authenticator app.' });
    return false;
  }

  set({ isLoading: true, error: null });

  try {
    const hint = resolver.hints.find(
      (item) =>
        item.factorId === TotpMultiFactorGenerator.FACTOR_ID
    );

    if (!hint) {
      throw new Error('No authenticator factor is available.');
    }

    const assertion = TotpMultiFactorGenerator.assertionForSignIn(
      hint.uid,
      otp
    );

    const credential = await resolver.resolveSignIn(assertion);
    pendingMfaResolver = null;

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
    const firebaseError = err as {
      code?: string;
      message?: string;
    };

    // Preserve the resolver for a retry after an invalid or expired code.
    set({
      isLoading: false,
      error:
        firebaseError.code === 'auth/invalid-verification-code' ||
        firebaseError.code === 'auth/invalid-verification-id'
          ? 'That code is incorrect or expired. Try the latest code.'
          : firebaseError.message ||
            'Two-factor verification failed.',
      twoFactorRequired: true,
    });

    return false;
  }
},


  cancel2FA: () => {pendingMfaResolver = null;
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
      const cleanName = name.trim();
      const cleanEmail = email.trim();

      if (!cleanName) {
        throw new Error('Please enter your name.');
      }

      const credential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        pass
      );

      await updateFirebaseProfile(credential.user, {
        displayName: cleanName,
      });

      await sendEmailVerification(credential.user);

      // Create/synchronize the backend user record.
      await syncWithBackend(credential.user);

      // Registration should not leave the user signed in.
      await signOut(auth);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        twoFactorRequired: false,
        tempToken: null,
        pendingUser: null,
      });

      return {
        success: true,
        message:
          'Account created successfully. Please check your email for the verification link, then sign in.',
      };
    } catch (err: unknown) {
      if (auth.currentUser) {
        await signOut(auth).catch(() => undefined);
      }

      const message =
        err instanceof Error ? err.message : 'Registration failed.';

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
        twoFactorRequired: false,
        tempToken: null,
        pendingUser: null,
      });

      return { success: false, message };
    }
  },

  loginWithOAuth: async (provider: 'google' | 'github') => {
    set({ isLoading: true, error: null });

    try {
      let credential;
      if (provider === 'github') {
        const githubProvider = new GithubAuthProvider();
        githubProvider.addScope('read:user');
        githubProvider.addScope('user:email');
        credential = await signInWithPopup(auth, githubProvider);
      } else {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({
          prompt: 'select_account',
        });
        credential = await signInWithPopup(auth, googleProvider);
      }
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
      const firebaseError = err as {
        code?: string;
        message?: string;
      };

      if (firebaseError.code === 'auth/popup-closed-by-user') {
        set({ isLoading: false, error: null });
        return false;
      }

      const message =
        firebaseError.message || 'Sign-in failed. Please try again.';

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


  changePassword: async (
    currentPassword: string,
    newPassword: string
  ) => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      set({
        error: 'Please sign in before setting or changing your password.',
        isLoading: false,
      });
      return false;
    }

    if (!firebaseUser.email) {
      set({
        error: 'Your account does not have an email address.',
        isLoading: false,
      });
      return false;
    }

    const hasPasswordProvider = firebaseUser.providerData.some(
      (provider) => provider.providerId === 'password'
    );

    if (hasPasswordProvider && !currentPassword) {
      set({
        error: 'Please enter your current password.',
        isLoading: false,
      });
      return false;
    }

    if (!newPassword) {
      set({
        error: 'Please enter a new password.',
        isLoading: false,
      });
      return false;
    }

    if (newPassword.length < 12) {
      set({
        error: 'Your password must contain at least 12 characters.',
        isLoading: false,
      });
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      set({
        error: 'Include at least one uppercase letter.',
        isLoading: false,
      });
      return false;
    }

    if (!/[0-9]/.test(newPassword)) {
      set({
        error: 'Include at least one number.',
        isLoading: false,
      });
      return false;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      set({
        error: 'Include at least one special character.',
        isLoading: false,
      });
      return false;
    }

    if (hasPasswordProvider && currentPassword === newPassword) {
      set({
        error: 'Your new password must differ from your current password.',
        isLoading: false,
      });
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      if (hasPasswordProvider) {
        // Existing email/password account: verify the current password.
        const credential = EmailAuthProvider.credential(
          firebaseUser.email,
          currentPassword
        );

        await reauthenticateWithCredential(firebaseUser, credential);
        await updateFirebasePassword(firebaseUser, newPassword);
      } else {
        // OAuth account without a password: link email/password
        // to the SAME Firebase user instead of creating another account.
        const credential = EmailAuthProvider.credential(
          firebaseUser.email,
          newPassword
        );

        await linkWithCredential(firebaseUser, credential);
      }

      const token = await firebaseUser.getIdToken(true);

      set({
        accessToken: token,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };

      let message = 'Could not save your password. Please try again.';

      switch (firebaseError.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/invalid-login-credentials':
          message = 'Your current password is incorrect.';
          break;

        case 'auth/email-already-in-use':
        case 'auth/credential-already-in-use':
          message =
            'This email/password credential is already associated with another account. Sign in to the existing account or resolve the account conflict first.';
          break;

        case 'auth/weak-password':
          message = 'Your new password is too weak.';
          break;

        case 'auth/requires-recent-login':
          message =
            'For security, please sign in again with your Google, GitHub, or email account, then retry.';
          break;

        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later.';
          break;

        case 'auth/provider-already-linked':
          message =
            'This account already has an email/password sign-in method. Refresh your session and try changing the password instead.';
          break;
      }

      set({ error: message, isLoading: false });
      return false;
    }
  },


  updateProfile: async (updates: Partial<User>) => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      const message = 'Please sign in before updating your profile.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }

    const unsupportedFields = Object.keys(updates).filter(
      (key) => key !== 'name'
    );

    if (unsupportedFields.length > 0) {
      const message =
        'Only profile-name updates are currently supported.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }

    set({ isLoading: true, error: null });

    try {
      if (typeof updates.name === 'string') {
        const cleanName = updates.name.trim();

        if (!cleanName) {
          throw new Error('Your name cannot be empty.');
        }

        await updateFirebaseProfile(firebaseUser, {
          displayName: cleanName,
        });
      }

      const currentUser = get().user;

      if (!currentUser) {
        throw new Error('Your application profile could not be loaded.');
      }

      const updatedUser: User = {
        ...currentUser,
        name: firebaseUser.displayName || currentUser.name,
      };

      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });

      return updatedUser;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile.';

      set({ error: message, isLoading: false });
      throw err;
    }
  },

  uploadAvatar: async () => {
    const message =
      'Avatar uploads are not configured yet. No image was uploaded.';

    set({ error: message, isLoading: false });
    throw unsupportedFeature(message);
  },

  deleteAvatar: async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      const message = 'Please sign in first.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }

    set({ isLoading: true, error: null });

    try {
      await updateFirebaseProfile(firebaseUser, {
        photoURL: null,
      });

      const currentUser = get().user;

      if (currentUser) {
        set({
          user: { ...currentUser, avatarUrl: '' },
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false, error: null });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove avatar.';

      set({ error: message, isLoading: false });
      throw err;
    }
  },

  enable2FA: async () => {
    const message =
      'Two-factor authentication setup is not available yet.';

    set({ error: message, isLoading: false });
    return false;
  },

  disable2FA: async () => {
    const message =
      'Two-factor authentication management is not available yet.';

    set({ error: message, isLoading: false });
    return false;
  },

  regenerateBackupCodes: async () => {
    const message = 'Backup codes are not configured yet.';

    set({ error: message, isLoading: false });
    throw unsupportedFeature(message);
  },

  toggleProvider: async () => {
    const message =
      'Linked-account management is not configured yet.';

    set({ error: message, isLoading: false });
    throw unsupportedFeature(message);
  },

  deleteAccount: async () => {
    const message =
      'Account deletion is not available yet. Your account has not been deleted.';

    set({ error: message, isLoading: false });
    throw unsupportedFeature(message);
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
}));

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

    // Ignore stale requests after sign-out or account switching.
    if (auth.currentUser?.uid !== firebaseUser.uid) {
      return;
    }

    useAuthStore.setState({
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
  } catch (err: unknown) {
    if (auth.currentUser?.uid !== firebaseUser.uid) {
      return;
    }

    console.error('Failed to restore authentication session:', err);

    await signOut(auth).catch(() => undefined);

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
