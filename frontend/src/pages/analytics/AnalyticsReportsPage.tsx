import React, { useState } from 'react';
import {
  mockModelPerformance,
  mockProductivityMetrics,
  mockWeeklyActivity,
} from '../../api/mockData';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Cpu,
  Zap,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const AnalyticsReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [downloading, setDownloading] = useState(false);

  const handleExport = (type: 'pdf' | 'json') => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Report exported successfully as ${type.toUpperCase()}!`);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Engineering Analytics & Quality Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            DeepCode ML prediction accuracy, developer throughput, and technical debt trends
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export JSON
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 transition-all"
          >
            <Download className="w-4 h-4" /> {downloading ? 'Generating PDF...' : 'Download Quality Audit PDF'}
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Bugs Prevented in CI</p>
          <h3 className="text-2xl font-bold font-mono text-foreground">157 Defects</h3>
          <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +28% vs previous quarter
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">PR Review Turnaround</p>
          <h3 className="text-2xl font-bold font-mono text-foreground">5.9 Hours</h3>
          <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> 58% faster with AI triage
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Model F1-Score</p>
          <h3 className="text-2xl font-bold font-mono text-primary">94.8%</h3>
          <p className="text-[11px] text-muted-foreground mt-1">DeepCode-BugPredictor-v4.2</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">False Positive Rate</p>
          <h3 className="text-2xl font-bold font-mono text-emerald-500">3.6%</h3>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1">Industry low benchmark</p>
        </div>
      </div>

      {/* Chart 1: ML Model Accuracy Trends (Precision, Recall, F1) */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" /> AI Bug Prediction Model Performance
            </h3>
            <p className="text-xs text-muted-foreground">
              Evolution of Precision, Recall, and F1-Score across active validation benchmarks
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            Current Benchmark: Polyglot-Code-Bench-2025
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockModelPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
              <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground text-xs" />
              <YAxis domain={[80, 100]} stroke="currentColor" className="text-muted-foreground text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(23, 23, 28, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="f1Score"
                stroke="#6366f1"
                strokeWidth={3}
                name="F1 Score (%)"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="precision"
                stroke="#10b981"
                strokeWidth={2}
                name="Precision (%)"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="recall"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Recall (%)"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Developer Velocity & Code Quality Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity: Lines Analyzed & Bugs Prevented */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Developer Productivity & Lines Analyzed
            </h3>
            <p className="text-xs text-muted-foreground">
              Total lines of code checked and bugs intercepted per sprint
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProductivityMetrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                <XAxis dataKey="week" stroke="currentColor" className="text-muted-foreground text-xs" />
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="linesAnalyzed" fill="#818cf8" name="Lines of Code Analyzed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Review Time Reduction Trend */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> PR Turnaround Acceleration (Hours)
            </h3>
            <p className="text-xs text-muted-foreground">
              Time elapsed from Pull Request creation to final approval and merge
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockProductivityMetrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                <XAxis dataKey="week" stroke="currentColor" className="text-muted-foreground text-xs" />
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
                  dataKey="prReviewTimeHours"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTime)"
                  name="Avg Review Hours"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

