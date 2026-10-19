import React from 'react';
import {
  Binary,
  Network,
  Cpu,
  FileCheck2,
  GitPullRequest,
  LineChart,
  Layers,
  Sparkles,
} from 'lucide-react';

export const CapabilitiesSection: React.FC = () => {
  const capabilities = [
    {
      icon: Binary,
      title: 'Deterministic AST & Control Flow',
      description:
        'Parses raw token streams into Abstract Syntax Trees to analyze branch complexity, nesting depth, and execution paths.',
      tag: 'Compiler Grade',
    },
    {
      icon: Network,
      title: 'Graph Neural Network Bug Prediction',
      description:
        'Trained on millions of commits across Defect4J and CodeSearchNet to predict regression probability before unit tests run.',
      tag: 'Deep Learning',
    },
    {
      icon: Cpu,
      title: 'Cognitive & Cyclomatic Auditing',
      description:
        'Identifies algorithmic bottlenecks, deep conditional nesting, and unmaintainable modules with Halstead metrics.',
      tag: 'Maintainability',
    },
    {
      icon: FileCheck2,
      title: 'Automated SARIF 2.1.0 Reports',
      description:
        'Exports OASIS SARIF standards and synthesizes instant refactoring diffs to remediate security flaws in one click.',
      tag: 'ISO Compliant',
    },
    {
      icon: GitPullRequest,
      title: 'GitHub & CI/CD Automated PR Bot',
      description:
        'Runs continuous scans on pull requests, leaves inline annotations, and enforces quality gates on high-risk files.',
      tag: 'DevOps Native',
    },
    {
      icon: LineChart,
      title: 'Productivity & Risk Velocity Analytics',
      description:
        'Visualizes team bug remediation rates, technical debt trends, and risk velocity to maintain sustainable shipping cadences.',
      tag: 'Intelligence',
    },
  ];

  return (
    <section id="capabilities" className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engineered for Modern Engineering Organizations
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            A comprehensive governance and defect-prevention stack spanning developer workstations,
            pull requests, and engineering leadership analytics.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className={`animated-card card-shimmer animate-fade-in-up stagger-${i + 1} p-7 rounded-2xl bg-[#fafafa] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/70 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 group flex flex-col justify-between cursor-default`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-115 group-hover:rotate-6 transition-all duration-300 shadow-sm group-hover:shadow-indigo-500/30">
                      <Icon className="w-5 h-5 transition-transform duration-300" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {cap.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {cap.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300" />
                  <span>Enterprise production-ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

