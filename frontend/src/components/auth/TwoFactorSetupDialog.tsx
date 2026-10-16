import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { mockAuthApi } from '../../api/mock/mockAuthApi';
import { TwoFactorSetupData } from '../../types';
import { OtpInput } from './OtpInput';
import {
  X,
  Shield,
  QrCode,
  Copy,
  Check,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface TwoFactorSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TwoFactorSetupDialog: React.FC<TwoFactorSetupDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { enable2FA } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedCodes, setCopiedCodes] = useState<boolean>(false);
  const [hasConfirmedSavedCodes, setHasConfirmedSavedCodes] = useState<boolean>(false);

  // Load setup data when step 1 opens
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setVerifyCode('');
      setHasConfirmedSavedCodes(false);
      setLoading(true);
      mockAuthApi
        .setup2FA()
        .then((data) => {
          setSetupData(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to initiate 2FA setup. Please try again.');
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const handleDownloadCodes = () => {
    if (!setupData?.backupCodes) return;
    const content = `BugPulse AI Backup Codes\nGenerated: ${new Date().toISOString()}\n\nKeep these codes safe and private.\n\n${setupData.backupCodes.join(
      '\n'
    )}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bugpulse-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || verifyCode;
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await enable2FA(code);
      setLoading(false);
      setStep(3); // Move to backup codes
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid verification code.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (!hasConfirmedSavedCodes) {
      setError('Please check the box confirming you have saved your backup codes.');
      return;
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6 relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enable Two-Factor Authentication
              </h3>
              <p className="text-xs text-slate-500">Step {step} of 3</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Scan QR Code & Secret Key */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Use an authenticator app (such as Google Authenticator, 1Password, or Authy) to scan
              this QR code:
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              {loading || !setupData ? (
                <div className="w-36 h-36 flex items-center justify-center bg-white rounded-lg">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                <img
                  src={setupData.qrCodeUrl}
                  alt="2FA QR Code"
                  className="w-36 h-36 rounded-lg bg-white p-2 border border-slate-200 shrink-0"
                />
              )}

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Or enter secret manually:
                </div>
                <div className="flex items-center gap-2">
                  <code className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 select-all">
                    {setupData?.secret || 'JBSWY3DPEHPK3PXP'}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="Copy Secret"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Type: Time-based One-time Password (TOTP)
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <span>Next: Verify Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Enter 6-digit Code to Verify */}
        {step === 2 && (
          <div className="space-y-5 text-center">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Enter 6-Digit Verification Code
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the numerical code shown in your authenticator app to confirm setup.
              </p>
            </div>

            <div className="py-2">
              <OtpInput
                value={verifyCode}
                onChange={setVerifyCode}
                onComplete={(val) => handleVerify(val)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to QR code</span>
              </button>

              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={loading || verifyCode.length !== 6}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Verify & Activate</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Backup Codes with Copy & Download */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Two-factor authentication is now active on your account!</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Save your emergency backup codes
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If you ever lose access to your authenticator device, each of these one-time codes
                can be used once to access your account.
              </p>
            </div>

            {/* Codes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
              {setupData?.backupCodes.map((code, idx) => (
                <div key={idx} className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                  {code}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleCopyCodes}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium"
              >
                {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodes ? 'Copied to clipboard' : 'Copy codes'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCodes}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>

            {/* Required Confirmation Checkbox */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={hasConfirmedSavedCodes}
                  onChange={(e) => setHasConfirmedSavedCodes(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I have saved these backup codes in a secure password manager or offline location.
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleFinish}
                disabled={!hasConfirmedSavedCodes}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
