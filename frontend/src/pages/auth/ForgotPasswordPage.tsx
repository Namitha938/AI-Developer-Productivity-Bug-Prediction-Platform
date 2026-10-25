import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Loader2 } from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 42;

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!submitted || resendCooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCooldown((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [submitted, resendCooldown]);

  const sendRecoveryEmail = async (): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await sendRecoveryEmail();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;

      // Keep the response generic to avoid revealing whether an account exists.
      if (
        code !== 'auth/user-not-found' &&
        code !== 'auth/invalid-email' &&
        code !== 'auth/invalid-credential'
      ) {
        setError(
          code === 'auth/too-many-requests'
            ? 'Too many requests. Please wait a while before trying again.'
            : 'We could not process the request right now. Please try again later.'
        );
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSubmitted(true);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError(null);
    setNotice(null);

    try {
      await sendRecoveryEmail();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;

      if (
        code !== 'auth/user-not-found' &&
        code !== 'auth/invalid-email' &&
        code !== 'auth/invalid-credential'
      ) {
        setError(
          code === 'auth/too-many-requests'
            ? 'Too many requests. Please wait before trying again.'
            : 'We could not resend the email. Please try again later.'
        );
        setResending(false);
        return;
      }
    }

    setNotice('If an account exists for this email, a reset link will be sent.');
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setResending(false);
  };

  const maskedEmail = (() => {
    const [localPart, domain] = email.trim().split('@');
    if (!localPart || !domain) return '';
    return `${localPart.charAt(0)}•••@${domain}`;
  })();

  if (submitted) {
    return (
      <AuthLayout
        category="RECOVERY REQUESTED"
        title="Check your inbox"
        subtitle={`If an account exists for ${maskedEmail}, you will receive a password reset link shortly.`}
        topLinkText="Back to sign in"
        topLinkLabel="Return to sign in"
        topLinkTo="/login"
      >
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Recovery email
            </label>
            <div className="px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white">
              <span className="font-mono text-xs">{maskedEmail}</span>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-300"
            >
              {error}
            </div>
          )}

          {notice && (
            <p role="status" className="text-xs text-center text-slate-500 dark:text-slate-400">
              {notice}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResend}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {resending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{resending ? 'Sending…' : 'Resend recovery email'}</span>
            </button>

            {resendCooldown > 0 && (
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Available in 00:{String(resendCooldown).padStart(2, '0')}
              </p>
            )}
          </div>

          <div className="pt-2 text-xs text-center space-y-3 text-slate-500 dark:text-slate-400">
            <div>
              Use a different email address?{' '}
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setResendCooldown(0);
                  setError(null);
                  setNotice(null);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Change recovery email
              </button>
            </div>

            <Link
              to="/login"
              className="text-slate-600 dark:text-slate-300 hover:underline inline-flex items-center gap-1 font-medium"
            >
              Return to sign in →
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      category="PASSWORD RECOVERY"
      title="Forgot your password?"
      subtitle="Enter the email connected to your account and we'll send a secure reset link."
      topLinkText="New here?"
      topLinkLabel="Create an account"
      topLinkTo="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="recovery-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Email address
          </label>
          <input
            id="recovery-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{loading ? 'Sending reset link…' : 'Send reset link'}</span>
        </button>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
          For privacy, we'll show the same confirmation whether or not an account exists. Check your spam folder if the email doesn't arrive.
        </p>

        <div className="pt-2 text-center text-xs">
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
