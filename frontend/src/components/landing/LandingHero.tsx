import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight, Shield, CheckCircle2, Play, Code2 } from 'lucide-react';

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-16 pb-24 bg-[#0c1322] text-white overflow-hidden border-b border-slate-800">
      {/* Subtle Glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[450px] bg-blue-600/10 blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (7 cols): Main Message */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-mono text-[11px] tracking-wider uppercase">
                DEVELOPER INTELLIGENCE, CONNECTED.
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Your next bug.
              <br />
              Caught before
              <br />
              production.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Turn code signals into clear next steps. Build with confidence, one pull request at a time.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/30 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Explore live demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/editor')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-semibold text-sm hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-blue-400" />
                <span>Open code analysis</span>
              </button>
            </div>

            {/* Footer Trust Badges */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deterministic AST Analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Code Retention</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>94% Model Accuracy</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Interactive Signal Card */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-[#141d30]/90 border border-slate-700/80 shadow-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 text-xs tracking-wider uppercase">
                  TRACE / TP-284
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  High risk
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-white tracking-tight">
                  One missing key. Two charges.
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  AI detected a non-idempotent payment capture before it reached production.
                </p>
              </div>

              {/* Sequence Flow Diagram */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px]">
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700 text-slate-300">
                  Capture succeeds
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700 text-slate-300">
                  Response times out
                </div>
                <div className="p-2 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300">
                  Retry charges
                </div>
              </div>

              {/* Code Snippet */}
              <div className="p-3 rounded-lg bg-[#090f1c] border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                <div className="text-slate-500 text-[10px]">suggested fix · payment.ts</div>
                <div className="text-emerald-400">
                  + idempotencyKey: `payment:${'{'}order.id{'}'}`
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/60 text-slate-400">
                <span className="text-[11px]">94% model confidence</span>
                <Link
                  to="/issues/TP-284"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1 group"
                >
                  <span>Explore the signal</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="pt-3 text-center text-xs text-slate-500">
              Built for the teams behind reliable software.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
