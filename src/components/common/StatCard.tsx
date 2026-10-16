import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    isPositive: boolean; // positive means good in context
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card text-card-foreground rounded-xl border border-border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-primary/40' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-foreground font-mono">{value}</h3>

        {change && (
          <div
            className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              change.isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {change.isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {change.value}
          </div>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
};

