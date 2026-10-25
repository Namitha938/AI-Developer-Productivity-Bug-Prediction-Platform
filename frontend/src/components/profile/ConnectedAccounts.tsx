
import React, { useEffect, useState } from 'react';
import {
  Github,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link2,
} from 'lucide-react';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  linkWithPopup,
  unlink,
  onAuthStateChanged,
  reload,
  type User,
} from 'firebase/auth';
import { auth } from '../../config/firebase';

type ProviderName = 'google' | 'github';

interface ConnectedAccountsProps {
  // Kept for compatibility with existing callers.
  accounts?: { provider: string; connected: boolean }[];
}

const PROVIDER_IDS: Record<ProviderName, string> = {
  google: 'google.com',
  github: 'github.com',
};

function getProviderName(providerId: string): string {
  if (providerId === 'google.com') return 'Google';
  if (providerId === 'github.com') return 'GitHub';
  if (providerId === 'password') return 'Email and password';
  return providerId;
}

function getErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';

  const messages: Record<string, string> = {
    'auth/provider-already-linked':
      'This provider is already linked to your account.',
    'auth/credential-already-in-use':
      'This Google or GitHub account is linked to another BugPulse account.',
    'auth/email-already-in-use':
      'This email is already associated with another account.',
    'auth/popup-closed-by-user':
      'The sign-in popup was closed before authorization finished.',
    'auth/popup-blocked':
      'Your browser blocked the popup. Allow popups for this site and try again.',
    'auth/cancelled-popup-request':
      'Another authorization popup is already open.',
    'auth/operation-not-allowed':
      'This provider is not enabled in Firebase Authentication.',
    'auth/unauthorized-domain':
      'This website domain is not authorized in Firebase Authentication.',
    'auth/operation-not-supported-in-this-environment':
      'Popup authentication is unavailable in this browser environment.',
    'auth/too-many-requests':
      'Too many attempts. Wait a little and try again.',
    'auth/requires-recent-login':
      'Please sign in again before disconnecting this provider.',
    'auth/no-current-user':
      'You are not signed in. Sign in and try again.',
  };

  if (messages[code]) return messages[code];

  return error instanceof Error
    ? error.message
    : 'The account operation failed. Please try again.';
}

export const ConnectedAccounts: React.FC<ConnectedAccountsProps> = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(
    auth.currentUser,
  );
  const [loadingProvider, setLoadingProvider] =
    useState<ProviderName | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setFirebaseUser(user);
        setInitialLoading(false);
      },
      (authError) => {
        setError(authError.message);
        setInitialLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const isConnected = (provider: ProviderName) =>
    Boolean(
      firebaseUser?.providerData.some(
        (item) => item.providerId === PROVIDER_IDS[provider],
      ),
    );

  const handleToggle = async (provider: ProviderName) => {
    setError(null);
    setSuccessMsg(null);

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('You are not signed in. Sign in again and retry.');
      return;
    }

    setLoadingProvider(provider);

    try {
      const providerInstance =
        provider === 'google'
          ? new GoogleAuthProvider()
          : new GithubAuthProvider();

      if (provider === 'github') {
        providerInstance.addScope('read:user');
        providerInstance.addScope('user:email');
      }

      if (isConnected(provider)) {
        // Do not remove the user's final sign-in method.
        if (currentUser.providerData.length <= 1) {
          throw new Error(
            'You cannot disconnect your only sign-in provider. Link another provider first.',
          );
        }

        await unlink(currentUser, PROVIDER_IDS[provider]);
        await reload(currentUser);

        setFirebaseUser(auth.currentUser);
        setSuccessMsg(
          `${getProviderName(PROVIDER_IDS[provider])} disconnected successfully.`,
        );
      } else {
        await linkWithPopup(currentUser, providerInstance);
        await reload(currentUser);

        // Read the refreshed user from Firebase instead of relying on
        // stale component props or placeholder account data.
        setFirebaseUser(auth.currentUser);
        setSuccessMsg(
          `${getProviderName(PROVIDER_IDS[provider])} linked successfully.`,
        );
      }
    } catch (operationError: unknown) {
      setError(getErrorMessage(operationError));

      // Refresh status without clearing the displayed error.
      const latestUser = auth.currentUser;
      if (latestUser) {
        try {
          await reload(latestUser);
          setFirebaseUser(auth.currentUser);
        } catch {
          // Preserve the original operation error.
        }
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading connected accounts...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
        You need to sign in before managing connected accounts.
      </div>
    );
  }

  const providers = firebaseUser.providerData;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Connected Accounts
        </h4>
        <p className="text-xs text-slate-500">
          Manage the sign-in providers linked to your BugPulse account.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-3">
        {(['google', 'github'] as const).map((provider) => {
          const connected = isConnected(provider);
          const busy = loadingProvider === provider;
          const label = provider === 'google' ? 'Google' : 'GitHub';

          const linkedProvider = providers.find(
            (item) => item.providerId === PROVIDER_IDS[provider],
          );

          return (
            <div
              key={provider}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                  {provider === 'github' ? (
                    <Github className="h-4 w-4 text-slate-900 dark:text-white" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {label}
                  </div>
                  <div className="truncate text-[11px] text-slate-500">
                    {connected
                      ? linkedProvider?.email ||
                        linkedProvider?.displayName ||
                        'Linked to your account'
                      : 'Not linked'}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                    connected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {connected ? 'Connected' : 'Not connected'}
                </span>

                <button
                  type="button"
                  disabled={loadingProvider !== null}
                  onClick={() => void handleToggle(provider)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    connected
                      ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {busy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : connected ? (
                    'Disconnect'
                  ) : (
                    <>
                      <Link2 className="mr-1 inline h-3 w-3" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">
        Linking a provider enables it as a sign-in method for this account.
        GitHub repository scanning requires a separate repository authorization
        integration; linking GitHub here does not grant repository access.
      </p>
    </div>
  );
};
