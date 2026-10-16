import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { ScanProgressBar } from '../../components/github/ScanProgressBar';
import { Modal } from '../../components/common/Modal';
import {
  Github,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Play,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  Star,
  GitFork,
} from 'lucide-react';

export const GitHubIntegrationPage: React.FC = () => {
  const { repos, pullRequests, commits, isScanningRepo, triggerRepoScan, connectRepo } =
    useProjectStore();

  const [activeTab, setActiveTab] = useState<'repos' | 'prs' | 'commits'>('repos');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [repoInput, setRepoInput] = useState('');

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim()) return;
    connectRepo(repoInput);
    setRepoInput('');
    setIsConnectModalOpen(false);
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Approved':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            Approved by AI
          </span>
        );
      case 'High Risk Detected':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
            High Risk Detected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            Changes Required
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Github className="w-6 h-6 text-foreground" /> GitHub Repository Integration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Automate pull request risk scoring, branch scans, and CI/CD vulnerability checks
          </p>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Connect Repository
        </button>
      </div>

      {/* Live Scan Progress Bar */}
      <ScanProgressBar />

      {/* Main Tabs */}
      <div className="border-b border-border flex items-center gap-2">
        <button
          onClick={() => setActiveTab('repos')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'repos'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitBranch className="w-4 h-4" /> Synced Repositories ({repos.length})
        </button>
        <button
          onClick={() => setActiveTab('prs')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'prs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitPullRequest className="w-4 h-4" /> Pull Requests ({pullRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('commits')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'commits'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitCommit className="w-4 h-4" /> Recent Commits ({commits.length})
        </button>
      </div>

      {/* Tab 1: Repositories */}
      {activeTab === 'repos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm hover:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-foreground" />
                    <h3 className="text-sm font-bold font-mono text-foreground">{repo.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" /> {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" /> {repo.forks}
                    </span>
                    <span className="font-mono">Branch: {repo.branch}</span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    repo.scanStatus === 'passed'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : repo.scanStatus === 'warning'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {repo.scanStatus === 'warning'
                    ? 'Risk Alert (78)'
                    : repo.scanStatus === 'passed'
                    ? 'Clean (24)'
                    : 'Unscanned'}
                </span>
              </div>

              {/* Latest commit banner */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-mono text-primary font-bold">{repo.lastCommitHash}</span>
                  <span>{repo.lastCommitDate}</span>
                </div>
                <p className="text-foreground/90 font-medium truncate">{repo.lastCommitMessage}</p>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {repo.openPRs} pending pull requests
                </span>

                <button
                  onClick={() => triggerRepoScan(repo.id)}
                  disabled={isScanningRepo}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-white transition-colors shadow-sm disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Trigger Full Scan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Pull Requests */}
      {activeTab === 'prs' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm divide-y divide-border">
          {pullRequests.map((pr) => (
            <div
              key={pr.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    #{pr.prNumber}
                  </span>
                  {getVerdictBadge(pr.aiVerdict)}
                  <span className="text-xs font-mono font-semibold text-muted-foreground">
                    Risk Score: {pr.riskScore}/100
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-foreground">{pr.title}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <img src={pr.avatarUrl} alt={pr.author} className="w-4 h-4 rounded-full" />
                    <span>{pr.author}</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-emerald-500 font-bold">+{pr.additions}</span>
                  <span className="font-mono text-rose-500 font-bold">-{pr.deletions}</span>
                  <span>•</span>
                  <span>{pr.headBranch} &rarr; {pr.baseBranch}</span>
                  <span>•</span>
                  <span>{pr.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="#github-pr"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                >
                  View on GitHub <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Commits */}
      {activeTab === 'commits' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm divide-y divide-border">
          {commits.map((commit) => (
            <div
              key={commit.hash}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {commit.shortHash}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      commit.riskScore > 50
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    Risk: {commit.riskScore}/100
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-foreground">{commit.message}</p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <img src={commit.avatarUrl} alt={commit.author} className="w-4 h-4 rounded-full" />
                    <span>{commit.author}</span>
                  </span>
                  <span>•</span>
                  <span>{commit.filesChanged} files changed</span>
                  <span>•</span>
                  <span>{commit.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Repo Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Connect GitHub Repository"
        description="Link your GitHub organization repository for continuous bug scanning"
      >
        <form onSubmit={handleConnectSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Repository Name (owner/repo)
            </label>
            <input
              type="text"
              required
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="e.g. codepulse/user-service"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Permissions Requested:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Read access to code & commit metadata</li>
              <li>Write access to commit status & PR check annotations</li>
              <li>Webhook subscription for push events</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm"
            >
              Connect & Authorize
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

