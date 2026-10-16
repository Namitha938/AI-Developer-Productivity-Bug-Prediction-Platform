import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export type RiskLevel = 'high' | 'medium' | 'low';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  className = '',
  showIcon = true,
}) => {
  if (level === 'high') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/60 ${className}`}
      >
        {showIcon && <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
        High risk
      </span>
    );
  }

  if (level === 'medium') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 ${className}`}
      >
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
        Medium risk
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 ${className}`}
    >
      {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
      Low risk
    </span>
  );
};
