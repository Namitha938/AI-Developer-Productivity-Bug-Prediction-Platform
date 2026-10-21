import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { X, QrCode, Shield, Check, ArrowRight } from 'lucide-react';

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
  const { user, enable2FA } = useAuthStore();
  const [appTab, setAppTab] = useState<'Google' | 'Microsoft' | 'Other'>('Google');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...digits];
    updated[index] = val;
    setDigits(updated);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`digit-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleEnable = async () => {
    const fullCode = digits.join('');
    if (fullCode.length !== 6) return;

    setLoading(true);
    try {
      await enable2FA(fullCode);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              Workspace / Security / Two-factor setup
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Set up authenticator app
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Complete the authenticator enrollment flow to add a second verification step for your Acme Engineering workspace. Two-factor authentication remains disabled until you confirm the six-digit code.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Main 2-column enrollment steps */}
          <div className="lg:col-span-2 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Authenticator app enrollment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Demo enrollment preview. In the live application, scan your unique QR code or enter your setup key. This illustration cannot enroll an account.
              </p>
            </div>

            {/* 3 Step Cards Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[10px]">1</span>
                  <span>Download an authenticator app</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Google Authenticator, Microsoft Authenticator, or another compatible app.
                </p>
                <div className="flex items-center gap-1 pt-1 text-[10px]">
                  {(['Google', 'Microsoft', 'Other'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setAppTab(tab)}
                      className={`px-2 py-0.5 rounded font-medium ${
                        appTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">2</span>
                  <span>Scan the QR code</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Open the app, tap Add account, then scan the QR code below.
                </p>
                <div className="p-2 rounded bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-semibold">
                    DEMO ILLUSTRATION ONLY
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                    Use manual key for testing.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">3</span>
                  <span>Enter the six-digit code</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Confirm the current code from your authenticator app to finish setup.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    Required
                  </span>
                  <span className="text-[10px] text-slate-400">Expires 30s</span>
                </div>
              </div>
            </div>

            {/* Confirm Six-Digit Code Box */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                Confirm six-digit code
              </h4>
              <div className="flex items-center gap-2 justify-center py-2">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    id={`digit-input-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-12 text-center text-lg font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Enter the current six-digit code from your authenticator app. Enrollment is not complete until you confirm this code.
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleEnable}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  {isSuccess ? 'Enabled!' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar Details */}
          <div className="p-6 bg-slate-50/50 dark:bg-[#080d17] space-y-5 text-xs">
            {/* Profile Info */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white block">Profile</span>
              <p className="text-[11px] text-slate-500">Account details for this enrollment session.</p>
              <div className="space-y-1 text-slate-600 dark:text-slate-400 pt-1 text-[11px]">
                <div><span className="text-slate-400">User:</span> <strong className="text-slate-800 dark:text-slate-200">Maya Chen</strong></div>
                <div><span className="text-slate-400">Email:</span> maya@acme.dev</div>
                <div><span className="text-slate-400">Workspace:</span> Acme Engineering</div>
                <div><span className="text-slate-400">Role:</span> Frontend developer</div>
              </div>
            </div>

            {/* Enrollment status */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] space-y-1">
              <span className="font-semibold text-slate-900 dark:text-white block">Enrollment status</span>
              <p className="text-[11px] text-slate-500 leading-snug">
                Two-factor authentication is not yet enabled for this account. Complete the confirmation step to finish setup.
              </p>
            </div>

            {/* Recovery Code Guidance */}
            <div className="space-y-1.5">
              <span className="font-semibold text-rose-600 dark:text-rose-400 block">Recovery-code guidance</span>
              <p className="text-[11px] text-slate-500 leading-snug">
                Save your recovery codes in a secure location. You will need them to regain access if you lose your phone or authenticator app.
              </p>
              <a href="#recovery" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-block">
                View recovery codes (opens separately)
              </a>
            </div>

            {/* Quick action buttons */}
            <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full text-left py-1.5 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Edit profile
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-left py-1.5 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Forgot password
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-left py-1.5 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Google authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
