import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const passedCount = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (!password) return { label: 'Enter password', color: 'bg-slate-200 dark:bg-slate-700', width: '0%' };
    if (passedCount <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (passedCount === 2) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (passedCount === 3) return { label: 'Good', color: 'bg-indigo-500', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const meta = getStrengthMeta();

  return (
    <div className="space-y-2 pt-1 text-xs">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>Password strength:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{meta.label}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${meta.color} transition-all duration-300 rounded-full`}
            style={{ width: meta.width }}
          />
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
        <div
          className={`flex items-center gap-1.5 ${
            hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
          }`}
        >
          {hasMinLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
          <span>Min 8 characters</span>
        </div>

        <div
          className={`flex items-center gap-1.5 ${
            hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
          }`}
        >
          {hasUpper ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
          <span>Uppercase letter</span>
        </div>

        <div
          className={`flex items-center gap-1.5 ${
            hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
          }`}
        >
          {hasLower ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
          <span>Lowercase letter</span>
        </div>

        <div
          className={`flex items-center gap-1.5 ${
            hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
          }`}
        >
          {hasNumber ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
          <span>Number (0-9)</span>
        </div>
      </div>
    </div>
  );
};
