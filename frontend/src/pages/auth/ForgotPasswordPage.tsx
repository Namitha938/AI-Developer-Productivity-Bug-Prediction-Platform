import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { mockAuthApi } from '../../api/mock/mockAuthApi';
import { Mail, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(42);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (submitted && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [submitted, resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid work email address.');
      return;
    }

    setLoading(true);
    try {
      await mockAuthApi.forgotPassword(email);
    } catch {
      // In recovery flows, always show confirmation for security
    } finally {
      setLoading(false);
      setSubmitted(true);
      setResendCooldown(42);
    }
  };

  const maskedEmail = (() => {
    if (!email.includes('@')) return 'm•••@acme.dev';
    const [user, domain] = email.split('@');
    return `${user.charAt(0)}•••@${domain}`;
  })();

  if (submitted) {
    return (
      <AuthLayout
        category="RECOVERY REQUESTED"
        title="Check your inbox"
        subtitle={`If an account exists for ${maskedEmail}, you will receive a reset link shortly.`}
        topLinkText="Back to sign in"
        topLinkLabel="Return to sign in"
        topLinkTo="/login"
      >
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Requested email
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white">
              <span className="font-mono text-xs">{maskedEmail}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Sample
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={() => setResendCooldown(42)}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-75 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Resend recovery email</span>
            </button>

            {resendCooldown > 0 && (
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Available in 00:{resendCooldown < 10 ? `0${resendCooldown}` : resendCooldown}</span>
              </p>
            )}
          </div>

          {/* Development Shortcut to Password Reset */}
          <div className="p-3.5 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
            <span>Ready to set new password?</span>
            <Link
              to="/reset-password?token=mock-valid-reset-token-99"
              className="font-medium underline hover:text-blue-800 dark:hover:text-blue-200"
            >
              Set new password →
            </Link>
          </div>

          <div className="pt-2 text-xs text-center space-y-3 text-slate-500 dark:text-slate-400">
            <div>
              Use a different email address?{' '}
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
              >
                Change recovery email
              </button>
            </div>

            <div>
              <Link
                to="/login"
                className="text-slate-600 dark:text-slate-300 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>Return to sign in</span>
                <span className="text-blue-600 dark:text-blue-400">Back to sign in →</span>
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      category="PASSWORD RECOVERY"
      title="Forgot your password?"
      subtitle="Enter the work email connected to your Tracepoint account and we'll send a secure reset link."
      topLinkText="New to Tracepoint?"
      topLinkLabel="Create an account"
      topLinkTo="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="recovery-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Work email
          </label>
          <div className="relative">
            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maya@acme.dev"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Send reset link</span>
        </button>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
          We'll only send a reset link if we find a matching account. If you don't receive an email, try checking your spam folder or contact your team admin.
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
