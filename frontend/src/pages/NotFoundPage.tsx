import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold font-mono text-foreground tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-foreground mt-1">Page Not Found</h2>
      <p className="text-xs text-muted-foreground max-w-sm mt-1">
        The route you requested could not be resolved by the BugPulse navigation router.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
};

