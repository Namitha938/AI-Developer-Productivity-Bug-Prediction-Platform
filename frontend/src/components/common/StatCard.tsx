import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    isPositive: boolean;
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
      className={`animated-card card-shimmer bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-xs group cursor-pointer hover:border-primary/50`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </p>
        <div
          className={`p-2.5 rounded-xl ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xs`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold tracking-tight text-foreground font-mono group-hover:text-primary transition-colors">
          {value}
        </h3>

        {change && (
          <div
            className={`flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full transition-all group-hover:scale-105 ${
              change.isPositive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
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
