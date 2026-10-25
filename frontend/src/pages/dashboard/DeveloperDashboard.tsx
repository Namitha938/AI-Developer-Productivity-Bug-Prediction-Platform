
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../api/client';
import {
  AlertTriangle,
  Plus,
  RefreshCw,
  FileCode2,
  ShieldAlert,
  Activity,
  Clock,
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

type AnalysisRecord = {
  id: string;
  filename?: string;
  language?: string;
  timestamp?: string | number;
  executionTimeMs?: number;
  bug_risk_score?: number | null;
  risk_category?: string | null;
  predicted_bug_prone?: boolean | null;
  mlPrediction?: {
    bug_risk_score?: number | null;
    risk_category?: string | null;
    predicted_bug_prone?: boolean | null;
  } | null;
  result?: Record<string, unknown> | null;
};

type HistoryResponse = {
  items: AnalysisRecord[];
  nextCursor?: string | null;
  hasMore?: boolean;
};

function getRiskScore(record: AnalysisRecord): number | null {
  const raw = record.bug_risk_score ?? record.mlPrediction?.bug_risk_score;

  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null;

  return Math.max(0, Math.min(100, raw));
}

function getRiskCategory(record: AnalysisRecord): string {
  const explicit =
    record.risk_category ??
    record.mlPrediction?.risk_category;

  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim().toLowerCase();
  }

  const score = getRiskScore(record);

  if (score === null) return 'unknown';
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

function formatDate(value?: string | number): string {
  if (value === undefined || value === null) return 'Unknown';

  const date =
    typeof value === 'number'
      ? new Date(value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) return 'Unknown';

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
    
}

function riskClasses(category: string): string {
  switch (category) {
    case 'critical':
    case 'high':
      return 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900/50';
    case 'medium':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
    case 'low':
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

export const DeveloperDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name?.trim()
    ? user.name.trim().split(/\s+/)[0]
    : 'Developer';

  const loadAnalyses = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await apiClient.get<HistoryResponse>(
        '/analysis/history',
        { params: { limit: 100 } }
      );

      const records = Array.isArray(response.data.items)
        ? response.data.items
        : [];

      setAnalyses(records);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load your analysis history.';

      setError(
        message ||
          'Unable to load your analysis history. Check the backend connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalyses();
  }, [loadAnalyses]);

  const metrics = useMemo(() => {
    const scored = analyses
      .map((record) => ({
        record,
        score: getRiskScore(record),
        category: getRiskCategory(record),
      }));

    const highRisk = scored.filter(
      (item) =>
        item.category === 'critical' ||
        item.category === 'high'
    ).length;

    const mediumRisk = scored.filter(
      (item) => item.category === 'medium'
    ).length;

    const lowRisk = scored.filter(
      (item) => item.category === 'low'
    ).length;

    const availableScores = scored
      .map((item) => item.score)
      .filter((score): score is number => score !== null);

    const averageRisk = availableScores.length
      ? Math.round(
          availableScores.reduce((sum, score) => sum + score, 0) /
            availableScores.length
        )
      : null;

    return {
      total: analyses.length,
      highRisk,
      mediumRisk,
      lowRisk,
      averageRisk,
      scoredCount: availableScores.length,
    };
  }, [analyses]);

  const trendData = useMemo(() => {
    const chronological = [...analyses]
      .filter((record) => getRiskScore(record) !== null)
      .sort((a, b) => {
        const aTime = new Date(a.timestamp ?? 0).getTime();
        const bTime = new Date(b.timestamp ?? 0).getTime();
        return aTime - bTime;
      });

    return chronological.slice(-14).map((record) => ({
      date: record.timestamp
        ? new Date(record.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
        : 'Unknown',
      risk: getRiskScore(record),
      filename: record.filename || 'Unnamed file',
    }));
  }, [analyses]);

  const latestAnalyses = useMemo(() => {
    return [...analyses].sort((a, b) => {
      const aTime = new Date(a.timestamp ?? 0).getTime();
      const bTime = new Date(b.timestamp ?? 0).getTime();
      return bTime - aTime;
    });
  }, [analyses]);

  const latestHighRisk = latestAnalyses.filter((record) => {
    const category = getRiskCategory(record);
    return category === 'critical' || category === 'high';
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {firstName}.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your code analysis history and predicted bug risk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadAnalyses(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
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
            onClick={() => navigate('/editor')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New analysis
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                Couldn't load your analysis history
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadAnalyses(true)}
            className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Risk alert based on actual history */}
      {!loading && !error && latestHighRisk.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-rose-900 dark:text-rose-200">
              High-risk predictions need review
            </span>
            <p className="text-rose-700 dark:text-rose-300 mt-0.5">
              {latestHighRisk.length} of your saved analyses have a high
              or critical risk category. Review the results before relying
              on the code.
            </p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Saved analyses"
          value={loading ? '—' : metrics.total}
          description="Your recorded analysis runs"
          icon={<FileCode2 className="w-4 h-4" />}
        />

        <MetricCard
          label="High-risk predictions"
          value={loading ? '—' : metrics.highRisk}
          description="High and critical risk categories"
          icon={<ShieldAlert className="w-4 h-4" />}
        />

        <MetricCard
          label="Medium-risk predictions"
          value={loading ? '—' : metrics.mediumRisk}
          description="Analyses categorized as medium risk"
          icon={<Activity className="w-4 h-4" />}
        />

        <MetricCard
          label="Average predicted risk"
          value={
            loading
              ? '—'
              : metrics.averageRisk === null
                ? 'N/A'
                : `${metrics.averageRisk}/100`
          }
          description={
            loading
              ? 'Loading analysis records'
              : `${metrics.scoredCount} analyses with available risk scores`
          }
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Trend and risk breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Predicted bug-risk trend
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Based on your latest saved analyses with risk scores
              </p>
            </div>
            <span className="text-[11px] text-slate-400">
              Latest {trendData.length}
            </span>
          </div>

          <div className="h-56 mt-4 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading chart data…
              </div>
            ) : trendData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Activity className="w-7 h-7 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No risk-score history yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Run an analysis to start building your trend.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(value) => [
                      `${value ?? 'N/A'}/100`,
                      'Predicted risk',
                    ]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.filename
                        ? `${label} · ${payload[0].payload.filename}`
                        : label
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    name="Predicted risk"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Model predictions are estimates, not confirmed defects. Historical
            scores may not represent changes to the same file.
          </div>
        </div>

        {/* Risk distribution */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Risk distribution
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Categories across saved analyses
          </p>

          <div className="space-y-4 mt-6">
            {[
              {
                label: 'High / Critical',
                count: metrics.highRisk,
                color: 'bg-rose-500',
              },
              {
                label: 'Medium',
                count: metrics.mediumRisk,
                color: 'bg-amber-500',
              },
              {
                label: 'Low',
                count: metrics.lowRisk,
                color: 'bg-emerald-500',
              },
            ].map((item) => {
              const percentage =
                metrics.total > 0
                  ? (item.count / metrics.total) * 100
                  : 0;

              return (
                <div key={item.label}>
                  <div className="flex justify-between gap-3 text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {loading ? '—' : item.count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loading
                ? 'Loading records…'
                : `${metrics.total} saved analysis records`}
            </p>
          </div>
        </div>
      </div>

      {/* Recent analyses */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent analyses
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Your saved analysis history
            </p>
          </div>
          <Link
            to="/editor"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Analyze code →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 pr-4 font-medium">File</th>
                <th className="py-2.5 pr-4 font-medium">Language</th>
                <th className="py-2.5 pr-4 font-medium">Risk score</th>
                <th className="py-2.5 pr-4 font-medium">Risk category</th>
                <th className="py-2.5 font-medium">Analyzed at</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-slate-400"
                  >
                    Loading your saved analyses…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-slate-400"
                  >
                    Analysis history is unavailable.
                  </td>
                </tr>
              ) : latestAnalyses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-slate-400"
                  >
                    No saved analyses yet. Run your first analysis to see
                    results here.
                  </td>
                </tr>
              ) : (
                latestAnalyses.slice(0, 10).map((record) => {
                  const score = getRiskScore(record);
                  const category = getRiskCategory(record);

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                        {record.filename || 'Unnamed file'}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                        {record.language || 'Unknown'}
                      </td>
                      <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                        {score === null ? 'N/A' : `${Math.round(score)}/100`}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold capitalize ${riskClasses(category)}`}
                        >
                          {category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(record.timestamp)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

type MetricCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
};

function MetricCard({
  label,
  value,
  description,
  icon,
}: MetricCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {label}
        </p>
        <span className="text-slate-400">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      <p className="text-[11px] text-slate-400 mt-1">{description}</p>
    </div>
  );

}
