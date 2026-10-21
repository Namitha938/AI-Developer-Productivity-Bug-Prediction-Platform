import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  category?: string;
  topLinkText?: string;
  topLinkLabel?: string;
  topLinkTo?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  category,
  topLinkText,
  topLinkLabel,
  topLinkTo = '/login',
}) => {
  const { isDark, toggleTheme } = useThemeStore();
  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#070A13] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Left panel: Tracepoint Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c1322] text-white p-12 lg:p-16 flex-col justify-between select-none relative overflow-hidden border-r border-slate-800/60">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 blur-3xl rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Header */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-1"
            aria-label="Tracepoint Home"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-white">
              tracepoint
            </span>
          </Link>
        </div>

        {/* Center: Hero Heading & Signal Card */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-3.5">
            <p className="text-[11px] font-mono tracking-widest text-indigo-400 font-semibold uppercase">
              DEVELOPER INTELLIGENCE, CONNECTED.
            </p>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Your next bug.
              <br />
              Caught before
              <br />
              production.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md pt-1">
              Turn code signals into clear next steps. Build with confidence, one pull request at a time.
            </p>
          </div>

          {/* Interactive Bug Preview Card: TRACE / TP-284 */}
          <div className="p-6 rounded-2xl bg-[#141d30]/90 border border-slate-700/60 shadow-xl space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 text-[11px] tracking-wider uppercase">
                TRACE / TP-284
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                High risk
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-semibold text-white tracking-tight">
                One missing key. Two charges.
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                AI detected a non-idempotent payment capture before it reached production.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/50 text-slate-400">
              <span className="text-[11px] font-medium text-slate-400">
                94% model confidence
              </span>
              <Link
                to="/issues/TP-284"
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1 group"
              >
                <span>Explore the signal</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 space-y-1 text-xs text-slate-400">
          <p className="font-medium text-slate-300">
            Built for the teams behind reliable software.
          </p>
          <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            ENCRYPTED IN TRANSIT / PRIVATE BY DESIGN
          </p>
          <p className="text-[10px] text-slate-500 pt-0.5">
            © 2026 Tracepoint · Illustrative product experience
          </p>
        </div>
      </div>

      {/* Right panel: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16">
        {/* Top bar with quick navigation link */}
        <div className="w-full flex items-center justify-between text-xs">
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white">
              tracepoint
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-slate-500 dark:text-slate-400">
            {topLinkText && <span className="mr-1">{topLinkText}</span>}
            {topLinkLabel && (
              <Link
                to={topLinkTo}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>{topLinkLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Form Box */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {category && (
            <p className="text-[11px] font-mono tracking-widest text-blue-600 dark:text-blue-400 font-semibold uppercase mb-2">
              {category}
            </p>
          )}

          {title && (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {/* Bottom spacer / copyright for mobile */}
        <div className="w-full text-center lg:text-left text-[11px] text-slate-400 lg:invisible">
          © 2026 Tracepoint
        </div>
      </div>
    </div>
  );
};
