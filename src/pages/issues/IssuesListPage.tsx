import React, { useState, useMemo } from 'react';
import { useIssueStore } from '../../stores/issueStore';
import { SeverityBadge, StatusBadge, RiskPill } from '../../components/common/Badges';
import { mockUsers } from '../../api/mockData';
import { Severity, IssueStatus, Issue } from '../../types';
import {
  Bug,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  MessageSquare,
  FileCode,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Modal } from '../../components/common/Modal';

export const IssuesListPage: React.FC = () => {
  const {
    issues,
    filterSeverity,
    filterStatus,
    filterAssignee,
    searchQuery,
    setFilterSeverity,
    setFilterStatus,
    setFilterAssignee,
    setSearchQuery,
    updateStatus,
    createIssue,
  } = useIssueStore();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q');

  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<Severity>('high');
  const [newProject, setNewProject] = useState('core-payment-gateway');
  const [newFile, setNewFile] = useState('src/handlers/auth.py');

  // Filter issues
  const filteredIssues = useMemo(() => {
    const q = (queryParam || searchQuery).toLowerCase();

    return issues.filter((issue) => {
      const matchSearch =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.id.toLowerCase().includes(q) ||
        issue.tags.some((t) => t.toLowerCase().includes(q));

      const matchSev = filterSeverity === 'all' || issue.severity === filterSeverity;
      const matchStat = filterStatus === 'all' || issue.status === filterStatus;
      const matchAssignee = filterAssignee === 'all' || issue.assignee.id === filterAssignee;

      return matchSearch && matchSev && matchStat && matchAssignee;
    });
  }, [issues, searchQuery, queryParam, filterSeverity, filterStatus, filterAssignee]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createIssue({
      title: newTitle,
      description: newDesc,
      severity: newSeverity,
      status: 'open',
      project: newProject,
      fileLocation: newFile,
      lineRange: 'L1-L20',
      riskScore: newSeverity === 'critical' ? 92 : newSeverity === 'high' ? 76 : 48,
      assignee: {
        id: mockUsers[0].id,
        name: mockUsers[0].name,
        avatarUrl: mockUsers[0].avatarUrl,
      },
      tags: ['Security', 'AI-Flagged'],
    });

    setNewTitle('');
    setNewDesc('');
    setIsNewIssueModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and New Issue Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bug className="w-6 h-6 text-primary" /> Bug & Vulnerability Tracker
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Intercepted risks, CWE security flaws, and code smell investigations
          </p>
        </div>

        <button
          onClick={() => setIsNewIssueModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" /> File New Issue
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by issue title, CVE ID, tag, or code snippet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/60 border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          {/* Severity filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="text-xs bg-muted/60 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs bg-muted/60 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Assignee filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value as any)}
            className="text-xs bg-muted/60 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">All Assignees</option>
            {mockUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Counter Pill */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing <strong className="text-foreground">{filteredIssues.length}</strong> matching issues
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {issues.filter((i) => i.severity === 'critical').length} Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {issues.filter((i) => i.severity === 'high').length} High
            </span>
          </div>
        </div>
      </div>

      {/* Issues Table List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No issues matching the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition-colors cursor-pointer group"
              >
                {/* Issue Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {issue.id}
                    </span>
                    <SeverityBadge severity={issue.severity} />
                    <StatusBadge status={issue.status} />
                    <RiskPill score={issue.riskScore} />
                  </div>

                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {issue.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="font-mono flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                      {issue.fileLocation} ({issue.lineRange})
                    </span>
                    <span>•</span>
                    <span>Project: {issue.project}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {issue.commentsCount} comments
                    </span>
                  </div>
                </div>

                {/* Right controls: Assignee & Status Quick changer */}
                <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border">
                    <img
                      src={issue.assignee.avatarUrl}
                      alt={issue.assignee.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                      {issue.assignee.name.split(' ')[0]}
                    </span>
                  </div>

                  <select
                    value={issue.status}
                    onChange={(e) => updateStatus(issue.id, e.target.value as IssueStatus)}
                    className="text-xs bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Issue Modal */}
      <Modal
        isOpen={isNewIssueModalOpen}
        onClose={() => setIsNewIssueModalOpen(false)}
        title="File New Bug or Security Alert"
        description="Manual report or static analysis vulnerability flagging"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Issue Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Unsanitized reflection call allows code execution"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Explain the vulnerability, expected outcome, and impact..."
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Severity</label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="critical">Critical (P0)</option>
                <option value="high">High (P1)</option>
                <option value="medium">Medium (P2)</option>
                <option value="low">Low (P3)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Project</label>
              <input
                type="text"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">File Location</label>
            <input
              type="text"
              value={newFile}
              onChange={(e) => setNewFile(e.target.value)}
              placeholder="src/utils/security.ts"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsNewIssueModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm"
            >
              Create Issue
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

