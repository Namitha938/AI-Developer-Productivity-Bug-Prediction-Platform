import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Wand2, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RefactorDiffProps {
  suggestion: {
    summary: string;
    beforeCode: string;
    afterCode: string;
    performanceGain: string;
  };
  onApply: () => void;
}

export const RefactorDiff: React.FC<RefactorDiffProps> = ({ suggestion, onApply }) => {
  const [activeTab, setActiveTab] = useState<'split' | 'unified'>('split');
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
    onApply();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // fallback
    }
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">AI Refactoring & Optimization</h4>
            <p className="text-xs text-muted-foreground">{suggestion.summary}</p>
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={applied}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            applied
              ? 'bg-emerald-600 text-white'
              : 'bg-primary hover:bg-primary/90 text-white shadow-primary/25'
          }`}
        >
          {applied ? (
            <>
              <Check className="w-3.5 h-3.5" /> Applied to Editor!
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Apply Refactor Fix
            </>
          )}
        </button>
      </div>

      {/* Gain Banner */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span>
          <strong>Performance Impact:</strong> {suggestion.performanceGain}
        </span>
      </div>

      {/* Diff View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono">
        {/* Before */}
        <div className="border border-rose-500/30 rounded-xl overflow-hidden bg-rose-500/5">
          <div className="bg-rose-500/15 text-rose-600 dark:text-rose-400 px-3 py-1.5 font-bold flex items-center justify-between text-[11px] border-b border-rose-500/20">
            <span>Original Code (Vulnerable / Inefficient)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20">Before</span>
          </div>
          <div className="p-3 overflow-x-auto max-h-64 text-foreground/80 leading-relaxed whitespace-pre font-mono text-[11px]">
            {suggestion.beforeCode}
          </div>
        </div>

        {/* After */}
        <div className="border border-emerald-500/30 rounded-xl overflow-hidden bg-emerald-500/5">
          <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 font-bold flex items-center justify-between text-[11px] border-b border-emerald-500/20">
            <span>Optimized Implementation (Safe & Clean)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20">After</span>
          </div>
          <div className="p-3 overflow-x-auto max-h-64 text-foreground/90 leading-relaxed whitespace-pre font-mono text-[11px]">
            {suggestion.afterCode}
          </div>
        </div>
      </div>
    </div>
  );
};

