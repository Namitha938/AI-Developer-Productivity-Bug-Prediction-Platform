import React from 'react';
import {
  LayoutDashboard,
  Code2,
  Bug,
  FolderKanban,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const HeroDashboardMockup: React.FC = () => {
  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden text-left font-sans select-none">
      {/* Browser chrome header */}
      <div className="h-10 bg-muted/50 border-b border-border px-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <div className="px-3 py-1 bg-background border border-border rounded-md text-[11px] font-mono text-muted-foreground max-w-[280px] truncate">
          app.bugpulse.dev/repos/payments-service
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Synced</span>
        </div>
      </div>

      {/* Main dashboard mockup body */}
      <div className="grid grid-cols-12 min-h-[360px]">
        {/* Compact sidebar */}
        <aside className="col-span-3 border-r border-border p-3 space-y-1 bg-muted/20 hidden sm:block">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-foreground">payments-service</div>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            <div className="px-2 py-1.5 rounded-md bg-primary/10 text-primary font-medium flex items-center gap-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </div>
            <div className="px-2 py-1.5 rounded-md hover:bg-muted flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </div>
            <div className="px-2 py-1.5 rounded-md hover:bg-muted flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-3.5 h-3.5" />
                <span>Issues</span>
              </div>
              <span className="text-[10px] font-mono px-1 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold">4</span>
            </div>
            <div className="px-2 py-1.5 rounded-md hover:bg-muted flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Tasks</span>
            </div>
          </div>
        </aside>

        {/* Dashboard contents */}
        <div className="col-span-12 sm:col-span-9 p-4 space-y-4">
          {/* Top repo info row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">Branch audit: main</h4>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  commit d7a9f82
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">38 files checked in 412ms</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold font-mono">
                1 high risk
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold font-mono">
                3 medium
              </span>
            </div>
          </div>

          {/* Files risk table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-medium">
                <tr>
                  <th className="py-2 px-3">File path</th>
                  <th className="py-2 px-3">Bug risk</th>
                  <th className="py-2 px-3 hidden md:table-cell">Primary defect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                    payments/charge.py
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      84/100 High
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-muted-foreground hidden md:table-cell">
                    SQL string interpolation (CWE-89)
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                    auth/session.ts
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      52/100 Medium
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-muted-foreground hidden md:table-cell">
                    Unbounded cache without LRU eviction
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                    workers/sync.go
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      41/100 Medium
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-muted-foreground hidden md:table-cell">
                    Unbuffered channel blocking risk
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                    utils/crypto.ts
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      12/100 Low
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-muted-foreground hidden md:table-cell">
                    No defects identified
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom mini audit strip */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>SARIF 2.1.0 output ready for pull request check</span>
            </span>
            <span className="font-mono">PR #108</span>
          </div>
        </div>
      </div>
    </div>
  );
};
