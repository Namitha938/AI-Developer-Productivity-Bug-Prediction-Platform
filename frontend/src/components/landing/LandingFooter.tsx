import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#090f1c] border-t border-slate-800 text-slate-400 font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-white">
                tracepoint
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Turn code signals into clear next steps. Build with confidence, one pull request at a time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-400">
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Overview
            </Link>
            <Link to="/editor" className="hover:text-white transition-colors">
              Code analysis
            </Link>
            <Link to="/issues" className="hover:text-white transition-colors">
              Bug history
            </Link>
            <Link to="/analytics" className="hover:text-white transition-colors">
              Productivity
            </Link>
            <Link to="/admin" className="hover:text-white transition-colors">
              Admin
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>Built for the teams behind reliable software.</p>
          <p className="font-mono uppercase text-[10px] tracking-wider text-slate-500">
            ENCRYPTED IN TRANSIT / PRIVATE BY DESIGN
          </p>
          <p>© 2026 Tracepoint · Illustrative product experience</p>
        </div>
      </div>
    </footer>
  );
};
