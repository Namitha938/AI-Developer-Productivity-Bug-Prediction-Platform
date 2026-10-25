
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { auth } from '../../config/firebase';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Firebase email verification links use "oobCode", not "token".
  const oobCode = searchParams.get('oobCode');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const verifyEmail = async () => {
      if (!oobCode) {
        setError(
          'The verification link is missing its security code. Please open the verification link from your email.'
        );
        setLoading(false);
        return;
      }

      try {
        await applyActionCode(auth, oobCode);

        if (!cancelled) {
          setSuccess(true);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        const firebaseError = err as { code?: string };

        if (
          firebaseError.code === 'auth/expired-action-code' ||
          firebaseError.code === 'auth/invalid-action-code'
        ) {
          setError(
            'This verification link has expired or has already been used. Please request a new verification email.'
          );
        } else if (
          firebaseError.code === 'auth/invalid-continue-uri' ||
          firebaseError.code === 'auth/unauthorized-continue-uri'
        ) {
          setError(
            'The verification link configuration is invalid. Please contact the application administrator.'
          );
        } else {
          setError(
            'We could not verify your email right now. Please try again using the link in your verification email.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Confirming your developer account credentials"
    >
      <div className="space-y-6 py-2 text-center">
        {loading && (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Verifying your email...
            </h3>
            <p className="text-xs text-slate-500">
              Please wait while Firebase confirms your email address.
            </p>
          </div>
        )}

        {!loading && success && (
          <div className="animate-in space-y-4 fade-in duration-300">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Email Verified Successfully!
              </h3>
              <p className="mx-auto max-w-xs text-xs text-slate-500">
                Firebase has verified your email address. You can now sign in
                and access your workspace.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <span>Continue to sign in</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="animate-in space-y-4 fade-in duration-300">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Email Verification Failed
              </h3>
              <p className="mx-auto max-w-xs text-xs text-slate-500">
                {error}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Back to login
              </Link>

              <Link
                to="/forgot-password"
                className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Account help
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
