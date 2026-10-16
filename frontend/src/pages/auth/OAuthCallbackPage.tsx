import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { useAuthStore } from '../../stores/authStore';
import { Loader2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const errorParam = searchParams.get('error');
  const provider = (searchParams.get('provider') as 'google' | 'github') || 'github';

  useEffect(() => {
    if (errorParam === 'email_exists') {
      setError(
        'This email is already registered with a password. Sign in with email, then link GitHub in Settings.'
      );
      setLoading(false);
      return;
    }

    if (errorParam) {
      setError('Third-party authentication failed or was cancelled. Please try again.');
      setLoading(false);
      return;
    }

    // Process authentication
    loginWithOAuth(provider)
      .then((ok) => {
        if (ok) {
          navigate('/dashboard');
        } else {
          setError(
            'This email is already registered with a password. Sign in with email, then link GitHub in Settings.'
          );
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Authentication callback failed.');
        setLoading(false);
      });
  }, [errorParam, provider]);

  return (
    <AuthLayout
      title="Authenticating..."
      subtitle="Finalizing OAuth single sign-on with your account"
    >
      <div className="space-y-6 text-center py-4">
        {loading && (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Connecting provider session...
            </h3>
            <p className="text-xs text-slate-500">
              Verifying cryptographic OAuth signatures.
            </p>
          </div>
        )}

        {error && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account Link Required
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                {error}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <span>Sign in with email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
