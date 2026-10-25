
import React, { useCallback, useEffect, useState } from 'react';
import { githubApi } from '../../api/githubApi';

import type {
  GitHubRepository,
  GitHubPullRequest,
  GitHubCommit,
} from '../../api/githubApi';

import {
  Github,
  GitBranch,
  GitPullRequest,
  GitCommit,
  AlertTriangle,
  ExternalLink,
  Plus,
  RefreshCw,
  Star,
  GitFork,
} from 'lucide-react';

type GitHubTab = 'repos' | 'prs' | 'commits';

export const GitHubIntegrationPage: React.FC = () => {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
const [selectedRepoId, setSelectedRepoId] = useState('');
const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
const [prState, setPrState] = useState<'open' | 'closed' | 'all'>('open');
const [isLoadingPRs, setIsLoadingPRs] = useState(false);
const [prError, setPrError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GitHubTab>('repos');

const [commits, setCommits] = useState<GitHubCommit[]>([]);
const [isLoadingCommits, setIsLoadingCommits] = useState(false);
const [commitError, setCommitError] = useState<string | null>(null);


  const loadRepositories = useCallback(async () => {
    setIsLoadingRepos(true);
    setRepoError(null);

    try {
      const status = await githubApi.getStatus();

      setIsConnected(status.connected);
      setGithubUsername(status.github_username ?? '');

      if (!status.connected) {
        setRepos([]);
        return;
      }

      const result = await githubApi.getRepositories();
      setRepos(result.repositories ?? []);
      setGithubUsername(
        result.github_username || status.github_username || ''
      );
    } catch (error) {
      console.error('Failed to load GitHub repositories:', error);
      setRepoError(
        'Could not load your GitHub repositories. Check your connection and try again.'
      );
    } finally {
      setIsLoadingRepos(false);
    }
  }, []);

  const loadPullRequests = useCallback(async () => {
    if (!selectedRepoId) {
      setPullRequests([]);
      setPrError(null);
      return;
    }

    const selectedRepo = repos.find(
      (repo) => String(repo.id) === selectedRepoId
    );

    if (!selectedRepo) {
      setPullRequests([]);
      setPrError('The selected repository could not be found.');
      return;
    }

    const [owner, repoName] = selectedRepo.full_name.split('/');

    if (!owner || !repoName) {
      setPullRequests([]);
      setPrError('The repository owner or name is invalid.');
      return;
    }

    setIsLoadingPRs(true);
    setPrError(null);

    try {
      const result = await githubApi.getPullRequests(
        owner,
        repoName,
        prState
      );
      setPullRequests(result.pull_requests ?? []);
    } catch (error) {
      console.error('Failed to load GitHub pull requests:', error);
      setPullRequests([]);
      setPrError(
        'Could not load pull requests. Check your GitHub connection and try again.'
      );
    } finally {
      setIsLoadingPRs(false);
    }
  }, [selectedRepoId, repos, prState]);

const loadCommits = useCallback(async () => {
  if (!selectedRepoId) {
    setCommits([]);
    setCommitError(null);
    return;
  }

  const selectedRepo = repos.find(
    (repo) => String(repo.id) === selectedRepoId
  );

  if (!selectedRepo) {
    setCommits([]);
    setCommitError('The selected repository could not be found.');
    return;
  }

  const [owner, repoName] = selectedRepo.full_name.split('/');

  if (!owner || !repoName) {
    setCommits([]);
    setCommitError('The repository owner or name is invalid.');
    return;
  }

  setIsLoadingCommits(true);
  setCommitError(null);

  try {
    const result = await githubApi.getCommits(
      owner,
      repoName,
      undefined,
      1,
      30
    );

    setCommits(result.commits ?? []);
  } catch (error) {
    console.error('Failed to load GitHub commits:', error);
    setCommits([]);
    setCommitError(
      'Could not load commits. Check your GitHub connection and try again.'
    );
  } finally {
    setIsLoadingCommits(false);
  }
}, [selectedRepoId, repos]);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  useEffect(() => {
    void loadPullRequests();
  }, [loadPullRequests]);

useEffect(() => {
  void loadCommits();
}, [loadCommits]);

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    setConnectError(null);

    try {
      const authorizationUrl = await githubApi.getConnectUrl();
      window.location.assign(authorizationUrl);
    } catch (error) {
      console.error('Failed to start GitHub authorization:', error);
      setConnectError(
        'Could not start GitHub authorization. Please check that the backend is running and try again.'
      );
      setIsConnecting(false);
    }
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return 'Unavailable';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Unavailable';

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderEmptyState = (
    icon: React.ReactNode,
    title: string,
    description: string
  ) => (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mb-3 flex justify-center text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Github className="h-6 w-6" />
            GitHub Repository Integration
          </h1>

          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Browse repositories and prepare for pull request and commit analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadRepositories()}
            disabled={isLoadingRepos}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoadingRepos ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => void handleConnectGitHub()}
            disabled={isConnecting}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isConnecting
              ? 'Connecting...'
              : isConnected
                ? 'Reconnect GitHub'
                : 'Connect GitHub'}
          </button>
        </div>
      </div>

      {/* Connection status */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Github className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              {isConnected ? 'GitHub connected' : 'GitHub not connected'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isConnected
                ? `Connected account: ${githubUsername || 'GitHub user'}`
                : 'Connect your GitHub account to retrieve accessible repositories.'}
            </p>
          </div>
        </div>

        {isConnected && (
          <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-500">
            Connected
          </span>
        )}
      </div>

      {connectError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-sm text-foreground">{connectError}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('repos')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'repos'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitBranch className="h-4 w-4" />
          Repositories ({repos.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prs')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'prs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitPullRequest className="h-4 w-4" />
          Pull Requests
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('commits')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'commits'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitCommit className="h-4 w-4" />
          Commits
        </button>
      </div>

      {/* Repositories */}
      {activeTab === 'repos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {isConnected
                ? `${repos.length} repositories available`
                : 'Connect GitHub to load repositories'}
            </p>

            {isConnected && githubUsername && (
              <span className="text-xs text-muted-foreground">
                Account: {githubUsername}
              </span>
            )}
          </div>

          {isLoadingRepos ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">
                Loading GitHub repositories...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Retrieving data from your connected GitHub account.
              </p>
            </div>
          ) : repoError ? (
            <div
              role="alert"
              className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center"
            >
              <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-rose-500" />
              <p className="text-sm text-foreground">{repoError}</p>
              <button
                type="button"
                onClick={() => void loadRepositories()}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
              >
                Try again
              </button>
            </div>
          ) : !isConnected ? (
            renderEmptyState(
              <Github className="h-8 w-8" />,
              'Connect your GitHub account',
              'Authorize GitHub to view repositories that your account can access.'
            )
          ) : repos.length === 0 ? (
            renderEmptyState(
              <GitBranch className="h-8 w-8" />,
              'No repositories found',
              'The GitHub API did not return any accessible repositories for this account.'
            )
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {repos.map((repo, index) => (
                <div
                  key={repo.id}
                  className={`animated-card card-shimmer animate-fade-in-up stagger-${Math.min(index + 1, 6)} space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/60`}
                >
                  {/* Repository name and visibility */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4 shrink-0 text-foreground" />

                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all font-mono text-sm font-bold text-foreground hover:text-primary"
                        >
                          {repo.name}
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      </div>

                      <p className="break-all text-xs text-muted-foreground">
                        {repo.full_name}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                      {repo.private ? 'Private' : 'Public'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="min-h-8 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {repo.description || 'No description provided.'}
                  </p>

                  {/* Repository metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {repo.stars}
                    </span>

                    <span className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5" />
                      {repo.forks}
                    </span>

                    {repo.language && (
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">
                        {repo.language}
                      </span>
                    )}
                  </div>

                  {/* Branch and issues */}
                  <div className="space-y-2 rounded-xl border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-3 text-xs">
                      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                        <GitBranch className="h-3.5 w-3.5" />
                        Default branch
                      </span>
                      <span className="break-all text-right font-mono font-semibold text-foreground">
                        {repo.default_branch || 'Unavailable'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Open issues
                      </span>
                      <span className="font-semibold text-foreground">
                        {repo.open_issues}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Last updated
                      </span>
                      <span className="text-right text-foreground">
                        {formatDate(repo.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* Real GitHub action */}
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      Live GitHub metadata
                    </span>

                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Open repository
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

{/* Pull Requests */}
{activeTab === 'prs' && (
  <div className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Repository pull requests
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Live pull-request data retrieved from GitHub.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={selectedRepoId}
          onChange={(event) => setSelectedRepoId(event.target.value)}
          disabled={!isConnected || repos.length === 0}
          aria-label="Select repository"
          className="min-w-0 max-w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
        >
          <option value="">Select a repository</option>
          {repos.map((repo) => (
            <option key={repo.id} value={String(repo.id)}>
              {repo.full_name}
            </option>
          ))}
        </select>

        <select
          value={prState}
          onChange={(event) =>
            setPrState(event.target.value as 'open' | 'closed' | 'all')
          }
          aria-label="Filter pull requests by state"
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="all">All states</option>
        </select>

        <button
          type="button"
          onClick={() => void loadPullRequests()}
          disabled={!selectedRepoId || isLoadingPRs}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoadingPRs ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>
    </div>

    {!isConnected ? (
      renderEmptyState(
        <Github className="h-8 w-8" />,
        'Connect GitHub first',
        'Connect your GitHub account to retrieve real pull requests.'
      )
    ) : repos.length === 0 ? (
      renderEmptyState(
        <GitBranch className="h-8 w-8" />,
        'No repositories available',
        'Refresh your repositories or check your GitHub account permissions.'
      )
    ) : !selectedRepoId ? (
      renderEmptyState(
        <GitPullRequest className="h-8 w-8" />,
        'Select a repository',
        'Choose a repository above to load its pull requests.'
      )
    ) : isLoadingPRs ? (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">
          Loading pull requests...
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Retrieving real pull-request data from GitHub.
        </p>
      </div>
    ) : prError ? (
      <div
        role="alert"
        className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center"
      >
        <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-rose-500" />
        <p className="text-sm text-foreground">{prError}</p>
        <button
          type="button"
          onClick={() => void loadPullRequests()}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    ) : pullRequests.length === 0 ? (
      renderEmptyState(
        <GitPullRequest className="h-8 w-8" />,
        'No pull requests found',
        `GitHub returned no ${prState === 'all' ? '' : `${prState} `}pull requests for this repository.`
      )
    ) : (
      <>
        <p className="text-xs text-muted-foreground">
          Showing {pullRequests.length} pull requests for{' '}
          <span className="font-semibold text-foreground">
            {repos.find((repo) => String(repo.id) === selectedRepoId)?.full_name}
          </span>
        </p>

        <div className="space-y-3">
          {pullRequests.map((pr) => (
            <article
              key={pr.id}
              className="space-y-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50 sm:p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <GitPullRequest
                      className={`h-4 w-4 ${
                        pr.merged_at
                          ? 'text-violet-500'
                          : pr.state === 'open'
                            ? 'text-emerald-500'
                            : 'text-muted-foreground'
                      }`}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      #{pr.number}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        pr.merged_at
                          ? 'border-violet-500/30 bg-violet-500/10 text-violet-500'
                          : pr.state === 'open'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                            : 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {pr.merged_at
                        ? 'Merged'
                        : pr.state === 'open'
                          ? 'Open'
                          : 'Closed'}
                    </span>
                    {pr.draft && (
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </div>

                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-words text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {pr.title}
                    <ExternalLink className="ml-1 inline h-3 w-3" />
                  </a>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {pr.author ? `Opened by ${pr.author}` : 'Author unavailable'}
                    {' · '}
                    Updated {formatDate(pr.updated_at)}
                  </p>
                </div>

                <a
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  View on GitHub
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {pr.body && (
                <p className="whitespace-pre-line break-words text-xs leading-5 text-muted-foreground">
                  {pr.body.length > 300
                    ? `${pr.body.slice(0, 300)}…`
                    : pr.body}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span className="max-w-40 break-all font-mono">
                    {pr.head_branch || 'Unknown'}
                  </span>
                  <span>→</span>
                  <span className="max-w-40 break-all font-mono">
                    {pr.base_branch || 'Unknown'}
                  </span>
                </span>

                <span>{pr.comments} comments</span>
                <span>Created {formatDate(pr.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      </>
    )}
  </div>
)}


{/* Commits */}
{activeTab === 'commits' && (
  <div className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Repository commit history
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Real commits retrieved from the GitHub API.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={selectedRepoId}
          onChange={(event) => setSelectedRepoId(event.target.value)}
          disabled={!isConnected || repos.length === 0}
          aria-label="Select repository for commits"
          className="min-w-0 max-w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
        >
          <option value="">Select a repository</option>
          {repos.map((repo) => (
            <option key={repo.id} value={String(repo.id)}>
              {repo.full_name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => void loadCommits()}
          disabled={!selectedRepoId || isLoadingCommits}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              isLoadingCommits ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </button>
      </div>
    </div>

    {!isConnected ? (
      renderEmptyState(
        <Github className="h-8 w-8" />,
        'Connect GitHub first',
        'Connect your GitHub account to retrieve real commits.'
      )
    ) : repos.length === 0 ? (
      renderEmptyState(
        <GitBranch className="h-8 w-8" />,
        'No repositories available',
        'Refresh your repositories or check your GitHub account permissions.'
      )
    ) : !selectedRepoId ? (
      renderEmptyState(
        <GitCommit className="h-8 w-8" />,
        'Select a repository',
        'Choose a repository above to load its commit history.'
      )
    ) : isLoadingCommits ? (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">
          Loading commits...
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Retrieving real commit history from GitHub.
        </p>
      </div>
    ) : commitError ? (
      <div
        role="alert"
        className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center"
      >
        <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-rose-500" />
        <p className="text-sm text-foreground">{commitError}</p>
        <button
          type="button"
          onClick={() => void loadCommits()}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    ) : commits.length === 0 ? (
      renderEmptyState(
        <GitCommit className="h-8 w-8" />,
        'No commits found',
        'GitHub returned no commits for this repository and page.'
      )
    ) : (
      <>
        <p className="text-xs text-muted-foreground">
          Showing {commits.length} recent commits for{' '}
          <span className="font-semibold text-foreground">
            {repos.find(
              (repo) => String(repo.id) === selectedRepoId
            )?.full_name}
          </span>
        </p>

        <div className="space-y-3">
          {commits.map((commit) => (
            <article
              key={commit.sha}
              className="space-y-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50 sm:p-5"
            >
              <div className="flex items-start gap-3">
                {commit.author_avatar_url ? (
                  <img
                    src={commit.author_avatar_url}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 shrink-0 rounded-full border border-border"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <GitCommit className="h-4 w-4" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-words text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {commit.message || 'No commit message'}
                    <ExternalLink className="ml-1 inline h-3 w-3" />
                  </a>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {commit.author || 'Author unavailable'}
                    {' · '}
                    {formatDate(commit.committed_at)}
                  </p>

                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {commit.short_sha}
                  </p>
                </div>

                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View commit ${commit.short_sha} on GitHub`}
                  className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </>
    )}
  </div>
)}

    </div>
  );
};
