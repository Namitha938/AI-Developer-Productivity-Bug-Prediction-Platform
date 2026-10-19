import React from 'react';
import { Network, ArrowRight, GitBranch, Cpu, ShieldCheck, Terminal, CheckCircle2 } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Source Ingestion',
      subtitle: 'Git Webhook & Web IDE',
      description: 'Streamed over TLS with ephemeral in-memory processing. Zero code retention policy.',
      icon: GitBranch,
    },
    {
      num: '02',
      title: 'AST Tokenization',
      subtitle: 'Tree-sitter Grammars',
      description: 'Generates language-specific Abstract Syntax Trees and control flow graphs.',
      icon: Terminal,
    },
    {
      num: '03',
      title: 'GNN Inference',
      subtitle: 'Graph Neural Networks',
      description: 'Extracts structural semantics and predicts regression probability in <45ms.',
      icon: Network,
    },
    {
      num: '04',
      title: 'CWE Heuristics',
      subtitle: 'Security & Complexity',
      description: 'Cross-references OWASP Top 10 and CWE-89/79/401 vulnerability taxonomies.',
      icon: ShieldCheck,
    },
    {
      num: '05',
      title: 'SARIF 2.1.0 Output',
      subtitle: 'Diffs & Annotations',
      description: 'Outputs automated refactoring diffs, risk score pills, and CI/CD PR comments.',
      icon: Cpu,
    },
  ];

  return (
    <section id="architecture" className="py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            <Network className="w-3.5 h-3.5" />
            <span>Enterprise Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Multi-Layered Code Intelligence Pipeline
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            How BugPulse AI transforms raw source code into deterministic bug predictions and
            verified automated refactor diffs in under 45ms.
          </p>
        </div>

        {/* 5-Step Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`animated-card card-shimmer animate-fade-in-up stagger-${index + 1} relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-600 group cursor-default`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:scale-120 group-hover:rotate-6 transition-all duration-300" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {step.title}
                  </h3>
                  <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3">
                    {step.subtitle}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>LATENCY</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:scale-105 transition-transform">&lt; 9ms</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architectural Highlights Banner */}
        <div className="mt-10 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center md:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full SARIF 2.1.0 & CycloneDX SBOM Interoperability</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Integrates directly with GitHub Advanced Security, GitLab Ultimate, SonarQube, and any OASIS SARIF-compliant IDE extension without vendor lock-in.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60">
              Avg. Engine Throughput: 140k LoC/sec
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

