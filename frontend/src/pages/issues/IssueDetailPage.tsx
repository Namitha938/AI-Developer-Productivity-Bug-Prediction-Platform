import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIssueStore } from '../../stores/issueStore';
import { useAuthStore } from '../../stores/authStore';
import { mockUsers } from '../../api/mockData';
import { SeverityBadge, StatusBadge, RiskPill } from '../../components/common/Badges';
import { IssueStatus } from '../../types';
import {
  ArrowLeft,
  Bug,
  FileCode,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Send,
  Code2,
  ExternalLink,
  ShieldAlert,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, updateStatus, updateAssignee } = useIssueStore();
  const { user } = useAuthStore();

  const issue = issues.find((i) => i.id === id) || issues[0];

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Elena Rostova',
      role: 'Staff Architect',
      avatarUrl: mockUsers[1].avatarUrl,
      timestamp: '2 hours ago',
      content:
        'I inspected the query builder in `user_repository.py`. The raw f-string definitely exposes the DB to arbitrary parameter tampering. We need to convert this to use positional parameters ($1, $2) and wrap the connection inside a pooled context manager.',
    },
    {
      id: 'c2',
      author: 'Alex Rivera',
      role: 'Senior Fullstack Engineer',
      avatarUrl: mockUsers[0].avatarUrl,
      timestamp: '45 mins ago',
      content:
        'Working on the patch right now. I have drafted the parameterized query and added unit tests in PR #108 to assert against SQL injection payloads.',
    },
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments([
      ...comments,
      {
        id: 'c-' + Date.now(),
        author: user?.name || 'Alex Rivera',
        role: user?.title || 'Engineer',
        avatarUrl: user?.avatarUrl || mockUsers[0].avatarUrl,
        timestamp: 'Just now',
        content: commentText,
      },
    ]);
    setCommentText('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/issues')}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Issue Tracker
        </button>

        <div className="flex items-center gap-2">
          <Link
            to="/editor"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5" /> Analyze in AI Editor
          </Link>
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-muted-foreground">{issue.id}</span>
            <SeverityBadge severity={issue.severity} />
            <StatusBadge status={issue.status} />
            <RiskPill score={issue.riskScore} />
          </div>

          {/* Quick status toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Status:</span>
            <select
              value={issue.status}
              onChange={(e) => updateStatus(issue.id, e.target.value as IssueStatus)}
              className="text-xs font-semibold bg-muted/60 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none cursor-pointer"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{issue.title}</h1>
        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">{issue.description}</p>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Repository</span>
            <span className="font-mono font-semibold text-foreground">{issue.project}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">File Location</span>
            <span className="font-mono font-semibold text-foreground">
              {issue.fileLocation}:{issue.lineRange}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Reported</span>
            <span className="font-semibold text-foreground">{issue.createdAt.split('T')[0]}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Assignee</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <img
                src={issue.assignee.avatarUrl}
                alt={issue.assignee.name}
                className="w-4 h-4 rounded-full"
              />
              <select
                value={issue.assignee.id}
                onChange={(e) => {
                  const targetUser = mockUsers.find((u) => u.id === e.target.value);
                  if (targetUser) {
                    updateAssignee(issue.id, {
                      id: targetUser.id,
                      name: targetUser.name,
                      avatarUrl: targetUser.avatarUrl,
                    });
                  }
                }}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                {mockUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-card text-foreground">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Highlight */}
      {issue.codeSnippet && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-primary" /> Risky Code Location
            </h3>
            <span className="text-xs font-mono text-muted-foreground">{issue.lineRange}</span>
          </div>

          <div className="bg-[#1e1e1e] p-4 rounded-xl border border-border overflow-x-auto">
            <pre className="font-mono text-xs text-rose-300 leading-relaxed">
              {issue.codeSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* Discussion & Resolution Thread */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> Engineering Discussion ({comments.length})
          </h3>
          <span className="text-xs text-muted-foreground">Collaborative team triage</span>
        </div>

        {/* Comment list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 text-xs">
              <img
                src={comment.avatarUrl}
                alt={comment.author}
                className="w-8 h-8 rounded-full border border-border flex-shrink-0"
              />
              <div className="flex-1 bg-muted/30 border border-border/80 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{comment.author}</span>
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.2 rounded bg-muted">
                      {comment.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{comment.timestamp}</span>
                </div>
                <p className="text-foreground/90 leading-relaxed text-xs">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add comment box */}
        <form onSubmit={handleAddComment} className="pt-2 border-t border-border flex gap-3">
          <img
            src={user?.avatarUrl || mockUsers[0].avatarUrl}
            alt="You"
            className="w-8 h-8 rounded-full border border-border flex-shrink-0"
          />
          <div className="flex-1 space-y-2">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a comment, propose mitigation, or link a pull request..."
              className="w-full text-xs bg-muted/50 border border-border rounded-xl p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Post Comment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

