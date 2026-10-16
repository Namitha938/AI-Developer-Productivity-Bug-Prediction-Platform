import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { mockAuthApi } from '../../api/mock/mockAuthApi';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Mail } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('No verification token provided. Please check the link in your email.');
      return;
    }

    mockAuthApi
      .verifyEmail(token)
      .then(() => {
        setSuccess(true);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'The verification link has expired or is invalid.');
        setLoading(false);
      });
  }, [token]);

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Confirming your developer account credentials"
    >
      <div className="space-y-6 text-center py-2">
        {loading && (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Verifying your email...
            </h3>
            <p className="text-xs text-slate-500">
              Please wait while we activate your security credentials.
            </p>
          </div>
        )}

        {!loading && success && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Email Verified Successfully!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your workspace is active. You can now access code inspections and risk analytics.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <span>Go to dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verification Link Expired
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {error}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <span>Back to login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
