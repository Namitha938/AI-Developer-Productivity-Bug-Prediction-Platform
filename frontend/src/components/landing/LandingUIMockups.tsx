import React from 'react';
import {
  Bug,
  CheckCircle2,
  Clock,
  GitBranch,
  Github,
  AlertCircle,
  FileCode,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Check,
} from 'lucide-react';

/**
 * Real UI crop for Step 1: Connect a repository or paste code
 */
export const StepOneMockup: React.FC = () => (
  <div className="w-full rounded-xl border border-border bg-card p-4 shadow-sm text-left select-none">
    <div className="flex items-center justify-between pb-3 border-b border-border">
      <div className="flex items-center gap-2">
        <Github className="w-4 h-4 text-foreground" />
        <span className="text-xs font-semibold text-foreground">Select repository</span>
      </div>
      <span className="text-[11px] font-mono text-muted-foreground">main branch</span>
    </div>

    <div className="py-3 space-y-2">
      <div className="p-2.5 rounded-lg border border-primary/40 bg-primary/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono font-medium text-foreground">payments-service</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">Active</span>
      </div>
      <div className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5" />
          <span className="font-mono">auth-service</span>
        </div>
        <span className="text-[10px]">Synced 2h ago</span>
      </div>
    </div>

    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
      <span>Auto-scan enabled on git push</span>
      <span className="font-medium text-primary">Webhook active</span>
    </div>
  </div>
);

/**
 * Real UI crop for Step 2: Get a risk score with an explanation
 */
export const StepTwoMockup: React.FC = () => (
  <div className="w-full rounded-xl border border-border bg-card p-4 shadow-sm text-left select-none space-y-3">
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs font-semibold text-foreground">payments/charge.py:14</span>
      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400">
        84/100 High risk
      </span>
    </div>

    <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1.5 text-xs">
      <p className="font-medium text-foreground">SQL string interpolation detected</p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        The user parameter is concatenated directly into the query without parameter placeholders, allowing arbitrary query modification.
      </p>
    </div>

    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
      <span>CWE-89 reference</span>
      <span className="font-mono text-foreground font-medium">Confidence: 98%</span>
    </div>
  </div>
);

/**
 * Real UI crop for Step 3: Track and fix issues
 */
export const StepThreeMockup: React.FC = () => (
  <div className="w-full rounded-xl border border-border bg-card p-4 shadow-sm text-left select-none space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono font-semibold text-muted-foreground">ISSUE-1042</span>
        <span className="text-xs font-medium text-foreground">Unclosed connection pool</span>
      </div>
      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
        <Check className="w-3 h-3" /> Resolved
      </span>
    </div>

    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
      <span className="text-emerald-700 dark:text-emerald-400 font-medium block">
        Fix applied to branch feature/db-pool
      </span>
      <span className="text-[11px] text-muted-foreground">
        Acquired connections now release deterministically in async context block.
      </span>
    </div>

    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
      <span>Merged into main in PR #108</span>
      <span className="font-mono text-foreground">0 leaks remaining</span>
    </div>
  </div>
);

/**
 * Feature 1: Bug prediction screenshot crop
 */
export const FeatureBugPredictionMockup: React.FC = () => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-left font-sans select-none space-y-3">
    <div className="flex items-center justify-between border-b border-border pb-2.5 text-xs">
      <span className="font-mono text-foreground font-semibold">Diagnostic review</span>
      <span className="text-muted-foreground font-mono text-[11px]">payments/charge.py</span>
    </div>

    <div className="space-y-2 text-xs">
      <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 space-y-1">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono text-[11px]">
            Line 14: SQL Injection (CWE-89)
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
            Critical
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Dynamic f-string formatting exposes query parameter directly to client control.
        </p>
      </div>

      <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono text-[11px]">
            Line 18: Resource leak
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
            High
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Acquired socket connection is appended to global list without release in finally block.
        </p>
      </div>
    </div>
  </div>
);

/**
 * Feature 2: Code quality and complexity crop
 */
export const FeatureComplexityMockup: React.FC = () => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-left font-sans select-none space-y-3">
    <div className="flex items-center justify-between border-b border-border pb-2.5 text-xs">
      <span className="font-semibold text-foreground">Code complexity analysis</span>
      <span className="text-muted-foreground font-mono text-[11px]">SEI standard</span>
    </div>

    <div className="grid grid-cols-3 gap-2 text-center text-xs">
      <div className="p-3 bg-muted/40 rounded-lg border border-border">
        <span className="text-[10px] text-muted-foreground block">Cyclomatic</span>
        <span className="text-base font-bold font-mono text-foreground mt-0.5 block">14</span>
        <span className="text-[10px] text-amber-600 dark:text-amber-400">High branch</span>
      </div>
      <div className="p-3 bg-muted/40 rounded-lg border border-border">
        <span className="text-[10px] text-muted-foreground block">Cognitive</span>
        <span className="text-base font-bold font-mono text-foreground mt-0.5 block">18</span>
        <span className="text-[10px] text-muted-foreground">Nesting strain</span>
      </div>
      <div className="p-3 bg-muted/40 rounded-lg border border-border">
        <span className="text-[10px] text-muted-foreground block">Maintainability</span>
        <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">74/100</span>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Moderate</span>
      </div>
    </div>

    <div className="p-2.5 rounded-lg bg-muted/30 border border-border flex justify-between text-xs text-muted-foreground">
      <span>Estimated time complexity: <strong className="text-foreground font-mono">O(N²)</strong></span>
      <span>Space: <strong className="text-foreground font-mono">O(N)</strong></span>
    </div>
  </div>
);

/**
 * Feature 3: Issue tracker crop
 */
export const FeatureIssueTrackerMockup: React.FC = () => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-left font-sans select-none space-y-2.5">
    <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
      <span className="font-semibold text-foreground">Tracked issues</span>
      <div className="flex gap-1.5 text-[11px]">
        <span className="px-2 py-0.5 rounded bg-muted text-foreground font-medium">All (4)</span>
        <span className="px-2 py-0.5 rounded text-muted-foreground">Open</span>
      </div>
    </div>

    <div className="divide-y divide-border text-xs">
      <div className="py-2 flex items-center justify-between">
        <div>
          <span className="font-mono text-[11px] text-muted-foreground block">ISSUE-1042</span>
          <span className="font-medium text-foreground">SQL injection in charge handler</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold">
          Critical
        </span>
      </div>
      <div className="py-2 flex items-center justify-between">
        <div>
          <span className="font-mono text-[11px] text-muted-foreground block">ISSUE-1043</span>
          <span className="font-medium text-foreground">Memory leak in WebSocket client</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">
          High
        </span>
      </div>
    </div>
  </div>
);

/**
 * Feature 4: Team Kanban board crop
 */
export const FeatureKanbanMockup: React.FC = () => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-left font-sans select-none space-y-2.5">
    <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
      <span className="font-semibold text-foreground">Refactoring sprint board</span>
      <span className="text-[11px] text-muted-foreground font-mono">Sprint 14</span>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="bg-muted/30 p-2.5 rounded-lg border border-border space-y-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase">In progress (1)</span>
        <div className="p-2 rounded bg-card border border-border shadow-2xs space-y-1">
          <p className="font-medium text-foreground text-[11px]">Convert raw SQL to prepared statement</p>
          <span className="text-[10px] font-mono text-muted-foreground block">payments/charge.py</span>
        </div>
      </div>

      <div className="bg-muted/30 p-2.5 rounded-lg border border-border space-y-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase">Done (2)</span>
        <div className="p-2 rounded bg-card border border-border shadow-2xs space-y-1 opacity-80">
          <p className="font-medium text-foreground text-[11px]">Add asyncpg connection pool wrapper</p>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block">Merged</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Feature 5: Productivity analytics crop
 */
export const FeatureAnalyticsMockup: React.FC = () => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-left font-sans select-none space-y-3">
    <div className="flex items-center justify-between border-b border-border pb-2.5 text-xs">
      <span className="font-semibold text-foreground">Review velocity trend</span>
      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">58% faster turnaround</span>
    </div>

    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="p-3 bg-muted/40 rounded-lg border border-border">
        <span className="text-[10px] text-muted-foreground block">Average review time</span>
        <span className="text-lg font-bold font-mono text-foreground mt-0.5 block">5.9 hours</span>
        <span className="text-[10px] text-muted-foreground">Down from 14.2h</span>
      </div>
      <div className="p-3 bg-muted/40 rounded-lg border border-border">
        <span className="text-[10px] text-muted-foreground block">Defects caught in CI</span>
        <span className="text-lg font-bold font-mono text-primary mt-0.5 block">45 bugs</span>
        <span className="text-[10px] text-muted-foreground">This month</span>
      </div>
    </div>
  </div>
);
