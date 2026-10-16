import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex bg-[#fafafa] dark:bg-[#070a13] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Left panel: Futuristic AI Neural Shield & Vision (No code!) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1E1B4B] text-white p-12 flex-col justify-between select-none relative overflow-hidden border-r border-slate-800">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/15 blur-3xl rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none rounded-xl p-1"
            aria-label="BugPulse AI Home"
          >
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              BugPulse AI
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none rounded-lg px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Center: Interesting AI Neural Shield Hologram (No code!) */}
        <div className="relative z-10 my-auto max-w-lg mx-auto space-y-7 text-center">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Autonomous Code Quality Governance</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Predict bugs before they reach production
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed max-w-md mx-auto">
              Deterministic AST analysis and graph neural networks safeguarding continuous delivery pipelines.
            </p>
          </div>

          {/* Interesting Visual AI Neural Shield Image */}
          <div className="relative group max-w-sm mx-auto">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 to-teal-400 opacity-20 blur-xl group-hover:opacity-35 transition-opacity" />
            <img
              src="/login-panel.svg"
              alt="BugPulse AI Neural Code Defense Matrix"
              className="relative w-full h-auto rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">ACCURACY</div>
              <div className="text-sm font-bold text-white">91.4% F1</div>
              <div className="text-[10px] text-slate-400">Trained on Defect4J</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] font-mono text-teal-400 uppercase font-semibold">LATENCY</div>
              <div className="text-sm font-bold text-white">&lt; 38ms</div>
              <div className="text-[10px] text-slate-400">Zero pipeline delay</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] font-mono text-purple-400 uppercase font-semibold">PRIVACY</div>
              <div className="text-sm font-bold text-white">Zero Code</div>
              <div className="text-[10px] text-slate-400">Ephemeral audit only</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-indigo-300/70 text-center flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SOC 2 Type II Certified • OASIS SARIF 2.1.0 Compliant</span>
        </div>
      </div>

      {/* Right panel: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-10 md:p-14">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-7 sm:p-9 space-y-6">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 mb-3 lg:hidden">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                BugPulse AI
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
