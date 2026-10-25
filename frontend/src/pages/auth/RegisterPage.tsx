import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { OAuthButtons } from '../../components/auth/OAuthButtons';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { Loader2, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const hasMinLength = password.length >= 12;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!agreeTerms) {
      setFormError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    const res = await registerUser(name, email, password);
    if (res.success) {
      navigate('/login', {
        state: {
          registrationSuccess: true,
          message: res.message || 'Account created successfully! Please sign in.',
          email,
        },
      });
    }
  };

  return (
    <AuthLayout
      title="Create your account."
      subtitle="Your code. A clearer picture. No credit card needed."
      topLinkText="Already have an account?"
      topLinkLabel="Sign in"
      topLinkTo="/login"
    >
      <div className="space-y-5">
        {/* OAuth Buttons */}
        <OAuthButtons onSuccess={() => navigate('/dashboard')} />

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-[#F8FAFC] dark:bg-[#070A13] px-3 text-xs font-mono text-slate-400 uppercase tracking-wider absolute">
            or with email
          </span>
        </div>

        {(error || formError) && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-300">
            {formError || error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Work email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email id"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Workspace name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Company name"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
            {/* Strength indicator line */}
            <div className="pt-1.5 space-y-1">
              <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    hasMinLength && hasNumber && hasSpecial
                      ? 'w-full bg-emerald-500'
                      : password.length > 6
                      ? 'w-2/3 bg-blue-500'
                      : 'w-1/3 bg-amber-500'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Strong · 12+ characters, number & special character
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <label htmlFor="agreeTerms" className="text-xs text-slate-600 dark:text-slate-400">
              I agree to the Terms of Service and Privacy Policy.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create account →</span>
          </button>
        </form>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center pt-2">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Passwords are encrypted. Code is never used to train models.</span>
        </div>
      </div>
    </AuthLayout>
  );
};
