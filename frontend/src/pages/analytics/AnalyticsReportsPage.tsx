import React, { useCallback, useEffect, useState } from 'react';
import {
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bug,
  ShieldAlert,
  Activity,
  CalendarDays,
  FolderGit2,
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

import {apiClient} from '../../api/client';

type TimeRange = '7d' | '30d' | '90d';

interface AnalyticsSummary {
  total_issues: number;
  issues_created_in_period: number;
  open_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  average_risk_score: number | null;
}

interface SeverityDistribution {
  severity: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface IssueTrend {
  date: string;
  issues_created: number;
}

interface RecentIssue {
  id: string;
  title: string;
  severity: string;
  status: string;
  risk_score: number;
  created_at: string | null;
  project: string;
}

interface AnalyticsResponse {
  range: TimeRange;
  generated_at: string;
  summary: AnalyticsSummary;
  severity_distribution: SeverityDistribution[];
  status_distribution: StatusDistribution[];
  issue_creation_trend: IssueTrend[];
  recent_issues: RecentIssue[];
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  total_issues: 0,
  issues_created_in_period: 0,
  open_issues: 0,
  in_progress_issues: 0,
  resolved_issues: 0,
  critical_issues: 0,
  high_issues: 0,
  medium_issues: 0,
  low_issues: 0,
  average_risk_score: null,
};

const SEVERITY_STYLES: Record<string, string> = {
  critical:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
  high:
    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
  medium:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  low:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
};

const STATUS_STYLES: Record<string, string> = {
  open:
    'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  in_progress:
    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  resolved:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Unavailable';

  return date.toLocaleString();
};

const formatStatus = (status: string): string =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) =>
    letter.toUpperCase(),
  );

const downloadCsv = (analytics: AnalyticsResponse) => {
  const rows: string[][] = [
    ['BugPulse AI Analytics Report'],
    ['Reporting period', analytics.range],
    ['Generated at', analytics.generated_at],
    [],
    ['Summary Metric', 'Value'],
    ['Total issues', String(analytics.summary.total_issues)],
    [
      'Issues created in period',
      String(analytics.summary.issues_created_in_period),
    ],
    ['Open issues', String(analytics.summary.open_issues)],
    ['In progress issues', String(analytics.summary.in_progress_issues)],
    ['Resolved issues', String(analytics.summary.resolved_issues)],
    ['Critical issues', String(analytics.summary.critical_issues)],
    ['High severity issues', String(analytics.summary.high_issues)],
    ['Medium severity issues', String(analytics.summary.medium_issues)],
    ['Low severity issues', String(analytics.summary.low_issues)],
    [
      'Average risk score',
      analytics.summary.average_risk_score === null
        ? 'Unavailable'
        : String(analytics.summary.average_risk_score),
    ],
    [],
    ['Severity', 'Count'],
    ...analytics.severity_distribution.map((item) => [
      item.severity,
      String(item.count),
    ]),
    [],
    ['Status', 'Count'],
    ...analytics.status_distribution.map((item) => [
      item.status,
      String(item.count),
    ]),
    [],
    ['Date', 'Issues Created'],
    ...analytics.issue_creation_trend.map((item) => [
      item.date,
      String(item.issues_created),
    ]),
    [],
    [
      'Issue ID',
      'Title',
      'Project',
      'Severity',
      'Status',
      'Risk Score',
      'Created At',
    ],
    ...analytics.recent_issues.map((issue) => [
      issue.id,
      issue.title,
      issue.project,
      issue.severity,
      issue.status,
      String(issue.risk_score),
      issue.created_at ?? '',
    ]),
  ];

  // Escape values correctly so commas and quotation marks don't break CSV.
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${value.replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `bugpulse-analytics-${analytics.range}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}> = ({ label, value, description, icon, iconClass }) => (
  <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
        {label}
      </span>

      <span className={`p-2 rounded-lg ${iconClass}`}>
        {icon}
      </span>
    </div>

    <div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
        {description}
      </p>
    </div>
  </div>
);

export const AnalyticsReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await apiClient.get<AnalyticsResponse>(
          '/analytics',
          {
            params: {
              range: timeRange,
            },
          },
        );

        setAnalytics(response.data);
      } catch (err: unknown) {
        const errorMessage =
          typeof err === 'object' &&
          err !== null &&
          'response' in err
            ? (() => {
                const response = (
                  err as {
                    response?: {
                      status?: number;
                      data?: { detail?: string };
                    };
                  }
                ).response;

                if (response?.status === 401) {
                  return 'Your session may have expired. Please sign in again.';
                }

                if (response?.status === 503) {
                  return 'The analytics service or database is not configured.';
                }

                return (
                  response?.data?.detail ??
                  'Unable to load analytics. Please try again.'
                );
              })()
            : 'Unable to connect to the analytics service. Check your connection and try again.';

        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeRange],
  );

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = analytics?.summary ?? EMPTY_SUMMARY;

  const totalSeverityIssues =
    analytics?.severity_distribution.reduce(
      (total, item) => total + item.count,
      0,
    ) ?? 0;

  const totalStatusIssues =
    analytics?.status_distribution.reduce(
      (total, item) => total + item.count,
      0,
    ) ?? 0;

  const maxSeverityCount = Math.max(
    1,
    ...(analytics?.severity_distribution.map((item) => item.count) ?? [0]),
  );

  const maxStatusCount = Math.max(
    1,
    ...(analytics?.status_distribution.map((item) => item.count) ?? [0]),
  );

  const hasIssues = summary.total_issues > 0;

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Header and reporting controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bug analytics
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real issue insights from your BugPulse AI workspace.
          </p>

          {analytics && (
            <p className="text-[11px] text-slate-400 mt-1">
              Last updated: {formatDateTime(analytics.generated_at)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="analytics-range"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <CalendarDays className="w-4 h-4 text-slate-400" />

            <select
              id="analytics-range"
              value={timeRange}
              onChange={(event) =>
                setTimeRange(event.target.value as TimeRange)
              }
              className="text-xs bg-transparent text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => void fetchAnalytics(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => analytics && downloadCsv(analytics)}
            disabled={!analytics || loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs disabled:opacity-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />

            <div>
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                Could not load analytics
              </p>

              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void fetchAnalytics(true)}
            className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {/* Initial loading state */}
      {loading && !analytics ? (
        <div
          role="status"
          className="p-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] flex flex-col items-center justify-center text-center"
        >
          <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mb-3" />

          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            Loading your analytics
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Retrieving issue data from your workspace...
          </p>
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              label="Total issues"
              value={summary.total_issues}
              description="All recorded issues in your workspace"
              icon={<Bug className="w-4 h-4" />}
              iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            />

            <MetricCard
              label="Open issues"
              value={summary.open_issues}
              description={`${summary.in_progress_issues} currently in progress`}
              icon={<Clock className="w-4 h-4" />}
              iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
            />

            <MetricCard
              label="High severity"
              value={summary.high_issues}
              description={`${summary.critical_issues} critical issues recorded`}
              icon={<ShieldAlert className="w-4 h-4" />}
              iconClass="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
            />

            <MetricCard
              label="Average risk score"
              value={
                summary.average_risk_score === null
                  ? 'N/A'
                  : `${summary.average_risk_score}/100`
              }
              description="Average of available numeric risk scores"
              icon={<Activity className="w-4 h-4" />}
              iconClass="bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
            />
          </div>

          {/* Reporting period summary */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Issues created in the selected period
              </p>

              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {summary.issues_created_in_period}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CalendarDays className="w-4 h-4" />

              {timeRange === '7d'
                ? 'Last 7 days'
                : timeRange === '30d'
                  ? 'Last 30 days'
                  : 'Last 90 days'}
            </div>
          </div>

          {!hasIssues && (
            <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1322] text-center">
              <Bug className="w-8 h-8 text-slate-400 mx-auto mb-3" />

              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                No issues recorded yet
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Analytics will appear here when issues are recorded in your
                BugPulse AI workspace. No sample metrics are being displayed.
              </p>
            </div>
          )}

          {/* Charts and distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Issue creation trend */}
            <section className="lg:col-span-8 p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Issue creation trend
                </h2>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Number of issues created per day during the selected period.
                </p>
              </div>

              {analytics?.issue_creation_trend.length ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.issue_creation_trend}
                      margin={{
                        top: 10,
                        right: 12,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#64748b"
                        opacity={0.2}
                      />

                      <XAxis
                        dataKey="date"
                        tickFormatter={(date: string) => {
                          const parsed = new Date(
                            `${date}T12:00:00`,
                          );

                          return parsed.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          });
                        }}
                        tick={{
                          fontSize: 10,
                          fill: '#94A3B8',
                        }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                      />

                      <YAxis
                        allowDecimals={false}
                        domain={[0, 'auto']}
                        tick={{
                          fontSize: 10,
                          fill: '#94A3B8',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        labelFormatter={(date) =>
                          formatDate(String(date))
                        }
                        formatter={(value) => [
                          value ?? 0,
                          'Issues created',
                        ]}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="issues_created"
                        name="Issues created"
                        stroke="#3B82F6"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-xs text-slate-500">
                  No trend data is available for this period.
                </p>
              )}
            </section>

            {/* Severity distribution */}
            <section className="lg:col-span-4 p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div>
                <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Severity distribution
                </h2>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Recorded issues grouped by severity.
                </p>
              </div>

              <div className="space-y-4">
                {analytics?.severity_distribution.map((item) => (
                  <div key={item.severity}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-600 dark:text-slate-300 capitalize">
                        {item.severity}
                      </span>

                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.count}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.severity === 'critical'
                            ? 'bg-rose-600'
                            : item.severity === 'high'
                              ? 'bg-orange-500'
                              : item.severity === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${
                            (item.count / maxSeverityCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Total categorized issues
                </span>

                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {totalSeverityIssues}
                </span>
              </div>
            </section>
          </div>

          {/* Status distribution */}
          <section className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                Issue status
              </h2>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Current status of all recorded issues.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analytics?.status_distribution.map((item) => {
                const statusIcon =
                  item.status === 'resolved' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : item.status === 'in_progress' ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  );

                return (
                  <div
                    key={item.status}
                    className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatStatus(item.status)}
                      </span>

                      <span className="text-slate-400">
                        {statusIcon}
                      </span>
                    </div>

                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {item.count}
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            totalStatusIssues > 0
                              ? (item.count / totalStatusIssues) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent issues */}
          <section className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Recent issues
                </h2>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Latest issues returned by your backend.
                </p>
              </div>

              <span className="text-[11px] text-slate-400 shrink-0">
                {analytics?.recent_issues.length ?? 0} shown
              </span>
            </div>

            {analytics?.recent_issues.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics.recent_issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        <Bug className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">
                          {issue.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <FolderGit2 className="w-3 h-3" />
                            {issue.project || 'Unassigned project'}
                          </span>

                          <span className="text-slate-300 dark:text-slate-700">
                            ·
                          </span>

                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatDate(issue.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end pl-11 sm:pl-0">
                      <span
                        className={`px-2 py-1 rounded-md border text-[10px] font-semibold capitalize ${
                          SEVERITY_STYLES[issue.severity] ??
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {issue.severity}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold ${
                          STATUS_STYLES[issue.status] ??
                          'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {formatStatus(issue.status)}
                      </span>

                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Risk: {issue.risk_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Bug className="w-7 h-7 text-slate-400 mx-auto mb-2" />

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No recent issues to display.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};