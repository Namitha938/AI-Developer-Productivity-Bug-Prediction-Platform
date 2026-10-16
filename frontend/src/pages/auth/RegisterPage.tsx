import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../../stores/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { OAuthButtons } from '../../components/auth/OAuthButtons';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import {
  User,
  Mail,
  Loader2,
  AlertCircle,
  MailCheck,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters.'),
    email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Must include an uppercase letter.')
      .regex(/[a-z]/, 'Must include a lowercase letter.')
      .regex(/[0-9]/, 'Must include a number.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service & Privacy Policy.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const passwordVal = watch('password');

  // 60-second cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    const result = await registerUser(data.name, data.email, data.password);
    if (result.success) {
      setRegisteredEmail(data.email);
      setResendCooldown(60);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendNotice('Verification email resent! Please check your spam folder if delayed.');
    setResendCooldown(60);
    setTimeout(() => setResendNotice(null), 5000);
  };

  return (
    <AuthLayout
      title={registeredEmail ? 'Check your email' : 'Create an account'}
      subtitle={
        registeredEmail
          ? `We've sent a verification link to ${registeredEmail}`
          : 'Start scanning repositories and predicting defects in seconds'
      }
    >
      {/* Post-Registration Email Verification Screen */}
      {registeredEmail ? (
        <div className="space-y-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/10">
            <MailCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Verify your email address
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click the link inside the confirmation email sent to{' '}
              <strong className="text-slate-800 dark:text-slate-200">{registeredEmail}</strong> to
              activate your developer workspace.
            </p>
          </div>

          {resendNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{resendNotice}</span>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend verification email'}
              </span>
            </button>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              <span>Back to sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Sign Up Form */
        <div className="space-y-5">
          {/* OAuth Buttons */}
          <OAuthButtons />

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-xs font-mono text-slate-400 uppercase tracking-wider absolute">
              or with email
            </span>
          </div>

          {error && (
            <div
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5 animate-in fade-in duration-200"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Sarah Connor"
                  className={`w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                    errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Work email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="sarah.c@codepulse.ai"
                  className={`w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                    errors.email ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <PasswordInput
                {...register('password')}
                error={errors.password?.message}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <PasswordStrength password={passwordVal} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm password
              </label>
              <PasswordInput
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  {...register('agreeTerms')}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I agree to the{' '}
                  <span className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Terms of Service
                  </span>{' '}
                  and acknowledge the{' '}
                  <span className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create developer account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
