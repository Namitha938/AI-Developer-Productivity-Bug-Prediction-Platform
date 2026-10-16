import React from 'react';
import { BarChart3, CheckCircle2, Zap, Clock, ShieldCheck, Database } from 'lucide-react';

export const BenchmarksSection: React.FC = () => {
  const benchmarks = [
    {
      dataset: 'Defect4J v2.0',
      language: 'Java / Kotlin',
      testSplit: '80% Train / 20% Test',
      accuracy: '91.4%',
      precision: '89.2%',
      recall: '88.6%',
      f1: '88.9%',
      latency: '36ms',
    },
    {
      dataset: 'CodeSearchNet Corpus',
      language: 'Python, TS, Go',
      testSplit: '80% Train / 20% Test',
      accuracy: '89.8%',
      precision: '87.6%',
      recall: '86.4%',
      f1: '87.0%',
      latency: '41ms',
    },
    {
      dataset: 'BigCloneBench',
      language: 'Multi-Language Duplicates',
      testSplit: '75% Train / 25% Test',
      accuracy: '93.7%',
      precision: '92.1%',
      recall: '91.0%',
      f1: '91.5%',
      latency: '44ms',
    },
  ];

  return (
    <section id="benchmarks" className="py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Empirical Benchmarks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Rigorous Scientific Model Evaluation
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Evaluated against industry-standard software defect corpora. Metrics verified using 10-fold cross-validation.
          </p>
        </div>

        {/* 3 Callout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 flex items-center gap-4 cursor-default">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">&lt; 45ms</div>
              <div className="text-xs text-slate-500">AST Inference Latency</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 flex items-center gap-4 cursor-default">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">99.98%</div>
              <div className="text-xs text-slate-500">Parser Pipeline Uptime</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 flex items-center gap-4 cursor-default">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">Zero-Day</div>
              <div className="text-xs text-slate-500">CWE Exposure Detection</div>
            </div>
          </div>
        </div>

        {/* Evaluation Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Empirical Model Benchmarks">
              <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Benchmark Dataset</th>
                  <th scope="col" className="px-6 py-4">Language Scope</th>
                  <th scope="col" className="px-6 py-4">Accuracy</th>
                  <th scope="col" className="px-6 py-4">Precision</th>
                  <th scope="col" className="px-6 py-4">Recall</th>
                  <th scope="col" className="px-6 py-4">F1 Score</th>
                  <th scope="col" className="px-6 py-4">Inference Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">
                {benchmarks.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-sans font-semibold text-slate-900 dark:text-white">
                      {row.dataset}
                    </td>
                    <td className="px-6 py-4 font-sans text-slate-500">
                      {row.language}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {row.accuracy}
                    </td>
                    <td className="px-6 py-4">{row.precision}</td>
                    <td className="px-6 py-4">{row.recall}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.f1}</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">{row.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Evaluated against ground-truth human defect patches and automated test suites.</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Hardware: NVIDIA A100 Tensor Core (FP16 quantized)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

