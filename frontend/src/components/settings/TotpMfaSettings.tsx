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
  Smartphone,
} from 'lucide-react';
import { auth } from '../../config/firebase';
import {
  setupTotp,
  verifyTotp,
  disableTotp,
  getSecurityStatus,
} from '../../api/accountSettingsApi';

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
  const [disabling, setDisabling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // Active setup state (Firebase native or In-App RFC 6238)
  const [firebaseSecret, setFirebaseSecret] = useState<TotpSecret | null>(null);
  const [inAppSecretKey, setInAppSecretKey] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const activeSecretKey = firebaseSecret?.secretKey || inAppSecretKey;

  const loadEnrollmentStatus = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;

      if (!user) {
        setEnrolled(false);
        return;
      }

      await user.reload().catch(() => undefined);

      const factors = multiFactor(user).enrolledFactors;
      const isFirebaseEnrolled = factors.some(
        (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
      );

      // Check backend status for in-app TOTP 2FA
      const securityStatus = await getSecurityStatus().catch(() => null);
      const isAppEnrolled = Boolean(securityStatus?.two_factor_enabled);

      setEnrolled(isFirebaseEnrolled || isAppEnrolled);
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

      await user.reload().catch(() => undefined);

      // Attempt 1: Try Firebase native MFA
      let usedFirebase = false;
      try {
        const session = await multiFactor(user).getSession();
        const generatedSecret =
          await TotpMultiFactorGenerator.generateSecret(session);

        const accountName = user.email || user.uid;
        const issuer = 'BugPulse AI';
        const otpAuthUrl = generatedSecret.generateQrCodeUrl(
          accountName,
          issuer,
        );

        setFirebaseSecret(generatedSecret);
        setInAppSecretKey(null);
        setQrCodeUrl(otpAuthUrl);
        usedFirebase = true;
      } catch (fbErr: any) {
        // If Firebase Identity Platform / MFA is disabled in Firebase Console,
        // seamlessly use our In-App standard RFC 6238 TOTP engine
        console.info(
          'Firebase Console MFA disabled (or Spark plan); activating in-app TOTP engine.',
          fbErr?.code,
        );
      }

      // Attempt 2: If Firebase threw auth/operation-not-allowed, use In-App TOTP
      if (!usedFirebase) {
        const data = await setupTotp();
        setFirebaseSecret(null);
        setInAppSecretKey(data.secret);
        setQrCodeUrl(data.qr_code_url);
      }

      setVerificationCode('');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || getErrorMessage(err);
      setError(detail);
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

    if (!activeSecretKey) {
      setError('Please click Set Up Authenticator to generate a QR code first.');
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

      if (firebaseSecret) {
        // Enrolled through Firebase native MFA
        const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
          firebaseSecret,
          code,
        );
        await multiFactor(user).enroll(assertion, 'BugPulse AI Authenticator');
      } else {
        // Enrolled through In-App RFC 6238 TOTP engine
        await verifyTotp(code);
      }

      setFirebaseSecret(null);
      setInAppSecretKey(null);
      setQrCodeUrl('');
      setVerificationCode('');
      setEnrolled(true);
      setSuccess(
        'Two-factor authentication is now active on your account! Your account is protected.',
      );
    } catch (err: any) {
      const detail = err?.response?.data?.detail || getErrorMessage(err);
      setError(detail);
    } finally {
      setVerifying(false);
    }
  };

  const disableMfa = async () => {
    if (
      !window.confirm(
        'Are you sure you want to disable two-factor authentication? Your account will no longer require an authenticator code to sign in.',
      )
    ) {
      return;
    }

    setError('');
    setSuccess('');
    setDisabling(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      // 1. Disable in-app TOTP
      await disableTotp().catch(() => undefined);

      // 2. Unenroll Firebase native MFA factor if any
      await user.reload().catch(() => undefined);
      const factors = multiFactor(user).enrolledFactors;
      const totpFactor = factors.find(
        (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
      );

      if (totpFactor) {
        await multiFactor(user).unenroll(totpFactor).catch(() => undefined);
      }

      setEnrolled(false);
      setSuccess('Two-factor authentication has been disabled.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || getErrorMessage(err);
      setError(detail);
    } finally {
      setDisabling(false);
    }
  };

  const copySecret = async () => {
    if (!activeSecretKey) return;

    try {
      await navigator.clipboard.writeText(activeSecretKey);
      setCopied(true);
      setError('');
    } catch {
      setError(
        'Could not copy automatically. Select the manual setup key and copy it yourself.',
      );
    }
  };

  const cancelEnrollment = () => {
    setFirebaseSecret(null);
    setInAppSecretKey(null);
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
            <KeyRound className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Two-Factor Authentication (TOTP)
            </h3>
            <p className={`${mutedTextClass} mt-1 leading-relaxed`}>
              Protect your BugPulse AI account with time-based one-time passwords generated by Google Authenticator, Microsoft Authenticator, or Authy.
            </p>
          </div>

          <span
            className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold ${
              enrolled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300'
            }`}
          >
            {loading ? 'Checking…' : enrolled ? '2FA Active' : 'Not Configured'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking two-factor status…
          </div>
        ) : enrolled ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                Two-Factor Authentication is currently active on your account. You will be prompted to enter a 6-digit code from your authenticator app whenever you sign in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void disableMfa()}
              disabled={disabling}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 cursor-pointer"
            >
              {disabling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {disabling ? 'Disabling 2FA…' : 'Disable Two-Factor Authentication'}
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Install any standard authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.) on your mobile phone to scan the QR code.
            </p>
          </div>
        )}

        {!loading && !enrolled && !activeSecretKey && (
          <button
            type="button"
            onClick={() => void startEnrollment()}
            disabled={starting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {starting ? 'Generating QR Code…' : 'Set Up Authenticator App'}
          </button>
        )}

        {activeSecretKey && qrCodeUrl && !enrolled && (
          <div className="space-y-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                Step 1: Scan the QR code
              </h4>
              <p className={mutedTextClass}>
                Open Google Authenticator or Microsoft Authenticator and scan this code:
              </p>
            </div>

            <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800">
              <QRCodeSVG
                value={qrCodeUrl}
                size={200}
                level="M"
                marginSize={4}
                title="BugPulse AI TOTP enrollment QR code"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Cannot scan? Enter setup key manually:
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <code className="min-w-0 flex-1 select-all break-all rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  {activeSecretKey}
                </code>
                <button
                  type="button"
                  onClick={() => void copySecret()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy Key'}
                </button>
              </div>
            </div>

            <form onSubmit={verifyAndEnroll} className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="totp-verification-code"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Step 2: Enter the 6-digit code shown in your app
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
                  className={`${inputClass} tracking-widest font-mono text-center text-base`}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={verifying || verificationCode.length !== 6}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {verifying && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {verifying ? 'Verifying…' : 'Verify & Activate 2FA'}
                </button>

                <button
                  type="button"
                  onClick={cancelEnrollment}
                  disabled={verifying}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh status
          </button>
        )}
      </section>
    </div>
  );
};

export default TotpMfaSettings;
