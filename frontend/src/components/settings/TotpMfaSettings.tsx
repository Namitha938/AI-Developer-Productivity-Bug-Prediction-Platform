
import React, { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  multiFactor,
  TotpMultiFactorGenerator,
  type TotpSecret,
} from 'firebase/auth';
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { auth } from '../../config/firebase';

const cardClass =
  'rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#0c1322] space-y-4';

const mutedTextClass = 'text-xs text-slate-500 dark:text-slate-400';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white';

const getErrorMessage = (error: unknown): string => {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'TOTP MFA is not enabled for this Firebase project yet. Enable it in Firebase Console and try again.';
    case 'auth/unsupported-first-factor':
      return 'Your current sign-in method cannot be used to enroll TOTP MFA in this configuration.';
    case 'auth/invalid-verification-code':
      return 'That code is invalid or expired. Enter the latest six-digit code from your authenticator app.';
    case 'auth/code-expired':
      return 'That verification code has expired. Enter the latest code from your authenticator app.';
    case 'auth/requires-recent-login':
      return 'For security, sign out and sign in again before enrolling MFA.';
    case 'auth/user-token-expired':
      return 'Your session has expired. Sign in again and retry.';
    default:
      return error instanceof Error
        ? error.message
        : 'Something went wrong while configuring two-factor authentication.';
  }
};

export const TotpMfaSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const loadEnrollmentStatus = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;

      if (!user) {
        setEnrolled(false);
        setError('Sign in before managing two-factor authentication.');
        return;
      }

      await user.reload();

      const factors = multiFactor(user).enrolledFactors;
      setEnrolled(
        factors.some(
          (factor) =>
            factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEnrollmentStatus();
  }, [loadEnrollmentStatus]);

  const startEnrollment = async () => {
    setError('');
    setSuccess('');
    setCopied(false);
    setStarting(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      await user.reload();

      if (!user.emailVerified) {
        throw new Error(
          'Verify your email address before enrolling in two-factor authentication.',
        );
      }

      const alreadyEnrolled = multiFactor(user).enrolledFactors.some(
        (factor) =>
          factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
      );

      if (alreadyEnrolled) {
        setEnrolled(true);
        throw new Error(
          'A TOTP authenticator is already enrolled on this account.',
        );
      }

      const session = await multiFactor(user).getSession();
      const generatedSecret =
        await TotpMultiFactorGenerator.generateSecret(session);

      const accountName = user.email || user.uid;
      const issuer = 'BugPulse AI';
      const otpAuthUrl = generatedSecret.generateQrCodeUrl(
        accountName,
        issuer,
      );

      setSecret(generatedSecret);
      setQrCodeUrl(otpAuthUrl);
      setVerificationCode('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  };

  const verifyAndEnroll = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const code = verificationCode.replace(/\s/g, '');

    if (!secret) {
      setError('Generate an enrollment QR code first.');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError('Enter a valid six-digit authenticator code.');
      return;
    }

    setVerifying(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      const assertion =
        TotpMultiFactorGenerator.assertionForEnrollment(secret, code);

      await multiFactor(user).enroll(
        assertion,
        'BugPulse AI Authenticator',
      );

      setSecret(null);
      setQrCodeUrl('');
      setVerificationCode('');
      setEnrolled(true);
      setSuccess(
        'Two-factor authentication is now enabled for this Firebase account.',
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = async () => {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret.secretKey);
      setCopied(true);
      setError('');
    } catch {
      setError(
        'Could not copy automatically. Select the manual setup key and copy it yourself.',
      );
    }
  };

  const cancelEnrollment = () => {
    setSecret(null);
    setQrCodeUrl('');
    setVerificationCode('');
    setError('');
    setSuccess('');
    setCopied(false);
  };

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Authenticator app
            </h3>
            <p className={`${mutedTextClass} mt-1 leading-relaxed`}>
              Add a time-based one-time password (TOTP) authenticator to
              strengthen your BugPulse AI sign-in.
            </p>
          </div>

          <span
            className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold ${
              enrolled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300'
            }`}
          >
            {loading ? 'Checking…' : enrolled ? 'Enabled' : 'Not enabled'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking Firebase enrollment status…
          </div>
        ) : enrolled ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
              A TOTP factor is enrolled in Firebase Authentication. This
              status is read from Firebase, not a local or Firestore flag.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              You will need a compatible authenticator app, such as Google
              Authenticator or Microsoft Authenticator, to complete setup.
            </p>
          </div>
        )}

        {!loading && !enrolled && !secret && (
          <button
            type="button"
            onClick={() => void startEnrollment()}
            disabled={starting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {starting ? 'Preparing setup…' : 'Set up authenticator'}
          </button>
        )}

        {secret && qrCodeUrl && !enrolled && (
          <div className="space-y-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                1. Scan the QR code
              </h4>
              <p className={mutedTextClass}>
                Open your authenticator app and scan this code to add BugPulse
                AI.
              </p>
            </div>

            <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800">
              <QRCodeSVG
                value={qrCodeUrl}
                size={220}
                level="M"
                marginSize={4}
                title="BugPulse AI TOTP enrollment QR code"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Can't scan it? Enter the setup key manually.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <code className="min-w-0 flex-1 select-all break-all rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  {secret.secretKey}
                </code>
                <button
                  type="button"
                  onClick={() => void copySecret()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy key'}
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                Keep this setup key private. Anyone who obtains it may be able
                to generate your authentication codes. Do not share it or
                save it in screenshots.
              </p>
            </div>

            <form onSubmit={verifyAndEnroll} className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="totp-verification-code"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  2. Verify the six-digit code
                </label>
                <input
                  id="totp-verification-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(event) =>
                    setVerificationCode(
                      event.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  className={inputClass}
                  aria-describedby="totp-code-help"
                />
                <p id="totp-code-help" className={mutedTextClass}>
                  Enter the current code shown by your authenticator app.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={verifying || verificationCode.length !== 6}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifying && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {verifying ? 'Verifying…' : 'Verify and enable MFA'}
                </button>

                <button
                  type="button"
                  onClick={cancelEnrollment}
                  disabled={verifying}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Cancel setup
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!loading && (
          <button
            type="button"
            onClick={() => void loadEnrollmentStatus()}
            disabled={starting || verifying}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh enrollment status
          </button>
        )}
      </section>
    </div>
  );
};

export default TotpMfaSettings;
