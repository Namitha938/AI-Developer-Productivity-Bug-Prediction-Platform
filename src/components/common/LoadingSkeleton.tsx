import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-muted/70 rounded-md ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-4 w-28" />
        <LoadingSkeleton className="h-8 w-8 rounded-lg" />
      </div>
      <LoadingSkeleton className="h-7 w-20" />
      <LoadingSkeleton className="h-3 w-40" />
    </div>
  );
};

