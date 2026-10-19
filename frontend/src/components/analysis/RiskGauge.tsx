import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 180 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Use 75% arc (270 degrees)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(score, 100)) / 100;

  let color = '#10b981'; // Green
  let label = 'Clean / Low Risk';
  let badgeBg = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

  if (score >= 80) {
    color = '#ef4444'; // Red
    label = 'Critical Bug Risk';
    badgeBg = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
  } else if (score >= 60) {
    color = '#f97316'; // Orange
    label = 'High Bug Risk';
    badgeBg = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
  } else if (score >= 35) {
    color = '#eab308'; // Yellow
    label = 'Moderate Risk';
    badgeBg = 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 animate-scale-in">
      <div className="relative" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[135deg] overflow-visible"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            className="text-muted/30"
            strokeLinecap="round"
          />

          {/* Active Value Arc with Glowing Shadow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color}88)`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-3">
          <span className="text-4xl font-extrabold tracking-tight font-mono text-foreground animate-fade-in">
            {score}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            / 100 Risk Score
          </span>
        </div>
      </div>

      <div
        className={`mt-1 px-3.5 py-1 rounded-full text-xs font-bold border ${badgeBg} transition-all duration-300 ${
          score >= 60 ? 'animate-pulse' : ''
        }`}
      >
        {label}
      </div>
    </div>
  );
};

