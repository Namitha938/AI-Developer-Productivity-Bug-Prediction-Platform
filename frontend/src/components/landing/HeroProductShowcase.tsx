import React, { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Activity,
  Layers,
  Cpu,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Server,
  Database,
  Lock,
  ArrowUpRight,
  Radio,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface ServiceNode {
  id: string;
  name: string;
  type: string;
  status: 'critical' | 'warning' | 'healthy';
  riskScore: number;
  bugsBlocked: number;
  latency: string;
  icon: typeof Server;
  description: string;
  lastEvent: string;
}

const SERVICE_NODES: ServiceNode[] = [
  {
    id: 'payments',
    name: 'Payment Ingestion Worker',
    type: 'Financial Microservice',
    status: 'critical',
    riskScore: 91,
    bugsBlocked: 42,
    latency: '14ms',
    icon: Lock,
    description: 'High-risk SQL injection & resource exhaustion intercepted before deployment.',
    lastEvent: 'CWE-89 SQL Injection blocked • Auto-remediated in 14ms',
  },
  {
    id: 'auth',
    name: 'Zero-Trust Auth Gateway',
    type: 'Security Infrastructure',
    status: 'healthy',
    riskScore: 8,
    bugsBlocked: 19,
    latency: '6ms',
    icon: Shield,
    description: 'RFC-7519 compliant token parsing with constant-time HMAC cryptographic validation.',
    lastEvent: 'Timing attack vulnerability neutralized • Zero leaks',
  },
  {
    id: 'database',
    name: 'Cluster Sharding Engine',
    type: 'Persistent Store',
    status: 'healthy',
    riskScore: 12,
    bugsBlocked: 27,
    latency: '9ms',
    icon: Database,
    description: 'Connection pool concurrency managed with context timeout deadlines.',
    lastEvent: 'Deadlock hazard mitigated • Goroutine pool verified',
  },
  {
    id: 'search',
    name: 'Neural Semantic Search',
    type: 'Vector Indexer',
    status: 'warning',
    riskScore: 54,
    bugsBlocked: 14,
    latency: '22ms',
    icon: Cpu,
    description: 'High cyclomatic branch nesting flagged in query compilation AST.',
    lastEvent: 'N+1 recursive query loop detected • Refactor proposed',
  },
];

const LIVE_EVENTS = [
  { time: 'Just now', service: 'Payment Ingestion', event: 'Blocked SQL Injection (CWE-89)', timeToFix: '12ms', status: 'critical' },
  { time: '4s ago', service: 'Auth Gateway', event: 'Neutralized Timing Leak in JWT', timeToFix: '8ms', status: 'healthy' },
  { time: '12s ago', service: 'Cluster Engine', event: 'Resolved Worker Deadlock Hazard', timeToFix: '14ms', status: 'warning' },
  { time: '28s ago', service: 'PR Review Bot', event: 'Approved Clean PR #419 (0 Flaws)', timeToFix: '21ms', status: 'healthy' },
];

export const HeroProductShowcase: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('payments');
  const [activeTab, setActiveTab] = useState<'topology' | 'velocity' | 'telemetry'>('topology');
  const [pulseCounter, setPulseCounter] = useState<number>(142);

  // Periodic pulse simulating live defect interceptions
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCounter((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeNode = SERVICE_NODES.find((n) => n.id === activeNodeId) || SERVICE_NODES[0];
  const IconComponent = activeNode.icon;

  return (
    <div className="relative mt-12 max-w-5xl mx-auto">
      {/* Floating Animated HUD Badge 1: Top Right */}
      <div className="hidden lg:flex absolute -top-6 -right-6 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 border border-indigo-500/40 text-white shadow-xl shadow-indigo-950/40 backdrop-blur-md animate-float-slow select-none">
        <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
          <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Neural Bug Predictor</span>
            <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
              96.4% Conf
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Zero-day regression neutralized in PR #342
          </div>
        </div>
      </div>

      {/* Floating Animated HUD Badge 2: Bottom Left */}
      <div className="hidden lg:flex absolute -bottom-6 -left-6 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 border border-teal-500/40 text-white shadow-xl shadow-teal-950/40 backdrop-blur-md animate-float-reverse select-none">
        <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
          <Shield className="w-4 h-4 text-teal-400" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>OASIS SARIF 2.1.0 Verified</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Zero Code Retention • In-Memory Processing
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Product Window */}
      <div className="rounded-2xl overflow-hidden border border-slate-700/60 dark:border-slate-800 bg-slate-950 text-slate-100 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl">
        {/* Window Chrome Titlebar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 gap-3">
          {/* Traffic Light Dots & Status */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-slate-400 hidden sm:inline">
              bugpulse-cockpit // neural-graph:production • cluster-node-us-east
            </span>
          </div>

          {/* Interactive Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('topology')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'topology'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Topology Mesh</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('velocity')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'velocity'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Risk Velocity</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live Ticker</span>
            </button>
          </div>

          {/* Live Heartbeat Ping */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-medium text-emerald-400">
              {pulseCounter} REGRESSIONS BLOCKED
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          {/* Left Column: Interactive Microservice Nodes (md:col-span-5) */}
          <div className="md:col-span-5 p-5 border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-900/50 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800/60">
                <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  Codebase Microservices
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                  Live Guard Active
                </span>
              </div>

              {/* Service List */}
              <div className="space-y-2">
                {SERVICE_NODES.map((node) => {
                  const isSelected = activeNodeId === node.id;
                  const Icon = node.icon;
                  const statusColor =
                    node.status === 'critical'
                      ? 'border-red-500/40 bg-red-500/10 text-red-300'
                      : node.status === 'warning'
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';

                  const badgeDot =
                    node.status === 'critical'
                      ? 'bg-red-500 shadow-red-500'
                      : node.status === 'warning'
                      ? 'bg-amber-500 shadow-amber-500'
                      : 'bg-emerald-500 shadow-emerald-500';

                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setActiveNodeId(node.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group focus:outline-none ${
                        isSelected
                          ? 'bg-indigo-600/20 border-2 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                          : 'bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg border ${statusColor} group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{node.name}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">{node.type}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className={`w-2 h-2 rounded-full ${badgeDot} shadow-sm`} />
                          <span className="text-xs font-mono font-bold">{node.riskScore}%</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{node.latency}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Global Telemetry HUD */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900/60">
                <div className="text-[10px] text-slate-500">Global Health</div>
                <div className="text-base font-bold text-emerald-400">96.8%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60">
                <div className="text-[10px] text-slate-500">Avg Response</div>
                <div className="text-base font-bold text-indigo-400">&lt; 38ms</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Hologram & Radar Topology (md:col-span-7) */}
          <div className="md:col-span-7 p-6 relative overflow-hidden flex flex-col justify-between bg-slate-950">
            {/* Animated Radial Scan Beam in Background */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-indigo-500/10 pointer-events-none"
              aria-hidden="true"
            >
              <div className="w-full h-full rounded-full border border-indigo-500/20 animate-radar-ping opacity-30" />
            </div>

            {/* View Mode 1: Interactive Topology Network */}
            {activeTab === 'topology' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Node Detail Card */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white">{activeNode.name}</h4>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        Risk Index {activeNode.riskScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeNode.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400 font-mono">Bugs Neutralized</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      {activeNode.bugsBlocked}
                    </div>
                  </div>
                </div>

                {/* Visual Topology SVG Graph */}
                <div className="relative h-48 w-full rounded-xl bg-slate-900/50 border border-slate-800/80 p-3 overflow-hidden flex items-center justify-center">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 460 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Glowing Connection Links */}
                    <path
                      d="M 80 90 Q 150 40 230 40"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                    <path
                      d="M 80 90 Q 150 140 230 140"
                      stroke="#14B8A6"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M 230 40 L 380 90"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 230 140 L 380 90"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />

                    {/* Traveling Data Pulses */}
                    <circle cx="160" cy="55" r="3.5" fill="#818CF8">
                      <animate
                        attributeName="cx"
                        values="80;230"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="cy"
                        values="90;40"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    <circle cx="300" cy="65" r="4" fill="#EF4444">
                      <animate
                        attributeName="cx"
                        values="230;380"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="cy"
                        values="40;90"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Node 1: Ingress Gateway */}
                    <g transform="translate(40, 65)">
                      <rect width="80" height="50" rx="10" fill="#1E293B" stroke="#6366F1" strokeWidth="1.5" />
                      <text x="40" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">Ingress</text>
                      <text x="40" y="38" textAnchor="middle" fill="#818CF8" fontSize="9" fontFamily="monospace">TLS / AST</text>
                    </g>

                    {/* Node 2: Auth Cluster */}
                    <g transform="translate(190, 15)">
                      <rect width="80" height="50" rx="10" fill="#1E293B" stroke="#10B981" strokeWidth="1.5" />
                      <text x="40" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">Auth</text>
                      <text x="40" y="38" textAnchor="middle" fill="#34D399" fontSize="9" fontFamily="monospace">0 Leaks</text>
                    </g>

                    {/* Node 3: Database Engine */}
                    <g transform="translate(190, 115)">
                      <rect width="80" height="50" rx="10" fill="#1E293B" stroke="#14B8A6" strokeWidth="1.5" />
                      <text x="40" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">Database</text>
                      <text x="40" y="38" textAnchor="middle" fill="#2DD4BF" fontSize="9" fontFamily="monospace">Pooled</text>
                    </g>

                    {/* Node 4: Payment Worker (High Risk Alert Node) */}
                    <g transform="translate(340, 65)">
                      <rect width="90" height="50" rx="10" fill="#1E293B" stroke="#EF4444" strokeWidth="2" />
                      <circle cx="80" cy="12" r="5" fill="#EF4444" className="animate-ping" />
                      <circle cx="80" cy="12" r="4" fill="#EF4444" />
                      <text x="45" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">Payment</text>
                      <text x="45" y="38" textAnchor="middle" fill="#F87171" fontSize="9" fontFamily="monospace">Shielded</text>
                    </g>
                  </svg>
                </div>
              </div>
            )}

            {/* View Mode 2: Risk Velocity Radar */}
            {activeTab === 'velocity' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Neural Regression Velocity</h4>
                    <p className="text-xs text-slate-400">Weekly flaw prevention rate across commits</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    +32% Velocity
                  </span>
                </div>

                {/* Frequency Graph */}
                <div className="h-44 rounded-xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Today</span>
                  </div>

                  <div className="flex items-end justify-between gap-3 h-28 pt-4">
                    {[42, 68, 54, 88, 92, 45, 114].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-mono text-slate-400">{val}</span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-teal-400 transition-all duration-500 hover:brightness-125"
                          style={{ height: `${(val / 120) * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 3: Live Interception Ticker */}
            {activeTab === 'telemetry' && (
              <div className="space-y-2.5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1">
                  <span>LIVE REPOSITORIES STREAM</span>
                  <span className="text-emerald-400">0s LATENCY</span>
                </div>
                {LIVE_EVENTS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                      <span className="font-bold text-white">{item.service}</span>
                      <span className="text-slate-400">• {item.event}</span>
                    </div>
                    <span className="font-mono text-emerald-400 text-[11px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      {item.timeToFix}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Status Ticker */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{activeNode.lastEvent}</span>
              </span>
              <span className="text-emerald-400 font-semibold hidden sm:inline">
                ● AST Neural Inference Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
