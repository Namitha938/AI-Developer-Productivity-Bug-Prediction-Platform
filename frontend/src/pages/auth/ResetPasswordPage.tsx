import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { mockAuthApi } from '../../api/mock/mockAuthApi';
import { CheckCircle2, Shield, Loader2, Check } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must meet complexity requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await mockAuthApi.resetPassword({ token: 'mock-token', password });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      category="PASSWORD RECOVERY"
      title="Set a new password"
      subtitle="Create a secure password for your Tracepoint workspace."
      topLinkText="Back to sign in"
      topLinkLabel="Return to sign in"
      topLinkTo="/login"
    >
      {isSuccess ? (
        <div className="space-y-4 text-center py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Password updated successfully
          </h3>
          <p className="text-xs text-slate-500">
            Redirecting you to the sign in page...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-300">
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

          {/* Password strength */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Password strength</span>
              <span className="text-[11px] text-slate-400">
                {password.length === 0
                  ? 'Enter a password to assess strength'
                  : strengthScore <= 2
                  ? 'Weak'
                  : strengthScore === 3
                  ? 'Medium'
                  : 'Strong'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 pt-0.5">
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

          {/* Requirements Checklist */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-slate-500 font-medium block text-[11px]">Requirements</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasMinLength ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                  {hasMinLength && <Check className="w-2.5 h-2.5" />}
                </div>
                <span>At least 12 characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasUppercase ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                  {hasUppercase && <Check className="w-2.5 h-2.5" />}
                </div>
                <span>One uppercase letter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasNumber ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                  {hasNumber && <Check className="w-2.5 h-2.5" />}
                </div>
                <span>One number</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasSpecial ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                  {hasSpecial && <Check className="w-2.5 h-2.5" />}
                </div>
                <span>One special character</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Reset password</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center pt-1">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Secure password reset · Use a unique password for your Tracepoint workspace</span>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed pt-1">
            By continuing, you agree to our Terms of Service and Privacy Policy. Your code stays yours.
          </p>
        </form>
      )}
    </AuthLayout>
  );
};
