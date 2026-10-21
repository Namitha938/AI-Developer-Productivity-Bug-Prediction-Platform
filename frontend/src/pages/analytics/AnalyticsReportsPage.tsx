import React, { useState } from 'react';
import {
  Download,
  Calendar,
  Users,
  GitBranch,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const deliveryQualityTrend = [
  { day: 'Mon', delivery: 42, quality: 35 },
  { day: 'Tue', delivery: 55, quality: 48 },
  { day: 'Wed', delivery: 68, quality: 62 },
  { day: 'Thu', delivery: 50, quality: 45 },
  { day: 'Fri', delivery: 82, quality: 78 },
  { day: 'Sat', delivery: 30, quality: 28 },
  { day: 'Sun', delivery: 22, quality: 20 },
];

export const AnalyticsReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [engineers, setEngineers] = useState('All engineers');
  const [branch, setBranch] = useState('Main + release');

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* 1. Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Productivity analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Acme Engineering · Maya Chen
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="This Quarter">This Quarter</option>
          </select>

          <select
            value={engineers}
            onChange={(e) => setEngineers(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="All engineers">All engineers</option>
            <option value="Maya Chen">Maya Chen</option>
            <option value="Jordan Rivera">Jordan Rivera</option>
          </select>

          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="Main + release">Main + release</option>
            <option value="All branches">All branches</option>
          </select>

          <button
            type="button"
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
            title="Export"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top Stats Row (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Focus this week */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">FOCUS THIS WEEK</span>
            <span className="text-emerald-600 text-xs font-semibold">+12%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pt-1">24.6h</div>
          <p className="text-[11px] text-slate-500 leading-snug">
            18 PRs merged with 94% review confidence.
          </p>
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span>Avg review time: <strong>2.3h</strong></span>
            <span>Code health: <strong>88%</strong></span>
          </div>
        </div>

        {/* Merged PRs */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">MERGED PRS</span>
            <span className="text-blue-600 text-xs font-semibold">18</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pt-1">18</div>
          <p className="text-[11px] text-slate-500 leading-snug">
            7 merged today with zero critical regressions.
          </p>
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span>Avg lines changed: <strong>184</strong></span>
            <span>Confidence: <strong>94%</strong></span>
          </div>
        </div>

        {/* Delivery velocity */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">DELIVERY VELOCITY</span>
            <span className="text-emerald-600 text-xs font-semibold">+8%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pt-1">1.28x</div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Team is shipping faster than the previous 30-day baseline.
          </p>
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span>Cycle time: <strong>3.4d</strong></span>
            <span>Lead time: <strong>1.9d</strong></span>
          </div>
        </div>

        {/* Review coverage */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">REVIEW COVERAGE</span>
            <span className="text-blue-600 text-xs font-semibold">86%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pt-1">86%</div>
          <p className="text-[11px] text-slate-500 leading-snug">
            42 of 49 risky commits were reviewed before merge.
          </p>
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span>Open blockers: <strong>3</strong></span>
            <span>Escalations: <strong>1</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Main Chart & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Delivery vs review quality Chart */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Delivery vs review quality
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Weekly trend across all active repositories
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                  Delivery
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
                  Review quality
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deliveryQualityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="delivery" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="quality" stroke="#14B8A6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent activity */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Recent activity
              </h3>
              <a href="#viewall" className="text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </a>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3 text-xs">
              <div className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono text-xs mt-0.5">
                    PR
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      PR #1842 merged to main
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      2 reviewers · 184 lines changed · 94% confidence
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
                    Merged
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">2m ago</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-xs mt-0.5">
                    &lt;&gt;
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Tracepoint flagged high-risk commit
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      auth-service · 3 critical signals · awaiting review
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200">
                    Review
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">14m ago</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono text-xs mt-0.5">
                    γ
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Release branch created
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      release/v2.4 · 7 commits · 2 reviewers assigned
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">
                    Syncing
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">27m ago</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-mono text-xs mt-0.5">
                    📄
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Weekly report generated
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PDF export ready for engineering leadership review
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Ready
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">1h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Activity Report */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Activity report
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                Demo
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Code changes</span>
                  <span className="font-semibold">12.4k</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Review cycles</span>
                  <span className="font-semibold">86%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '86%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Bug prediction</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Escalations</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1">
              <span className="font-semibold text-blue-900 dark:text-blue-300 block">AI signal</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                Tracepoint flagged 3 risky commits before they reached staging.
              </p>
            </div>
          </div>

          {/* Focus 24.6h Breakdown */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Focus 24.6h
              </h3>
              <span className="text-[11px] text-slate-400">This week</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 w-8">Mon</span>
                <div className="flex-1 mx-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '54%' }} />
                </div>
                <span className="font-mono text-[11px] font-semibold w-8 text-right">3.8h</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 w-8">Tue</span>
                <div className="flex-1 mx-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="font-mono text-[11px] font-semibold w-8 text-right">4.2h</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 w-8">Wed</span>
                <div className="flex-1 mx-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '72%' }} />
                </div>
                <span className="font-mono text-[11px] font-semibold w-8 text-right">5.1h</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 w-8">Thu</span>
                <div className="flex-1 mx-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '64%' }} />
                </div>
                <span className="font-mono text-[11px] font-semibold w-8 text-right">4.5h</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 w-8">Fri</span>
                <div className="flex-1 mx-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="font-mono text-[11px] font-semibold w-8 text-right">7.0h</span>
              </div>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 text-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Weekly summary
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              The team delivered 18 PRs with high review confidence while keeping regression risk below the 30-day baseline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
