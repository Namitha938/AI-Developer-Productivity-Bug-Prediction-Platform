
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { auth } from '../../config/firebase';
import {
  CheckCircle2,
  Shield,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  useEffect(() => {
    let cancelled = false;

    const validateCode = async () => {
      if (!oobCode) {
        setError(
          'The reset link is missing its security code. Request a new password-reset email.'
        );
        setValidatingCode(false);
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);

        if (!cancelled) {
          setCodeValid(true);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setCodeValid(false);
          setError(
            'This password-reset link is invalid or has expired. Please request a new one.'
          );
        }
      } finally {
        if (!cancelled) {
          setValidatingCode(false);
        }
      }
    };

    void validateCode();

    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oobCode || !codeValid) {
      setError('Your reset link is invalid or expired. Request a new one.');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) {
      setError(
        'Use at least 12 characters, including an uppercase letter, a number, and a special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setIsSuccess(true);

      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };

      if (
        firebaseError.code === 'auth/expired-action-code' ||
        firebaseError.code === 'auth/invalid-action-code'
      ) {
        setCodeValid(false);
        setError(
          'This reset link has expired or has already been used. Please request a new one.'
        );
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Firebase rejected this password as too weak. Choose a stronger password.');
      } else {
        setError(
          firebaseError.message || 'Unable to reset your password. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel =
    password.length === 0
      ? 'Enter a password to assess strength'
      : strengthScore <= 2
        ? 'Weak'
        : strengthScore === 3
          ? 'Medium'
          : 'Strong';

  return (
    <AuthLayout
      category="PASSWORD RECOVERY"
      title="Set a new password"
      subtitle="Create a secure password for your BugPulse workspace."
      topLinkText="Back to sign in"
      topLinkLabel="Return to sign in"
      topLinkTo="/login"
    >
      {validatingCode ? (
        <div className="space-y-3 py-8 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">
            Validating your password-reset link...
          </p>
        </div>
      ) : isSuccess ? (
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Password updated successfully
          </h3>
          <p className="text-xs text-slate-500">
            Your password has been changed. Redirecting you to sign in...
          </p>
        </div>
      ) : !codeValid ? (
        <div className="space-y-4 py-4 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              New password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Confirm password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">
                Password strength
              </span>
              <span className="text-[11px] text-slate-400">
                {strengthLabel}
              </span>
            </div>

            <div className="grid h-1.5 grid-cols-4 gap-1.5 pt-0.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-colors ${
                    strengthScore >= step
                      ? strengthScore >= 4
                        ? 'bg-emerald-500'
                        : strengthScore >= 3
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
            <span className="block text-[11px] font-medium text-slate-500">
              Requirements
            </span>

            <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-600 dark:text-slate-400 sm:grid-cols-2">
              {[
                { label: 'At least 12 characters', valid: hasMinLength },
                { label: 'One uppercase letter', valid: hasUppercase },
                { label: 'One number', valid: hasNumber },
                { label: 'One special character', valid: hasSpecial },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                      item.valid
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {item.valid && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !codeValid}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Reset password</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            <span>Secure password reset powered by Firebase</span>
          </div>

          <p className="pt-1 text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
            Use a unique password for your BugPulse account.
          </p>
        </form>
      )}
    </AuthLayout>
  );
};
