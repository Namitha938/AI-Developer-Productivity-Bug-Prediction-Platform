import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Download,
  Search,
  X,
  ChevronDown,
  Filter,
} from 'lucide-react';

interface TraceIssue {
  id: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MED' | 'LOW';
  status: 'OPEN' | 'RESOLVED';
  risk: number;
  repository: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  detected: string;
  resolved?: string;
}

const TRACEPOINT_ISSUES: TraceIssue[] = [
  {
    id: 'TP-284',
    title: 'Duplicate payment capture',
    description: 'Race condition in idempotency key validation',
    severity: 'HIGH',
    status: 'OPEN',
    risk: 86,
    repository: 'payments-service',
    assignee: { name: 'Maya Chen', initials: 'MC', color: 'bg-blue-600' },
    detected: 'Oct 18, 2026',
  },
  {
    id: 'TP-279',
    title: 'Unbounded retry loop',
    description: 'Missing backoff ceiling in webhook dispatcher',
    severity: 'HIGH',
    status: 'OPEN',
    risk: 12,
    repository: 'webhook-service',
    assignee: { name: 'Jake Liu', initials: 'JL', color: 'bg-indigo-600' },
    detected: 'Oct 19, 2026',
  },
  {
    id: 'TP-275',
    title: 'N+1 query in user feed pagination',
    description: 'Missing eager loading on activity associations',
    severity: 'MED',
    status: 'OPEN',
    risk: 64,
    repository: 'core-api',
    assignee: { name: 'Aisha Rao', initials: 'AR', color: 'bg-teal-600' },
    detected: 'Oct 16, 2026',
  },
  {
    id: 'TP-271',
    title: 'Stale cache on config reload',
    description: 'TTL not flushed after feature flag update',
    severity: 'MED',
    status: 'OPEN',
    risk: 54,
    repository: 'config-service',
    assignee: { name: 'Maya Chen', initials: 'MC', color: 'bg-blue-600' },
    detected: 'Oct 14, 2026',
  },
  {
    id: 'TP-268',
    title: 'Timezone drift in cron scheduler',
    description: 'DST boundary not accounted in UTC offset',
    severity: 'LOW',
    status: 'OPEN',
    risk: 31,
    repository: 'scheduler-worker',
    assignee: { name: 'Tom Park', initials: 'TP', color: 'bg-amber-600' },
    detected: 'Oct 12, 2026',
  },
  {
    id: 'TP-263',
    title: 'SQL injection in search param',
    description: 'Unsanitised user input in filter clause',
    severity: 'HIGH',
    status: 'RESOLVED',
    risk: 79,
    repository: 'search-service',
    assignee: { name: 'Jake Liu', initials: 'JL', color: 'bg-indigo-600' },
    detected: 'Oct 08, 2026',
    resolved: 'Oct 11, 2026',
  },
  {
    id: 'TP-257',
    title: 'Memory leak in WS connection pool',
    description: 'Socket handles not freed on graceful close',
    severity: 'MED',
    status: 'RESOLVED',
    risk: 58,
    repository: 'realtime-gateway',
    assignee: { name: 'Maya Chen', initials: 'MC', color: 'bg-blue-600' },
    detected: 'Oct 04, 2026',
    resolved: 'Oct 09, 2026',
  },
  {
    id: 'TP-251',
    title: 'Auth token not rotated after pwd reset',
    description: 'Old JWT valid post-password-change',
    severity: 'HIGH',
    status: 'RESOLVED',
    risk: 83,
    repository: 'auth-service',
    assignee: { name: 'Aisha Rao', initials: 'AR', color: 'bg-teal-600' },
    detected: 'Sep 28, 2026',
    resolved: 'Oct 01, 2026',
  },
  {
    id: 'TP-244',
    title: 'Incorrect decimal rounding in invoices',
    description: 'Float precision loss in tax calculation',
    severity: 'MED',
    status: 'RESOLVED',
    risk: 47,
    repository: 'billing-engine',
    assignee: { name: 'Tom Park', initials: 'TP', color: 'bg-amber-600' },
    detected: 'Sep 22, 2026',
    resolved: 'Sep 25, 2026',
  },
];

export const IssuesListPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [repoFilter, setRepoFilter] = useState('All repos');
  const [assigneeFilter, setAssigneeFilter] = useState('All members');

  const filtered = useMemo(() => {
    return TRACEPOINT_ISSUES.filter((item) => {
      if (severityFilter !== 'All' && item.severity !== severityFilter) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (repoFilter !== 'All repos' && item.repository !== repoFilter) return false;
      if (assigneeFilter !== 'All members' && item.assignee.name !== assigneeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.repository.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, severityFilter, statusFilter, repoFilter, assigneeFilter]);

  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('All');
    setStatusFilter('All');
    setRepoFilter('All repos');
    setAssigneeFilter('All members');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bug History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tracepoint AI — Predictive issue tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            Oct 21, 2026
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (5 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Open Predictions */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
            <span>OPEN PREDICTIONS</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">12</span>
            <span className="text-[10px] text-rose-500 font-semibold">↑ +3 wk</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            <span className="text-rose-500">• 2 High</span> · <span className="text-amber-500">4 Med</span> · <span className="text-slate-400">6 Low</span>
          </p>
        </div>

        {/* Avg Resolution */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            AVG RESOLUTION
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">4.2</span>
            <span className="text-xs text-slate-500">days</span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            ↓ -1.1d vs last mo
          </p>
        </div>

        {/* Resolved (Oct) */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            RESOLVED (OCT)
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">8</span>
            <span className="text-xs text-slate-500">issues</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            5 predicted · 3 detected
          </p>
        </div>

        {/* AI Accuracy */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            AI ACCURACY
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">91</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            vs 88% prior quarter
          </p>
        </div>

        {/* False Positives */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            FALSE POSITIVES
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">2</span>
            <span className="text-xs text-slate-400 font-medium">/ 22 flagged</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            9% false positive rate
          </p>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="All">Severity: All</option>
            <option value="HIGH">Severity: High</option>
            <option value="MED">Severity: Med</option>
            <option value="LOW">Severity: Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="OPEN">Status: Open</option>
            <option value="RESOLVED">Status: Resolved</option>
          </select>

          <select
            value={repoFilter}
            onChange={(e) => setRepoFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="All repos">Repository: All repos</option>
            <option value="payments-service">payments-service</option>
            <option value="webhook-service">webhook-service</option>
            <option value="core-api">core-api</option>
            <option value="config-service">config-service</option>
            <option value="scheduler-worker">scheduler-worker</option>
            <option value="search-service">search-service</option>
            <option value="realtime-gateway">realtime-gateway</option>
            <option value="auth-service">auth-service</option>
            <option value="billing-engine">billing-engine</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="All members">Assignee: All members</option>
            <option value="Maya Chen">Maya Chen</option>
            <option value="Jake Liu">Jake Liu</option>
            <option value="Aisha Rao">Aisha Rao</option>
            <option value="Tom Park">Tom Park</option>
          </select>

          <span className="text-slate-500 text-xs px-1">
            Date range: Oct 2026
          </span>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear filters</span>
        </button>
      </div>

      {/* 4. Bug History Table */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 font-medium">ISSUE ID</th>
                <th className="py-2.5 font-medium">DESCRIPTION</th>
                <th className="py-2.5 font-medium">SEVERITY</th>
                <th className="py-2.5 font-medium">STATUS</th>
                <th className="py-2.5 font-medium">RISK</th>
                <th className="py-2.5 font-medium">REPOSITORY</th>
                <th className="py-2.5 font-medium">ASSIGNEE</th>
                <th className="py-2.5 font-medium">DETECTED</th>
                <th className="py-2.5 font-medium">RESOLVED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/issues/${item.id}`)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                    {item.id}
                  </td>
                  <td className="py-3 max-w-xs">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {item.description}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'
                          : item.severity === 'MED'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200'
                      }`}
                    >
                      • {item.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.status === 'OPEN'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200'
                      }`}
                    >
                      • {item.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-semibold">
                    <span className={item.risk > 70 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                    {item.repository}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-full ${item.assignee.color} text-white flex items-center justify-center text-[9px] font-bold`}>
                        {item.assignee.initials}
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.assignee.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">{item.detected}</td>
                  <td className="py-3 text-slate-400">{item.resolved || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span>Showing 9 of 20 issues · 12 open · 8 resolved</span>
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
