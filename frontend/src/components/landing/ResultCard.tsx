import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge, RiskLevel } from './RiskBadge';
import { Code2, ArrowRight, ShieldAlert, Cpu, FileText, Bug } from 'lucide-react';

export interface DemoAnalysisResult {
  verdict: RiskLevel;
  confidence: number;
  complexity: number;
  complexityLabel: 'Low' | 'Medium' | 'High';
  linesOfCode: number;
  issuesCount: number;
  whyFlagged: string;
  suggestedFix: string;
  code: string;
  language: string;
}

interface ResultCardProps {
  result: DemoAnalysisResult;
  onOpenInEditor: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onOpenInEditor }) => {
  const confidencePercent = Math.round(result.confidence * 100);

  // Confidence bar color based on verdict
  const barColor =
    result.verdict === 'high'
      ? 'bg-red-500'
      : result.verdict === 'medium'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div
      className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
      aria-live="polite"
    >
      {/* Top Header: Verdict Badge & Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Prediction result:
          </span>
          <RiskBadge level={result.verdict} />
        </div>

        {/* Confidence Gauge Bar */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
            Confidence: <strong className="font-mono text-slate-900 dark:text-white">{confidencePercent}%</strong>
          </span>
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500 rounded-full`}
              style={{ width: `${confidencePercent}%` }}
              role="progressbar"
              aria-valuenow={confidencePercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Complexity</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
              {result.complexity} <span className="text-xs font-sans text-slate-500 font-normal">({result.complexityLabel})</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lines of code</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
              {result.linesOfCode} <span className="text-xs font-sans text-slate-500 font-normal">lines</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Bug className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issues found</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
              {result.issuesCount} <span className="text-xs font-sans text-slate-500 font-normal">detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why this was flagged & Suggested fix */}
      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Why this was flagged
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            {result.whyFlagged}
          </p>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Suggested fix
          </h4>
          <div className="text-sm text-slate-800 dark:text-slate-200 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {result.suggestedFix}
          </div>
        </div>
      </div>

      {/* Button: Open in full editor */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onOpenInEditor}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none shadow-sm"
        >
          <Code2 className="w-4 h-4" />
          <span>Open in full editor</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
