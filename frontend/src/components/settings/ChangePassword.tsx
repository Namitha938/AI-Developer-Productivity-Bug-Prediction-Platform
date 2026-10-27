import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { auth } from '../../config/firebase';
import { useAuthStore } from '../../stores/authStore';

interface ChangePasswordProps {
  onSuccess?: () => void;
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
};

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {label}
    </label>

    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        placeholder={`Enter ${label.toLowerCase()}`}
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  </div>
);

export const ChangePassword: React.FC<ChangePasswordProps> = ({
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showFields, setShowFields] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const changePassword = useAuthStore((state) => state.changePassword);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const user = auth.currentUser;

  const supportsPasswordChange = Boolean(
    user?.providerData.some((provider) => provider.providerId === 'password')
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);
    clearError();

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('Your session has expired. Please sign in again.');
      return;
    }

    if (
      !currentUser.providerData.some(
        (provider) => provider.providerId === 'password'
      )
    ) {
      setError(
        'This account does not have an email/password login. Use your connected sign-in provider instead.'
      );
      return;
    }

    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }

    if (newPassword.length < 12) {
      setError('Your new password must contain at least 12 characters.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Include at least one uppercase letter.');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Include at least one number.');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Include at least one special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Your new passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Your new password must differ from your current password.');
      return;
    }

    setLoading(true);

    try {
      const changed = await changePassword('', newPassword);

      if (!changed) {
        setError(
          useAuthStore.getState().error ||
            'Unable to change your password. Please try again.'
        );
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setShowFields({
        current: false,
        next: false,
        confirm: false,
      });

      setSuccess('Your password has been changed successfully.');
      onSuccess?.();
    } catch {
      setError(
        useAuthStore.getState().error ||
          'Unable to change your password right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Sign in to manage your password.
        </p>
      </section>
    );
  }

  if (!supportsPasswordChange) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-blue-500" size={21} />

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Password management
            </h3>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Your account currently uses an external sign-in provider. There
              is no password managed by BugPulse AI to change here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          <KeyRound size={21} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Change password
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Verify your current password before setting a new one.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || (!success && storeError)) && (
          <div
            role="alert"
            className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error || storeError}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <PasswordField
          id="current-password"
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showFields.current}
          onToggle={() =>
            setShowFields((previous) => ({
              ...previous,
              current: !previous.current,
            }))
          }
          autoComplete="current-password"
        />

        <PasswordField
          id="new-password"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          show={showFields.next}
          onToggle={() =>
            setShowFields((previous) => ({
              ...previous,
              next: !previous.next,
            }))
          }
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm-new-password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showFields.confirm}
          onToggle={() =>
            setShowFields((previous) => ({
              ...previous,
              confirm: !previous.confirm,
            }))
          }
          autoComplete="new-password"
        />

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          Use at least 12 characters, one uppercase letter, one number, and
          one special character.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading && <Loader2 size={17} className="animate-spin" />}
          {loading ? 'Updating password...' : 'Update password'}
        </button>
      </form>
    </section>
  );
};