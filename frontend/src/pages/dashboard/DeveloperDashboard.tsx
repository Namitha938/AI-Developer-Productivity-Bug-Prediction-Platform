import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  AlertTriangle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  ExternalLink,
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

const trendData = [
  { date: 'Sep 21', quality: 28, maintainability: 35 },
  { date: 'Sep 25', quality: 26, maintainability: 38 },
  { date: 'Sep 28', quality: 44, maintainability: 46 },
  { date: 'Oct 02', quality: 40, maintainability: 48 },
  { date: 'Oct 05', quality: 58, maintainability: 54 },
  { date: 'Oct 08', quality: 56, maintainability: 58 },
  { date: 'Oct 12', quality: 68, maintainability: 62 },
  { date: 'Oct 15', quality: 65, maintainability: 66 },
  { date: 'Oct 19', quality: 84, maintainability: 74 },
];

export const DeveloperDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Maya';

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good morning, {firstName}.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Wednesday, October 21 · Here's where your code and focus stand.
          </p>
        </div>

        <button
          onClick={() => navigate('/editor')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New analysis</span>
        </button>
      </div>

      {/* 2. Critical Alert Banner */}
      <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-rose-900 dark:text-rose-200">
            Your attention is needed in payments-service
          </span>
          <p className="text-rose-700 dark:text-rose-300/90 mt-0.5">
            2 high-risk predictions on main. Review the payment capture path before the next release.
          </p>
        </div>
      </div>

      {/* 3. Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Code quality</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">87</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
            <span>↑ 6 points this month</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Open predictions</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">12</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span className="text-rose-500">2 high</span> · <span className="text-amber-500">4 medium</span> · <span className="text-slate-400">6 low</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Focus time this week</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">24.6 h</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            <span>↑ 12% vs. last week</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pull requests merged</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">18</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            <span>↑ 4 vs. last week</span>
          </p>
        </div>
      </div>

      {/* 4. Middle Section: Chart + Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Quality Trend Chart (2 columns) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Code quality trend
                </h3>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-teal-500 inline-block" />
                    Quality score
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-blue-500 inline-block" />
                    Maintainability
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">Last 30 days</span>
            </div>

            <div className="h-56 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="quality" stroke="#14B8A6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="maintainability" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
            Illustrative analytics · Aggregated daily · UTC
          </div>
        </div>

        {/* Your Priorities (1 column) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Your priorities
              </h3>
              <span className="text-xs text-slate-400">3 assigned</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <Link
                to="/issues/TP-284"
                className="py-3 flex items-start justify-between gap-2 block hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors -mx-2 px-2 rounded-lg"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    TP-284 · payments-service
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    Duplicate payment capture
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                  High
                </span>
              </Link>

              <Link
                to="/issues/TP-279"
                className="py-3 flex items-start justify-between gap-2 block hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors -mx-2 px-2 rounded-lg"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    TP-279 · payments-service
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    Unbounded retry loop
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                  High
                </span>
              </Link>

              <Link
                to="/issues/TP-276"
                className="py-3 flex items-start justify-between gap-2 block hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors -mx-2 px-2 rounded-lg"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    TP-276 · payments-service
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    N+1 query in order resolver
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                  Medium
                </span>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/issues"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-between"
            >
              <span>View all assigned issues</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Your Active Projects Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Your active projects
          </h3>
          <Link
            to="/projects"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            All projects →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 font-medium">PROJECT / REPOSITORY</th>
                <th className="py-2.5 font-medium">QUALITY</th>
                <th className="py-2.5 font-medium">RISK</th>
                <th className="py-2.5 font-medium">LATEST ANALYSIS</th>
                <th className="py-2.5 font-medium">NEXT MILESTONE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 font-medium text-slate-900 dark:text-white">
                  Payments reliability / payments-service
                </td>
                <td className="py-3 text-slate-700 dark:text-slate-300">
                  82 / 100
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                    High
                  </span>
                </td>
                <td className="py-3 text-slate-500">Today, 09:42</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">Release v2.8 · Oct 24</td>
              </tr>

              <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 font-medium text-slate-900 dark:text-white">
                  Customer experience / atlas-web
                </td>
                <td className="py-3 text-slate-700 dark:text-slate-300">
                  91 / 100
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                    Low
                  </span>
                </td>
                <td className="py-3 text-slate-500">Today, 09:30</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">Checkout redesign · Oct 28</td>
              </tr>

              <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 font-medium text-slate-900 dark:text-white">
                  Event pipeline / event-worker
                </td>
                <td className="py-3 text-slate-700 dark:text-slate-300">
                  88 / 100
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    Medium
                  </span>
                </td>
                <td className="py-3 text-slate-500">Today, 08:55</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">Queue migration · Oct 30</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Showing 3 records</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
              ← Prev
            </button>
            <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              3
            </button>
            <button className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
