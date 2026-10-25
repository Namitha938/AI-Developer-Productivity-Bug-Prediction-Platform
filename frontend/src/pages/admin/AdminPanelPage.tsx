
import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Shield,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Database,
  Server,
  Loader2,
  UserCheck,
  UserX,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../../api/client';

type UserRole = 'admin' | 'user';
type UserTab = 'All users' | 'Active' | 'Inactive';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  role: string;
  is_active: boolean;
  created_at?: string | null;
}

interface ServiceHealth {
  status?: string;
  [key: string]: unknown;
}

interface AdminOverview {
  generated_at?: string;
  users?: {
    total?: number;
    active?: number;
    inactive?: number;
    admins?: number;
  };
  analyses?: {
    total?: number;
    risk_distribution?: Record<string, number>;
    recent?: Array<Record<string, unknown>>;
  };
}

interface HealthResponse {
  api?: string | ServiceHealth;
  firestore?: string | ServiceHealth;
  ml_service?: string | ServiceHealth;
  checked_at?: string;
}

const cardClass =
  'p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs';

const panelClass =
  'p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4';

function getErrorMessage(error: unknown): string {
  const candidate = error as {
    response?: { data?: { detail?: string; message?: string } };
    message?: string;
  };

  return (
    candidate?.response?.data?.detail ||
    candidate?.response?.data?.message ||
    candidate?.message ||
    'Something went wrong while loading admin data.'
  );
}

function displayName(user: AdminUser): string {
  return user.full_name?.trim() || user.username || user.email;
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

function formatDate(value?: string | null): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function serviceStatus(value: unknown): 'Online' | 'Offline' | 'Unknown' {
  if (value === true) return 'Online';
  if (value === false || value == null) return 'Unknown';

  if (typeof value === 'object') {
    const item = value as ServiceHealth;
    return serviceStatus(item.status);
  }

  const status = String(value).toLowerCase();

  if (
    ['healthy', 'ok', 'online', 'connected', 'available', 'up'].includes(status)
  ) {
    return 'Online';
  }

  if (['unhealthy', 'offline', 'error', 'down', 'disconnected'].includes(status)) {
    return 'Offline';
  }

  return 'Unknown';
}

function riskLabel(value: string): string {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normaliseUser(raw: Record<string, unknown>): AdminUser {
  return {
    id: String(raw.id ?? raw.uid ?? ''),
    username: String(raw.username ?? ''),
    email: String(raw.email ?? ''),
    full_name:
      typeof raw.full_name === 'string' ? raw.full_name : null,
    role: String(raw.role ?? 'user'),
    is_active: raw.is_active !== false,
    created_at:
      typeof raw.created_at === 'string' ? raw.created_at : null,
  };
}

function extractUsers(data: unknown): AdminUser[] {
  if (Array.isArray(data)) {
    return data.map((item) =>
      normaliseUser(item as Record<string, unknown>),
    );
  }

  if (!data || typeof data !== 'object') return [];

  const response = data as Record<string, unknown>;
  const list =
    response.users ?? response.items ?? response.results;

  if (!Array.isArray(list)) return [];

  return list.map((item) =>
    normaliseUser(item as Record<string, unknown>),
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {label}
        </span>
        <span className="text-blue-600 dark:text-blue-400">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
        {value}
      </div>
      <p className="text-[11px] text-slate-400 mt-1">{detail}</p>
    </div>
  );
}

function StatusBadge({ value }: { value: unknown }) {
  const status = serviceStatus(value);
  const className =
    status === 'Online'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
      : status === 'Offline'
        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export const AdminPanelPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [userTab, setUserTab] = useState<UserTab>('All users');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError('');

    try {
      const params: Record<string, string | number | boolean> = {
        limit: 100,
      };

      if (searchQuery.trim()) params.q = searchQuery.trim();

      if (userTab === 'Active') params.is_active = true;
      if (userTab === 'Inactive') params.is_active = false;

      const [overviewResult, usersResult, healthResult] =
        await Promise.allSettled([
          apiClient.get('/admin/overview'),
          apiClient.get('/admin/users', { params }),
          apiClient.get('/admin/health'),
        ]);

      const failures: string[] = [];

      if (overviewResult.status === 'fulfilled') {
        setOverview(overviewResult.value.data as AdminOverview);
      } else {
        failures.push(
          `Overview: ${getErrorMessage(overviewResult.reason)}`,
        );
      }

      if (usersResult.status === 'fulfilled') {
        const data = usersResult.value.data;
        setUsers(extractUsers(data));

        setTotalUsers(
          typeof data?.total === 'number'
            ? data.total
            : extractUsers(data).length,
        );
      } else {
        failures.push(
          `Users: ${getErrorMessage(usersResult.reason)}`,
        );
      }

      if (healthResult.status === 'fulfilled') {
        setHealth(healthResult.value.data as HealthResponse);
      } else {
        failures.push(
          `Health: ${getErrorMessage(healthResult.reason)}`,
        );
      }

      if (failures.length) {
        setError(failures.join(' '));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, userTab]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const updateUser = async (
    user: AdminUser,
    changes: { role?: UserRole; is_active?: boolean },
  ) => {
    const action = changes.is_active === false
      ? `deactivate ${displayName(user)}`
      : changes.is_active === true
        ? `reactivate ${displayName(user)}`
        : `change ${displayName(user)}'s role`;

    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    setSavingUserId(user.id);
    setActionError('');

    try {
      await apiClient.patch(
        `/admin/users/${encodeURIComponent(user.id)}`,
        changes,
      );

      await loadData(true);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSavingUserId(null);
    }
  };

  const riskDistribution = overview?.analyses?.risk_distribution ?? {};
  const recentAnalyses = overview?.analyses?.recent ?? [];

  const analysisTotal = overview?.analyses?.total;
  const activeCount = overview?.users?.active;
  const adminCount = overview?.users?.admins;
  const inactiveCount = overview?.users?.inactive;

  const services = [
    { label: 'API', value: health?.api, icon: <Server size={17} /> },
    {
      label: 'Firestore',
      value: health?.firestore,
      icon: <Database size={17} />,
    },
    {
      label: 'ML service',
      value: health?.ml_service,
      icon: <Activity size={17} />,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} />
            <span>Workspace / Administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Admin dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live account, analysis, risk, and service-health data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {overview?.generated_at
              ? `Updated ${formatDate(overview.generated_at)}`
              : 'Live data'}
          </span>

          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Some admin data could not be loaded.</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300"
        >
          {actionError}
        </div>
      )}

      {loading && !overview && users.length === 0 ? (
        <div className={`${panelClass} flex items-center justify-center gap-3 py-12`}>
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Loading live admin data…
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Active users"
              value={activeCount ?? '—'}
              detail={
                inactiveCount == null
                  ? 'Current active accounts'
                  : `${inactiveCount} inactive accounts`
              }
              icon={<UserCheck size={17} />}
            />
            <MetricCard
              label="Total users"
              value={overview?.users?.total ?? totalUsers}
              detail={`${adminCount ?? '—'} administrator accounts`}
              icon={<Users size={17} />}
            />
            <MetricCard
              label="Saved analyses"
              value={analysisTotal ?? '—'}
              detail="Analyses recorded in Firestore"
              icon={<Activity size={17} />}
            />
            <MetricCard
              label="High / critical risk"
              value={
                Object.entries(riskDistribution)
                  .filter(([key]) =>
                    /critical|very.high|high/i.test(key),
                  )
                  .reduce((sum, [, count]) => sum + Number(count || 0), 0)
              }
              detail="Recorded analyses in high-risk categories"
              icon={<AlertTriangle size={17} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <section className={panelClass}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Users & roles
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Manage real accounts and access permissions.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    <Shield size={13} /> Admin view
                  </span>
                </div>

                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search name, username, or email…"
                    aria-label="Search users"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs font-medium border-b border-slate-100 dark:border-slate-800">
                  {(['All users', 'Active', 'Inactive'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setUserTab(tab)}
                      className={`pb-2 transition-colors ${
                        userTab === tab
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  <span className="ml-auto pb-2 text-[11px] text-slate-400">
                    {totalUsers} result{totalUsers === 1 ? '' : 's'}
                  </span>
                </div>

                {users.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    {searchQuery
                      ? 'No users match your search.'
                      : 'No user records returned by the API.'}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((user) => {
                      const name = displayName(user);
                      const isSaving = savingUserId === user.id;

                      return (
                        <div
                          key={user.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {initials(name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                {name}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {user.email}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Joined {formatDate(user.created_at)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-semibold ${
                                user.is_active
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                              }`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>

                            <label className="sr-only" htmlFor={`role-${user.id}`}>
                              Role for {name}
                            </label>
                            <select
                              id={`role-${user.id}`}
                              value={user.role === 'admin' ? 'admin' : 'user'}
                              disabled={isSaving}
                              onChange={(event) =>
                                void updateUser(user, {
                                  role: event.target.value as UserRole,
                                })
                              }
                              className="max-w-28 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 disabled:opacity-50"
                            >
                              <option value="user">Developer</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() =>
                                void updateUser(user, {
                                  is_active: !user.is_active,
                                })
                              }
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold disabled:opacity-50 ${
                                user.is_active
                                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                            >
                              {isSaving ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : user.is_active ? (
                                <UserX size={12} />
                              ) : (
                                <UserCheck size={12} />
                              )}
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="text-[10px] text-slate-400">
                  Only accounts returned by the backend are shown. Role and
                  activation changes require admin authorization.
                </p>
              </section>

              <section className={panelClass}>
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Risk distribution
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Categories reported by saved analyses.
                  </p>
                </div>

                {Object.keys(riskDistribution).length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                    No risk distribution data is available yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(riskDistribution).map(([risk, count]) => {
                      const numericCount = Number(count) || 0;
                      const total = Object.values(riskDistribution).reduce(
                        (sum, item) => sum + (Number(item) || 0),
                        0,
                      );
                      const percentage =
                        total > 0 ? (numericCount / total) * 100 : 0;

                      return (
                        <div key={risk}>
                          <div className="flex justify-between gap-3 text-xs mb-1.5">
                            <span className="text-slate-600 dark:text-slate-300">
                              {riskLabel(risk)}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {numericCount}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className={panelClass}>
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Recent analysis records
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Latest saved records returned by the admin API.
                  </p>
                </div>

                {recentAnalyses.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                    No recent analysis records are available.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase">
                          <th className="py-2 pr-3 font-medium">Record</th>
                          <th className="py-2 pr-3 font-medium">Risk</th>
                          <th className="py-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentAnalyses.map((record, index) => {
                          const id = String(
                            record.id ?? record.analysis_id ?? index,
                          );
                          const risk = String(
                            record.risk_category ??
                              record.risk_level ??
                              record.risk ??
                              'Unknown',
                          );
                          const date = String(
                            record.created_at ??
                              record.timestamp ??
                              '',
                          );
                          const title = String(
                            record.title ??
                              record.repository ??
                              record.filename ??
                              record.email ??
                              record.uid ??
                              `Analysis ${index + 1}`,
                          );

                          return (
                            <tr key={id}>
                              <td className="py-3 pr-3">
                                <div className="font-medium text-slate-900 dark:text-white break-words">
                                  {title}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  ID: {id}
                                </div>
                              </td>
                              <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                                {riskLabel(risk)}
                              </td>
                              <td className="py-3 text-slate-400 whitespace-nowrap">
                                {formatDate(date || null)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className={panelClass}>
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Service health
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Live connectivity checks from the backend.
                  </p>
                </div>

                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 dark:text-slate-400">
                          {service.icon}
                        </span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                          {service.label}
                        </span>
                      </div>
                      <StatusBadge value={service.value} />
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-400">
                  {health?.checked_at
                    ? `Last checked: ${formatDate(health.checked_at)}`
                    : 'Health information is provided by the admin health endpoint.'}
                </div>


              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
