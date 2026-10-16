import React from 'react';
import { Severity, IssueStatus } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Clock, Check } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showIcon = true,
  className = '',
}) => {
  switch (severity) {
    case 'critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5" />}
          Critical
        </span>
      );
    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
          High
        </span>
      );
    case 'medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 ${className}`}
        >
          {showIcon && <Info className="w-3.5 h-3.5" />}
          Medium
        </span>
      );
    case 'low':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          Low
        </span>
      );
    default:
      return null;
  }
};

interface StatusBadgeProps {
  status: IssueStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'open':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Open
        </span>
      );
    case 'in_progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${className}`}
        >
          <Clock className="w-3 h-3 text-amber-500" />
          In Progress
        </span>
      );
    case 'resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          <Check className="w-3 h-3 text-emerald-500" />
          Resolved
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground ${className}`}>
          {status}
        </span>
      );
  }
};

export const RiskPill: React.FC<{ score: number; className?: string }> = ({ score, className = '' }) => {
  let colorClasses = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  let label = 'Low Risk';

  if (score >= 80) {
    colorClasses = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    label = 'Critical Risk';
  } else if (score >= 60) {
    colorClasses = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    label = 'High Risk';
  } else if (score >= 35) {
    colorClasses = 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
    label = 'Medium Risk';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}
    >
      <span className="font-mono">{score}/100</span>
      <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold">({label})</span>
    </span>
  );
};

