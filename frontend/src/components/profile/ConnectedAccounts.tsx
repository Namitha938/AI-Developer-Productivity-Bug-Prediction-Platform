import React, { useState } from 'react';
import { ConnectedAccount } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { Github, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ConnectedAccountsProps {
  accounts?: ConnectedAccount[];
}

export const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({ accounts = [] }) => {
  const { toggleProvider, user } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isGoogleConnected = accounts.some((a) => a.provider === 'google' && a.connected);
  const isGitHubConnected = accounts.some((a) => a.provider === 'github' && a.connected);

  const handleToggle = async (provider: 'google' | 'github', currentStatus: boolean) => {
    setError(null);
    setSuccessMsg(null);
    setLoadingProvider(provider);

    try {
      await toggleProvider(provider, !currentStatus);
      setSuccessMsg(
        !currentStatus
          ? `Successfully connected ${provider === 'google' ? 'Google' : 'GitHub'} account.`
          : `Disconnected ${provider === 'google' ? 'Google' : 'GitHub'} account.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update linked account.';
      setError(msg);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Connected Accounts</h4>
        <p className="text-xs text-slate-500">
          Manage third-party authentication providers linked to your developer profile.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Google Row */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Google</div>
              <div className="text-[11px] text-slate-500">
                {isGoogleConnected ? 'Connected with OAuth 2.0' : 'Not linked'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                isGoogleConnected
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isGoogleConnected ? 'Connected' : 'Not connected'}
            </span>

            <button
              type="button"
              disabled={loadingProvider === 'google'}
              onClick={() => handleToggle('google', isGoogleConnected)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isGoogleConnected
                  ? 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {loadingProvider === 'google' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isGoogleConnected ? (
                'Disconnect'
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </div>

        {/* GitHub Row */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
              <Github className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">GitHub</div>
              <div className="text-[11px] text-slate-500">
                {isGitHubConnected ? 'Connected with repo scan permissions' : 'Not linked'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                isGitHubConnected
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isGitHubConnected ? 'Connected' : 'Not connected'}
            </span>

            <button
              type="button"
              disabled={loadingProvider === 'github'}
              onClick={() => handleToggle('github', isGitHubConnected)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isGitHubConnected
                  ? 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {loadingProvider === 'github' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isGitHubConnected ? (
                'Disconnect'
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
