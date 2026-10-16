import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Code2, ArrowRight, Github, Shield, Heart } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-[#fafafa] dark:bg-[#070a13] border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* Call to Action Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-14 text-center border border-indigo-800/60 shadow-2xl">
          {/* Subtle Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/20 blur-3xl pointer-events-none rounded-full"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-indigo-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Enterprise Grade Code Governance</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to Eliminate Regressions Before Merging?
            </h2>

            <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed font-normal">
              Deploy BugPulse AI across your repositories in minutes, or test your source code
              immediately in our full browser-based Web IDE.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/editor')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold bg-white text-indigo-950 hover:bg-slate-100 transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <Code2 className="w-4 h-4" />
                <span>Launch Free Web IDE</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-400/40 transition-all shadow-md focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
              >
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Credentials */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info (2 cols on md) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                BugPulse AI
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                v2.4
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              AI developer productivity platform combining deterministic AST analysis with graph
              neural networks to predict defects, audit complexity, and govern code quality.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational • Zero Code Retention</span>
            </div>
          </div>

          {/* Links Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a href="#scanner" className="hover:text-indigo-600 transition-colors">
                  Live Scanner
                </a>
              </li>
              <li>
                <Link to="/editor" className="hover:text-indigo-600 transition-colors">
                  Web IDE Sandbox
                </Link>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-indigo-600 transition-colors">
                  Capabilities
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-indigo-600 transition-colors">
                  Architecture Pipeline
                </a>
              </li>
              <li>
                <a href="#benchmarks" className="hover:text-indigo-600 transition-colors">
                  Model Benchmarks
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Integrations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Integrations
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  GitHub App & Actions
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  VS Code Extension
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  GitLab CI Pipeline
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  JetBrains IDE Suite
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Slack & Teams Webhooks
                </span>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Compliance & Project */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Compliance & Source
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span>SOC 2 Type II Certified</span>
              </li>
              <li>
                <span>ISO/IEC 27001 Standard</span>
              </li>
              <li>
                <span>OASIS SARIF 2.1.0</span>
              </li>
              <li>
                <a
                  href="https://github.com/Namitha938/AI-Developer-Productivity-Bug-Prediction-Platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} BugPulse AI Platform. Built as a final year academic project.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-indigo-600 transition-colors">
              Console Sign In
            </Link>
            <span>•</span>
            <Link to="/register" className="hover:text-indigo-600 transition-colors">
              Developer Registration
            </Link>
            <span>•</span>
            <a
              href="https://github.com/Namitha938/AI-Developer-Productivity-Bug-Prediction-Platform"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              MIT License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

