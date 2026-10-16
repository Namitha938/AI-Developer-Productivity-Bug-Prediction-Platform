import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Array of 6 characters
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty input on mount
    const firstEmpty = digits.findIndex((d) => d === '');
    const idxToFocus = firstEmpty === -1 ? 5 : firstEmpty;
    inputsRef.current[idxToFocus]?.focus();
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const newVal = newDigits.join('').slice(0, 6);
    onChange(newVal);

    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newVal.length === 6 && onComplete) {
      onComplete(newVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    onChange(pasted);
    const nextIdx = Math.min(pasted.length, 5);
    inputsRef.current[nextIdx]?.focus();

    if (pasted.length === 6 && onComplete) {
      onComplete(pasted);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 transition-all select-all"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
};
