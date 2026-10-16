import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useIssueStore } from '../../stores/issueStore';
import { useProjectStore } from '../../stores/projectStore';
import { useAnalysisStore } from '../../stores/analysisStore';
import { StatCard } from '../../components/common/StatCard';
import { SeverityBadge, StatusBadge, RiskPill } from '../../components/common/Badges';
import {
  mockWeeklyActivity,
  mockAnalysisAuditRecords,
} from '../../api/mockData';
import {
  Bug,
  ShieldAlert,
  Code2,
  Zap,
  ArrowRight,
  GitBranch,
  Play,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const DeveloperDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { issues } = useIssueStore();
  const { projects, repos } = useProjectStore();
  const { history } = useAnalysisStore();
  const navigate = useNavigate();

  const openIssues = issues.filter((i) => i.status !== 'resolved');
  const criticalBugs = issues.filter((i) => i.severity === 'critical' && i.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Engine: 3 code smells intercepted today</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Developer'}! 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-200 max-w-xl">
              Your codebase health is sitting at <strong>78/100</strong>. AI bug prediction models
              have identified 1 critical database resource leak requiring immediate attention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/editor')}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
            >
              <Code2 className="w-4 h-4 text-indigo-600" /> Open AI Code Editor
            </button>
            <button
              onClick={() => navigate('/github')}
              className="px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white text-xs font-semibold backdrop-blur transition-all flex items-center gap-2 border border-white/10"
            >
              <GitBranch className="w-4 h-4" /> Trigger Repo Scan
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Bug Issues"
          value={openIssues.length}
          subtitle={`${criticalBugs.length} Critical severity`}
          change={{ value: '-12% this week', isPositive: true }}
          icon={Bug}
          iconColor="text-rose-500"
          iconBg="bg-rose-500/10"
          onClick={() => navigate('/issues')}
        />
        <StatCard
          title="Avg Repository Risk"
          value="42 / 100"
          subtitle="Moderate - 3 active repos"
          change={{ value: '-6 pts reduction', isPositive: true }}
          icon={ShieldAlert}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          title="Recent AI Analyses"
          value={history.length}
          subtitle="Across Python & TypeScript"
          change={{ value: '+8 analyses', isPositive: true }}
          icon={Code2}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          onClick={() => navigate('/editor')}
        />
        <StatCard
          title="Dev Velocity Score"
          value="95 / 100"
          subtitle="Top 5% engineering throughput"
          change={{ value: '+4% boost', isPositive: true }}
          icon={Zap}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* Main Grid: Activity Chart & Recent Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart (Commits vs Scans vs Bugs) */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Developer Activity & Bug Interceptions
              </h3>
              <p className="text-xs text-muted-foreground">
                Commits, AST scans, and bugs prevented over the last 7 days
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Commits
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Bugs Prevented
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockWeeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBugs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground text-xs" />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 28, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCommits)"
                  name="Commits"
                />
                <Area
                  type="monotone"
                  dataKey="bugsFound"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBugs)"
                  name="Bugs Intercepted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Priority Bugs Watchlist */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-500" /> High-Risk Issues
            </h3>
            <button
              onClick={() => navigate('/issues')}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              View all &rarr;
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {issues.slice(0, 4).map((issue) => (
              <div
                key={issue.id}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">{issue.id}</span>
                  <SeverityBadge severity={issue.severity} />
                </div>
                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {issue.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="truncate max-w-[140px]">{issue.project}</span>
                  <StatusBadge status={issue.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connected Projects & Recent Analyses Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Overview */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-500" /> Active Repositories
            </h3>
            <button
              onClick={() => navigate('/github')}
              className="text-xs text-primary hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-3 rounded-xl border border-border bg-muted/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono text-foreground">{proj.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {proj.healthScore}% health
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{proj.description}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>Open Issues: {proj.openIssuesCount}</span>
                  <span>Test Coverage: {proj.testCoveragePercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analysis Audit Logs */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" /> Recent Static & ML Analyses
            </h3>
            <button
              onClick={() => navigate('/admin')}
              className="text-xs text-primary hover:underline"
            >
              Full Audit Log &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-2">File</th>
                  <th className="pb-2">Project</th>
                  <th className="pb-2">Author</th>
                  <th className="pb-2">Risk Score</th>
                  <th className="pb-2">Execution</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockAnalysisAuditRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-mono font-medium text-foreground">
                      {rec.filename}
                    </td>
                    <td className="py-2.5 text-muted-foreground">{rec.project}</td>
                    <td className="py-2.5 text-foreground">{rec.developer}</td>
                    <td className="py-2.5">
                      <RiskPill score={rec.riskScore} />
                    </td>
                    <td className="py-2.5 font-mono text-muted-foreground">{rec.executionMs}ms</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => navigate('/editor')}
                        className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Inspect <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

