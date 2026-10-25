import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { OAuthButtons } from '../../components/auth/OAuthButtons';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { OtpInput } from '../../components/auth/OtpInput';
import {
  Mail,
  Loader2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationMessage = (
    location.state as {
      registrationSuccess?: boolean;
      message?: string;
      email?: string;
    } | null
  )?.message;

  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const { login, verify2FA, cancel2FA, twoFactorRequired, pendingUser, error, clearError, isLoading } =
    useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handle2FASubmit = async (codeToSubmit?: string) => {
    setTwoFactorError(null);
    const code = useBackupCode ? backupCodeInput.trim() : (codeToSubmit || otpCode);

    if (!code) {
      setTwoFactorError(useBackupCode ? 'Please enter your backup code.' : 'Please enter 6 digits.');
      return;
    }

    const success = await verify2FA(code, useBackupCode);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setTwoFactorError('Invalid code. Please try again.');
    }
  };

  return (
    <AuthLayout
      category={twoFactorRequired ? 'SECURITY VERIFICATION' : undefined}
      title={twoFactorRequired ? 'Two-Factor Authentication' : 'Welcome back'}
      subtitle={
        twoFactorRequired
          ? `Enter the verification code for ${pendingUser?.email || 'your account'}`
          : 'Sign in to access your developer dashboard'
      }
      topLinkText="New to Tracepoint?"
      topLinkLabel="Create an account"
      topLinkTo="/register"
    >
      {twoFactorRequired ? (
        <div className="space-y-6">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-300">
            <KeyRound className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>This account requires two-factor authentication to complete sign-in.</span>
          </div>

          {(twoFactorError || error) && (
            <div
              className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{twoFactorError || error}</span>
            </div>
          )}

          {!useBackupCode ? (
            <div className="space-y-4">
              <div className="text-center text-xs text-slate-500">
                Enter the 6-digit code from your authenticator app:
              </div>
              <div className="py-2">
                <OtpInput
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={(val) => handle2FASubmit(val)}
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Emergency 8-character Backup Code
              </label>
              <input
                type="text"
                value={backupCodeInput}
                onChange={(e) => setBackupCodeInput(e.target.value)}
                placeholder="e.g. A1B2-C3D4"
                className="w-full px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handle2FASubmit()}
              disabled={isLoading || (!useBackupCode && otpCode.length !== 6)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Verify & Continue</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setUseBackupCode(!useBackupCode)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {useBackupCode ? 'Use 6-digit authenticator code' : 'Use a backup code instead'}
              </button>

              <button
                type="button"
                onClick={cancel2FA}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {registrationMessage && (
            <div
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              {registrationMessage}
            </div>
          )}

          {/* OAuth Buttons */}
          <OAuthButtons onSuccess={() => navigate(from, { replace: true })} />

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-[#F8FAFC] dark:bg-[#070A13] px-3 text-xs font-mono text-slate-400 uppercase tracking-wider absolute">
              or with email
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Work email address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your email id"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
