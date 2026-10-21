import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Folder,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Code2,
  ExternalLink,
} from 'lucide-react';

const SAMPLE_PAYMENT_CODE = `// payments-service / src/services/payment.ts
import { db, gateway } from "../clients";

export async function capturePayment(
  orderId: string, amount: number
): Promise<PaymentResult> {
  const order = await db.orders.find(orderId);
  if (!order) throw new Error("Not found");

  // Retry may capture the same payment twice
  const result = await gateway.capture({
    amount, currency: order.currency,
    reference: order.id
  });

  await db.orders.update(orderId, {
    status: "paid", transactionId: result.id
  });
  return { success: true, id: result.id };
}`;

export const EditorAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFile, setActiveFile] = useState('payment.ts');
  const [findingsFilter, setFindingsFilter] = useState<'Bugs' | 'Smells' | 'Duplicates'>('Bugs');

  const lines = SAMPLE_PAYMENT_CODE.split('\n');

  return (
    <div className="space-y-4 font-sans h-full flex flex-col">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Understand every code path.
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-mono text-slate-600 dark:text-slate-300">payments-service / main</span>
            <span>·</span>
            <span>Analysis AN-1084</span>
            <span>·</span>
            <span>Completed today at 09:42</span>
            <span className="hidden sm:inline text-slate-400">· Also supports Python, Java, Go & JavaScript</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Analysis complete</span>
          </span>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run analysis</span>
          </button>
        </div>
      </div>

      {/* 2. Three-Pane Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[560px]">
        {/* Pane 1: File Explorer (2 cols) */}
        <div className="lg:col-span-2 p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between text-xs font-sans">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-semibold uppercase block">
              EXPLORER
            </span>

            <div className="space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              {/* src */}
              <div>
                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium py-0.5">
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                  <span>src</span>
                </div>
                {/* services */}
                <div className="pl-3 space-y-0.5 mt-0.5">
                  <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium py-0.5">
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                    <span>services</span>
                  </div>
                  <div className="pl-3 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveFile('payment.ts')}
                      className={`w-full flex items-center justify-between py-1 px-1.5 rounded text-left ${
                        activeFile === 'payment.ts'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">payment.ts</span>
                      <span className="text-[10px] font-bold text-rose-500">3</span>
                    </button>
                    <div className="py-0.5 px-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                      order.ts
                    </div>
                    <div className="py-0.5 px-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                      refund.ts
                    </div>
                  </div>

                  {/* resolvers */}
                  <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium py-0.5 mt-1">
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                    <span>resolvers</span>
                  </div>
                  <div className="pl-3">
                    <div className="flex items-center justify-between py-0.5 px-1.5 text-slate-500">
                      <span>orders.ts</span>
                      <span className="text-[10px] font-bold text-amber-500">1</span>
                    </div>
                  </div>

                  {/* utils */}
                  <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium py-0.5 mt-1">
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                    <span>utils</span>
                  </div>
                  <div className="pl-3">
                    <div className="flex items-center justify-between py-0.5 px-1.5 text-slate-500">
                      <span>retry.ts</span>
                      <span className="text-[10px] font-bold text-rose-500">1</span>
                    </div>
                    <div className="py-0.5 px-1.5 text-slate-500">
                      logger.ts
                    </div>
                  </div>
                </div>
              </div>

              {/* root files */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="px-1.5 text-slate-500">package.json</div>
                <div className="px-1.5 text-slate-500">tsconfig.json</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
            24 FILES ANALYZED
          </div>
        </div>

        {/* Pane 2: Code Editor & Analysis Highlights (6 cols) */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            {/* Editor tab header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                payment.ts · TypeScript
              </span>
              <span className="text-[10px] font-mono text-slate-400">UTF-8</span>
            </div>

            {/* Code Lines with TP-284 Highlight */}
            <div className="py-3 font-mono text-xs overflow-x-auto leading-relaxed">
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlight = lineNum >= 10 && lineNum <= 15;
                return (
                  <div
                    key={lineNum}
                    className={`flex items-start px-2 py-0.5 rounded ${
                      isHighlight
                        ? 'bg-rose-500/10 border-l-2 border-rose-500 text-rose-950 dark:text-rose-200'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-right pr-4 text-slate-400 select-none text-[11px]">
                      {lineNum}
                    </span>
                    <pre className="font-mono text-xs whitespace-pre">{line}</pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor Status & Metrics Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-mono text-[11px] text-slate-400">
              main / a83f29c · Ln 11, Col 3
            </span>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">O(n)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Space</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">O(1)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Complexity</span>
                <span className="font-semibold text-rose-500">14 · High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pane 3: AI Findings (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header + Risk Badge */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  AI findings
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">
                  MODEL v2.4 · 94% CONF.
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-rose-600 font-mono">86</span>
                <span className="block text-[10px] text-slate-400 font-medium">Predicted bug risk</span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFindingsFilter('Bugs')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  findingsFilter === 'Bugs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Bugs 3
              </button>
              <button
                type="button"
                onClick={() => setFindingsFilter('Smells')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  findingsFilter === 'Smells'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Smells 1
              </button>
              <button
                type="button"
                onClick={() => setFindingsFilter('Duplicates')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  findingsFilter === 'Duplicates'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Duplicates 1
              </button>
            </div>

            {/* Finding Cards */}
            <div className="space-y-2.5">
              {/* Card 1: TP-284 */}
              <div
                onClick={() => navigate('/issues/TP-284')}
                className="p-3 rounded-lg border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 text-[11px]">TP-284 · L11–14</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    High
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                  Duplicate payment capture
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Retries can charge the same order more than once.
                </p>
              </div>

              {/* Card 2: TP-279 */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 text-[11px]">TP-279 · L28–34</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    High
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                  Unbounded retry loop
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  No retry ceiling or exponential backoff.
                </p>
              </div>

              {/* Card 3: TP-272 */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 text-[11px]">TP-272 · L7</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    Medium
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                  Missing amount validation
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Negative values reach the gateway.
                </p>
              </div>
            </div>

            <Link
              to="/issues/TP-284"
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Investigate TP-284</span>
              <span>→</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
            Quality 82/100 · Maintainability B · Duplication 4.2%
          </div>
        </div>
      </div>
    </div>
  );
};
