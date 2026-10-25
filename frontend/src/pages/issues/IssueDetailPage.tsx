
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Shield,
  MessageSquare,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Issue, IssueStatus, Severity } from '../../types';

type FixSuggestion = {
  summary: string;
  root_cause: string;
  explanation: string;
  fixed_code: string;
  changes: string[];
  regression_tests: string[];
  severity_after_fix: 'critical' | 'high' | 'medium' | 'low' | 'none';
  limitations: string[];
};

type FixGenerationResponse = {
  issueId: string;
  suggestion: FixSuggestion;
  provider: string;
  model: string;
  validation_status: 'not_run';
  validation?: FixValidation
};

type ApiIssue = {
  id: string;
  title: string;
  description?: string;
  severity: Severity;
  status: IssueStatus;
  risk_score?: number;
  project?: string;
  file_location?: string;
  line_range?: string;
  assignee?: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  code_snippet?: string | null;
  comments_count?: number;
};
type FixValidation = {
  status: 'passed' | 'failed' | 'unsupported';
  message: string;
  validator: string;
  checked_at: string;
};

const mapApiIssue = (data: ApiIssue): Issue => ({
  id: data.id,
  title: data.title,
  description: data.description ?? '',
  severity: data.severity,
  status: data.status,
  riskScore: data.risk_score ?? 0,
  project: data.project ?? '',
  fileLocation: data.file_location ?? '',
  lineRange: data.line_range ?? '',
  assignee: data.assignee
    ? {
        id: data.assignee.id,
        name: data.assignee.name,
        avatarUrl: data.assignee.avatar_url ?? '',
      }
    : {
        id: '',
        name: 'Unassigned',
        avatarUrl: '',
      },
  createdAt: data.created_at ?? '',
  updatedAt: data.updated_at ?? '',
  tags: data.tags ?? [],
  codeSnippet: data.code_snippet ?? undefined,
  commentsCount: data.comments_count ?? 0,
});


const formatDate = (value?: string) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getSeverityClass = (severity: Severity) => {
  if (severity === 'critical' || severity === 'high') {
    return 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900';
  }

  if (severity === 'medium') {
    return 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900';
  }

  return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
};

const getStatusClass = (status: IssueStatus) => {
  if (status === 'resolved') {
    return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
  }

  if (status === 'in_progress') {
    return 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900';
  }

  return 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900';
};

const formatStatus = (status: IssueStatus) =>
  status === 'in_progress'
    ? 'In progress'
    : status.charAt(0).toUpperCase() + status.slice(1);

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [fixTab, setFixTab] = useState<
    'Optimization' | 'Refactoring' | 'Tests'
  >('Optimization');

const [generatedFix, setGeneratedFix] =
  useState<FixGenerationResponse | null>(null);
const [isGeneratingFix, setIsGeneratingFix] = useState(false);
const [fixError, setFixError] = useState('');
const [fixCopied, setFixCopied] = useState(false);
const [isValidatingFix, setIsValidatingFix] = useState(false);
const [validationError, setValidationError] = useState('');

const loadIssue = useCallback(async () => {
  if (!id) {
    setError('No issue ID was provided in the URL.');
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  setError('');
  setFixError('');
  setGeneratedFix(null);

  try {
    const response = await apiClient.get<ApiIssue>(
      `/issues/${encodeURIComponent(id)}`
    );

    setIssue(mapApiIssue(response.data));

    // Load the saved AI fix without generating a new one.
    try {
      const fixResponse = await apiClient.get<FixGenerationResponse>(
        `/analysis/issues/${encodeURIComponent(id)}/fix`
      );

      setGeneratedFix(fixResponse.data);
    } catch (fixErr: unknown) {
      const responseData =
        typeof fixErr === 'object' &&
        fixErr !== null &&
        'response' in fixErr
          ? fixErr.response
          : null;

      const statusCode =
        typeof responseData === 'object' &&
        responseData !== null &&
        'status' in responseData &&
        typeof responseData.status === 'number'
          ? responseData.status
          : undefined;

      if (statusCode === 404) {
        // No saved fix yet; the user can generate one.
        setGeneratedFix(null);
      } else {
        setFixError(
          'Could not load the saved AI fix. You can still generate a new one.'
        );
      }
    }
  } catch (err: unknown) {
    const responseData =
      typeof err === 'object' && err !== null && 'response' in err
        ? err.response
        : null;

    const statusCode =
      typeof responseData === 'object' &&
      responseData !== null &&
      'status' in responseData &&
      typeof responseData.status === 'number'
        ? responseData.status
        : undefined;

    setError(
      statusCode === 404
        ? 'This issue could not be found in your account.'
        : 'Unable to load this issue. Check your connection and try again.'
    );
  } finally {
    setIsLoading(false);
  }
}, [id]);


  useEffect(() => {
    void loadIssue();
  }, [loadIssue]);

  const handleStatusChange = async (nextStatus: IssueStatus) => {
    if (!issue || nextStatus === issue.status || isSaving) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await apiClient.patch<ApiIssue>(
        `/issues/${encodeURIComponent(issue.id)}`,
        { status: nextStatus }
      );

      setIssue(mapApiIssue(response.data));
    } catch {
      setError('Could not update the issue status. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!issue?.codeSnippet) return;

    try {
      await navigator.clipboard.writeText(issue.codeSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not access the clipboard. Please copy the code manually.');
    }
  };

const handleGenerateFix = async () => {
  if (!issue || isGeneratingFix) return;

  if (!issue.codeSnippet?.trim()) {
    setFixError(
      'This issue has no code snippet. Add relevant source code before generating a fix.'
    );
    return;
  }

  setIsGeneratingFix(true);
  setFixError('');
  setGeneratedFix(null);

  try {
    const response = await apiClient.post<FixGenerationResponse>(
      `/analysis/issues/${encodeURIComponent(issue.id)}/generate-fix`
    );

    setGeneratedFix(response.data);
    setFixTab('Optimization');
  } catch (err: unknown) {
    const responseData =
      typeof err === 'object' && err !== null && 'response' in err
        ? err.response
        : null;

    const detail =
      typeof responseData === 'object' &&
      responseData !== null &&
      'data' in responseData &&
      typeof responseData.data === 'object' &&
      responseData.data !== null &&
      'detail' in responseData.data &&
      typeof responseData.data.detail === 'string'
        ? responseData.data.detail
        : null;

    setFixError(
      detail || 'Could not generate an AI fix. Please try again.'
    );
  } finally {
    setIsGeneratingFix(false);
  }
};

const handleValidateFix = async () => {
  if (!issue?.id || !generatedFix) return;

  setIsValidatingFix(true);
  setValidationError('');

  try {
    const response = await apiClient.post(
      `/analysis/issues/${encodeURIComponent(issue.id)}/validate-fix`
    );

    const validation = response.data.validation as FixValidation;

    setGeneratedFix((previous) =>
      previous ? { ...previous, validation } : previous
    );
  } catch (error: any) {
    setValidationError(
      error?.response?.data?.detail ||
        'Could not validate the saved AI fix. Please try again.'
    );
  } finally {
    setIsValidatingFix(false);
  }
};

const handleCopyFix = async () => {
  if (!generatedFix?.suggestion.fixed_code) return;

  try {
    await navigator.clipboard.writeText(
      generatedFix.suggestion.fixed_code
    );
    setFixCopied(true);
    window.setTimeout(() => setFixCopied(false), 2000);
  } catch {
    setFixError('Could not access the clipboard. Please copy the code manually.');
  }
};

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center text-sm text-slate-500">
        Loading issue details…
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <button
          type="button"
          onClick={() => navigate('/issues')}
          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bug History
        </button>

        <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-[#0c1322]">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Unable to display issue
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => void loadIssue()}
            className="mt-4 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const riskColor =
    issue.riskScore >= 70
      ? 'text-rose-600 dark:text-rose-400'
      : issue.riskScore >= 40
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate('/issues')}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Bug History
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span>Bug History</span>
            <span>/</span>
            <span className="font-mono">{issue.id}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 break-words">
            {issue.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs mt-3">
            <span className="font-mono text-slate-500">
              {issue.id}
              {issue.project ? ` / ${issue.project}` : ''}
              {issue.fileLocation ? ` / ${issue.fileLocation}` : ''}
              {issue.lineRange ? ` : ${issue.lineRange}` : ''}
            </span>

            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getSeverityClass(issue.severity)}`}
            >
              {issue.severity.toUpperCase()} severity
            </span>

            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getStatusClass(issue.status)}`}
            >
              {formatStatus(issue.status)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="issue-status" className="text-xs text-slate-500">
            Update status
          </label>
          <select
            id="issue-status"
            value={issue.status}
            disabled={isSaving}
            onChange={(event) =>
              void handleStatusChange(event.target.value as IssueStatus)
            }
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 disabled:opacity-50"
          >
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {isSaving && (
            <span className="text-xs text-slate-400">Saving…</span>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-sm text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Issue description */}
          <section className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Issue details
              </h2>
              <span className="text-[11px] text-slate-400">Saved issue record</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {issue.description || 'No description was provided for this issue.'}
            </p>

            {issue.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-md text-[11px] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">
                  Created
                </div>
                <div className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                  {formatDate(issue.createdAt)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">
                  Last updated
                </div>
                <div className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                  {formatDate(issue.updatedAt)}
                </div>
              </div>
            </div>
          </section>

          {/* Code snippet */}
          <section className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Code snippet
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">
                  {issue.fileLocation || 'No file location provided'}
                </p>
              </div>

              {issue.codeSnippet && (
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy code'}
                </button>
              )}
            </div>

            {issue.codeSnippet ? (
              <pre className="rounded-xl border border-slate-800 bg-[#0c1322] text-slate-300 p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                <code>{issue.codeSnippet}</code>
              </pre>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                No code snippet is attached to this issue yet.
              </p>
            )}

            <p className="text-[11px] text-slate-400">
              Review any proposed code changes and validate them with tests before applying them.
            </p>
          </section>

          
{/* AI-generated fix */}
<section className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
        Analysis and remediation
      </h2>
      <p className="text-[11px] text-slate-400 mt-1">
        AI-generated recommendations based on this issue's code
      </p>
    </div>

    <button
      type="button"
      onClick={() => void handleGenerateFix()}
      disabled={isGeneratingFix || !issue.codeSnippet?.trim()}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Sparkles className={`w-4 h-4 ${isGeneratingFix ? 'animate-pulse' : ''}`} />
      {isGeneratingFix
        ? 'Generating fix…'
        : generatedFix
        ? 'Regenerate fix'
        : 'Generate AI fix'}
    </button>
  </div>

  {!issue.codeSnippet?.trim() && (
    <p className="text-xs text-amber-600 dark:text-amber-400">
      Add a code snippet to this issue before requesting an AI-generated fix.
    </p>
  )}

  {fixError && (
    <div
      role="alert"
      className="flex items-start gap-2 p-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300"
    >
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{fixError}</span>
    </div>
  )}

  {isGeneratingFix && (
    <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
      <Sparkles className="w-5 h-5 text-blue-500 mx-auto mb-2 animate-pulse" />
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Analyzing the issue and preparing a proposed fix…
      </p>
      <p className="text-xs text-slate-400 mt-1">
        This may take a little while.
      </p>
    </div>
  )}

  {generatedFix && !isGeneratingFix && (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-1 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
          NOT TESTED
        </span>
        <span className="text-[11px] text-slate-400">
          Provider: {generatedFix.provider} · Model: {generatedFix.model}
        </span>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
          Proposed fix
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {generatedFix.suggestion.summary}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
          Root cause
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {generatedFix.suggestion.root_cause}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
          Explanation
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {generatedFix.suggestion.explanation}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
            Suggested code
          </h3>
          <button
            type="button"
            onClick={() => void handleCopyFix()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {fixCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {fixCopied ? 'Copied' : 'Copy proposed code'}
          </button>
        </div>

        <pre className="rounded-xl border border-slate-800 bg-[#0c1322] text-slate-300 p-4 text-xs overflow-x-auto whitespace-pre-wrap">
          <code>{generatedFix.suggestion.fixed_code}</code>
        </pre>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
          Changes suggested
        </h3>
        {generatedFix.suggestion.changes.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {generatedFix.suggestion.changes.map((change, index) => (
              <li key={`${index}-${change}`}>{change}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">No change list was provided.</p>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
          Regression test suggestions
        </h3>
        {generatedFix.suggestion.regression_tests.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {generatedFix.suggestion.regression_tests.map((test, index) => (
              <li key={`${index}-${test}`}>{test}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">No regression tests were suggested.</p>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
          Limitations and uncertainties
        </h3>
        {generatedFix.suggestion.limitations.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {generatedFix.suggestion.limitations.map((limitation, index) => (
              <li key={`${index}-${limitation}`}>{limitation}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">No limitations were reported by the AI.</p>
        )}
      </div>

<div className="mt-4 space-y-3">
  <button
    type="button"
    onClick={handleValidateFix}
    disabled={isValidatingFix || !generatedFix}
    className="rounded-lg border border-blue-400/30 px-4 py-2 text-sm font-medium transition hover:bg-blue-400/10 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {isValidatingFix ? 'Validating...' : 'Validate Fix'}
  </button>

  {validationError && (
    <p role="alert" className="text-sm text-red-400">
      {validationError}
    </p>
  )}

  {generatedFix?.validation && (
    <div
      role="status"
      className="rounded-lg border border-white/10 p-3"
    >
      <p className="text-sm font-semibold">
        Syntax Validation:{' '}
        {generatedFix.validation.status.toUpperCase()}
      </p>

      <p className="mt-1 text-sm text-gray-400">
        {generatedFix.validation.message}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        Validator: {generatedFix.validation.validator}
      </p>
    </div>
  )}
</div>

      <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
        This is a proposed change, not a verified repair. Review it and run
        appropriate tests before applying it. Generating a fix does not modify
        your source files.
      </p>
    </>
  )}

  {!generatedFix && !isGeneratingFix && !fixError && (
    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <Sparkles className="w-4 h-4 text-blue-500" />
        Ready to analyze
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Generate an AI fix to see the proposed code, root-cause analysis,
        explanation, and regression-test suggestions here.
      </p>
    </div>
  )}
</section>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <section className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Prediction details
                </h2>
                <span className="text-[11px] text-slate-400">
                  Stored risk score
                </span>
              </div>

              <div className="text-right">
                <span className={`text-2xl font-bold font-mono ${riskColor}`}>
                  {issue.riskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
              </div>
            </div>

            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  issue.riskScore >= 70
                    ? 'bg-rose-500'
                    : issue.riskScore >= 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.max(0, Math.min(100, issue.riskScore))}%`,
                }}
              />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Severity</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {issue.severity.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Status</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {formatStatus(issue.status)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Model confidence</span>
                <span className="text-slate-500">Not available</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Analysis model</span>
                <span className="text-slate-500">Not recorded</span>
              </div>
            </div>
          </section>

          <section className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Ownership
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                {(issue.assignee.name || 'U')
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0].toUpperCase())
                  .join('')}
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {issue.assignee.name || 'Unassigned'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {issue.assignee.id
                    ? 'Assigned to this issue'
                    : 'No assignee recorded'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-4 h-4" />
                Created {formatDate(issue.createdAt)}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MessageSquare className="w-4 h-4" />
                {issue.commentsCount} recorded comments
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Comment history and assignee editing are not connected to the backend yet.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-300">
              <Shield className="w-4 h-4" />
              Validate before applying
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              A stored risk score is not proof of a confirmed runtime failure. Validate findings and changes with appropriate tests.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
