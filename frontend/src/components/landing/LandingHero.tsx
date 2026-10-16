import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Code2, Activity, CheckCircle2 } from 'lucide-react';
import { HeroProductShowcase } from './HeroProductShowcase';

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-24 overflow-hidden">
      {/* Soft Indigo / Violet Radial Glow behind Hero */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[450px] sm:h-[550px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/15 to-teal-400/10 blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm mb-6 animate-in fade-in duration-300 hover:scale-105 transition-transform">
          <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Autonomous Bug Prediction & Code Quality Governance</span>
        </div>

        {/* H1 Headline (Two lines, very bold, with gradient on second line) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] max-w-4xl mx-auto">
          Stop Critical Software Bugs <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500 dark:from-indigo-400 dark:via-violet-400 dark:to-teal-300 bg-clip-text text-transparent">
            Before They Reach Production
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          The intelligent developer productivity platform combining deterministic AST analysis
          with graph neural networks to detect zero-day vulnerabilities, calculate complexity,
          and automate pull request reviews.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/editor')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>Launch Free Web IDE</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-semibold border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
          >
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Explore Demo Dashboard</span>
          </button>
        </div>

        {/* Trust Badges Row */}
        <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>SOC 2 Type II Certified</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ISO/IEC 27001 Standard</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero Code Retention</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>OASIS SARIF 2.1.0 Compliant</span>
          </div>
        </div>

        {/* Professional Animated Product Showcase Canvas */}
        <HeroProductShowcase />
      </div>
    </section>
  );
};
