import React, { useState } from 'react';
import { mockUsers, mockAnalysisAuditRecords } from '../../api/mockData';
import { RiskPill } from '../../components/common/Badges';
import { User, UserRole } from '../../types';
import {
  ShieldCheck,
  Users,
  FileCode,
  Cpu,
  Settings,
  MoreVertical,
  Download,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'records' | 'models'>('users');
  const [usersList, setUsersList] = useState<User[]>(mockUsers);
  const [temperature, setTemperature] = useState(0.2);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Platform Administration & Governance
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage organization developers, audit code analysis invocations, and fine-tune AI model parameters
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="border-b border-border flex items-center gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" /> User Management ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'records'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCode className="w-4 h-4" /> Analysis Audit Records ({mockAnalysisAuditRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'models'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Cpu className="w-4 h-4" /> AI Bug Models & Hyperparameters
        </button>
      </div>

      {/* Tab 1: Users Table */}
      {activeTab === 'users' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Developer</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">GitHub Handle</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-border"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="bg-muted/60 border border-border rounded-lg px-2.5 py-1 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                      >
                        <option value="developer">Developer</option>
                        <option value="tech_lead">Tech Lead</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">
                      @{user.githubUsername || 'none'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {user.createdAt.split('T')[0]}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`Reset API token for ${user.name}`)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Reset Token
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Analysis Records Table */}
      {activeTab === 'records' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Automated Analysis Invocations
            </h3>
            <button
              onClick={() => alert('Exporting full audit logs as CSV...')}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">File & Project</th>
                  <th className="p-3.5">Triggered By</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">LOC</th>
                  <th className="p-3.5">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockAnalysisAuditRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono text-muted-foreground">{rec.id}</td>
                    <td className="p-3.5 text-muted-foreground">{rec.timestamp}</td>
                    <td className="p-3.5">
                      <span className="font-mono font-medium text-foreground block">
                        {rec.filename}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{rec.project}</span>
                    </td>
                    <td className="p-3.5 text-foreground">{rec.developer}</td>
                    <td className="p-3.5">
                      <RiskPill score={rec.riskScore} />
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">{rec.loc} lines</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{rec.executionMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Model Metrics & Tuning */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Active Model Cards */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      DeepCode-BugPredictor-v4.2 (Primary)
                    </h3>
                    <p className="text-xs text-muted-foreground">Fine-tuned RoBERTa + AST Graph Neural Network</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Online
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Inference Latency</span>
                  <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                    340ms
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Precision Rate</span>
                  <span className="text-base font-bold font-mono text-emerald-500 mt-0.5 block">
                    95.4%
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Daily Inferences</span>
                  <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                    14,290
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Model */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      CodeLlama-70B-Instruct (Refactor Assistant)
                    </h3>
                    <p className="text-xs text-muted-foreground">Powers automated diff synthesis & remediation advice</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Standby
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Token Throughput</span>
                  <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                    84 tok/s
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Refactor Accept Rate</span>
                  <span className="text-base font-bold font-mono text-emerald-500 mt-0.5 block">
                    89.2%
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Context Window</span>
                  <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                    32k tokens
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hyperparameter Settings */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sliders className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Inference Hyperparameters</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Temperature</span>
                  <span className="font-mono text-primary">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">
                  Lower values yield deterministic, rigorous security predictions.
                </span>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Confidence Alert Threshold</span>
                  <span className="font-mono text-primary">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">
                  Suppress bug warnings with model confidence below this score.
                </span>
              </div>

              <div className="pt-3 border-t border-border">
                <button
                  onClick={() => alert('Model parameters updated successfully!')}
                  className="w-full py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
                >
                  Save Model Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

