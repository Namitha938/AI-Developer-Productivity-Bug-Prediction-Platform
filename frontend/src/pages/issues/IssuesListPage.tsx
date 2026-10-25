
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, X } from 'lucide-react';
import { useIssueStore } from '../../stores/issueStore';
import type { Issue, IssueStatus, Severity } from '../../types';

const PAGE_SIZE = 10;

const formatDate = (value?: string) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-600',
    'bg-indigo-600',
    'bg-teal-600',
    'bg-amber-600',
    'bg-violet-600',
    'bg-rose-600',
  ];

  const hash = [...name].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  return colors[hash % colors.length];
};

const severityLabel = (severity: Severity) =>
  severity === 'medium'
    ? 'MED'
    : severity.toUpperCase();

const statusLabel = (status: IssueStatus) =>
  status === 'in_progress'
    ? 'IN PROGRESS'
    : status.toUpperCase();

const csvEscape = (value: unknown) =>
  `"${String(value ?? '').replace(/"/g, '""')}"`;

export const IssuesListPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    issues,
    isLoading,
    error,
    loadIssues,
    setSelectedIssue,
    clearError,
  } = useIssueStore();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [repoFilter, setRepoFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues]);

  const repositories = useMemo(
    () =>
      [...new Set(issues.map((issue) => issue.project).filter(Boolean))]
        .sort(),
    [issues]
  );

  const assignees = useMemo(
    () =>
      [
        ...new Set(
          issues
            .filter((issue) => issue.assignee?.id)
            .map((issue) => issue.assignee.name)
        ),
      ].sort(),
    [issues]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return issues.filter((issue) => {
      if (
        severityFilter !== 'all' &&
        issue.severity !== severityFilter
      ) {
        return false;
      }

      if (
        statusFilter !== 'all' &&
        issue.status !== statusFilter
      ) {
        return false;
      }

      if (
        repoFilter !== 'all' &&
        issue.project !== repoFilter
      ) {
        return false;
      }

      if (
        assigneeFilter !== 'all' &&
        issue.assignee?.name !== assigneeFilter
      ) {
        return false;
      }

      if (query) {
        const searchable = [
          issue.id,
          issue.title,
          issue.description,
          issue.project,
          issue.fileLocation,
          issue.assignee?.name,
          ...(issue.tags ?? []),
        ]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [
    issues,
    search,
    severityFilter,
    statusFilter,
    repoFilter,
    assigneeFilter,
  ]);

  useEffect(() => {
    setPage(1);
  }, [search, severityFilter, statusFilter, repoFilter, assigneeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageIssues = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openCount = issues.filter(
    (issue) => issue.status === 'open'
  ).length;

  const resolvedIssues = issues.filter(
    (issue) => issue.status === 'resolved'
  );

  const currentMonth = new Date();
  const resolvedThisMonth = resolvedIssues.filter((issue) => {
    const date = new Date(issue.updatedAt);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  }).length;

  const averageResolutionDays = useMemo(() => {
    const durations = resolvedIssues
      .map((issue) => {
        const created = new Date(issue.createdAt).getTime();
        const updated = new Date(issue.updatedAt).getTime();

        if (
          !Number.isFinite(created) ||
          !Number.isFinite(updated) ||
          updated < created
        ) {
          return null;
        }

        return (updated - created) / (1000 * 60 * 60 * 24);
      })
      .filter((value): value is number => value !== null);

    if (!durations.length) return null;

    return durations.reduce((sum, days) => sum + days, 0) /
      durations.length;
  }, [resolvedIssues]);

  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setRepoFilter('all');
    setAssigneeFilter('all');
    setPage(1);
  };

  const exportCsv = () => {
    const headers = [
      'Issue ID',
      'Title',
      'Description',
      'Severity',
      'Status',
      'Risk Score',
      'Project',
      'File Location',
      'Line Range',
      'Assignee',
      'Detected',
      'Last Updated',
      'Tags',
    ];

    const rows = filtered.map((issue) => [
      issue.id,
      issue.title,
      issue.description,
      issue.severity,
      issue.status,
      issue.riskScore,
      issue.project,
      issue.fileLocation,
      issue.lineRange,
      issue.assignee?.name,
      issue.createdAt,
      issue.updatedAt,
      issue.tags.join(', '),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'bug-history.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bug History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Bug prediction and issue tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            {new Date().toLocaleDateString(undefined, {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}
          </span>

          <button
            type="button"
            onClick={exportCsv}
            disabled={!filtered.length}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics from actual issue records */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            OPEN ISSUES
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {isLoading ? '—' : openCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {issues.filter((issue) => issue.status === 'in_progress').length} in progress
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            AVG RESOLUTION
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {averageResolutionDays === null
                ? '—'
                : averageResolutionDays.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">days</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Based on issue timestamps
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            RESOLVED THIS MONTH
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '—' : resolvedThisMonth}
            </span>
            <span className="text-xs text-slate-500">issues</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Based on last-updated dates
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            AI ACCURACY
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            N/A
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            No evaluation metric available
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            FALSE POSITIVES
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            N/A
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Requires reviewed predictions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Severity: All</option>
            <option value="critical">Severity: Critical</option>
            <option value="high">Severity: High</option>
            <option value="medium">Severity: Medium</option>
            <option value="low">Severity: Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Status: All</option>
            <option value="open">Status: Open</option>
            <option value="in_progress">Status: In progress</option>
            <option value="resolved">Status: Resolved</option>
          </select>

          <select
            value={repoFilter}
            onChange={(event) => setRepoFilter(event.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Project: All</option>
            {repositories.map((repository) => (
              <option key={repository} value={repository}>
                {repository}
              </option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Assignee: All</option>
            {assignees.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear filters</span>
        </button>
      </div>

      {/* Errors */}
      {error && (
        <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-sm text-rose-700 dark:text-rose-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Issue table */}
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
                <th className="py-2.5 font-medium">PROJECT</th>
                <th className="py-2.5 font-medium">ASSIGNEE</th>
                <th className="py-2.5 font-medium">DETECTED</th>
                <th className="py-2.5 font-medium">RESOLVED</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && issues.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Loading issues from your account…
                  </td>
                </tr>
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    {issues.length === 0
                      ? 'No issues found. Issues saved from your analyses will appear here.'
                      : 'No issues match your current filters.'}
                  </td>
                </tr>
              )}

              {pageIssues.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    setSelectedIssue(item);
                    navigate(`/issues/${encodeURIComponent(item.id)}`);
                  }}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 pr-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                    {item.id}
                  </td>

                  <td className="py-3 pr-3 max-w-xs">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {item.description || item.fileLocation || 'No description provided'}
                    </span>
                  </td>

                  <td className="py-3 pr-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        item.severity === 'critical' || item.severity === 'high'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                          : item.severity === 'medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                      }`}
                    >
                      • {severityLabel(item.severity)}
                    </span>
                  </td>

                  <td className="py-3 pr-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        item.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                          : item.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      • {statusLabel(item.status)}
                    </span>
                  </td>

                  <td className="py-3 pr-3 font-mono font-semibold">
                    <span
                      className={
                        item.riskScore > 70
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }
                    >
                      {item.riskScore}
                    </span>
                  </td>

                  <td className="py-3 pr-3 font-mono text-slate-600 dark:text-slate-400">
                    {item.project || '—'}
                  </td>

                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-5 h-5 rounded-full ${
                          getAvatarColor(item.assignee?.name ?? '')
                        } text-white flex items-center justify-center text-[9px] font-bold`}
                      >
                        {getInitials(item.assignee?.name ?? 'Unassigned')}
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 pr-3 whitespace-nowrap text-slate-400">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="py-3 whitespace-nowrap text-slate-400">
                    {item.status === 'resolved'
                      ? formatDate(item.updatedAt)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Functional pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span>
            {filtered.length === 0
              ? 'Showing 0 issues'
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                  currentPage * PAGE_SIZE,
                  filtered.length
                )} of ${filtered.length} issues`}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              ← Prev
            </button>

            <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
