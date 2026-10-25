
import { apiClient } from './client';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  language: string | null;
  default_branch: string;
  stars: number;
  forks: number;
  open_issues: number;
  updated_at: string;
  pushed_at: string | null;
}

export interface GitHubRepositoriesResponse {
  connected: boolean;
  github_username: string;
  count: number;
  repositories: GitHubRepository[];
}

export interface GitHubConnectionStatus {
  connected: boolean;
  github_username?: string | null;
  github_avatar_url?: string | null;
  connected_at?: number | null;
}
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  draft: boolean;
  author: string | null;
  author_avatar_url: string | null;
  head_branch: string | null;
  base_branch: string | null;
  head_sha: string | null;
  created_at: string | null;
  updated_at: string | null;
  closed_at: string | null;
  merged_at: string | null;
  comments: number;
  commits: number;
  changed_files: number;
  additions: number;
  deletions: number;
}

export interface GitHubPullRequestsResponse {
  repository: string;
  github_username: string | null;
  state: 'open' | 'closed' | 'all';
  page: number;
  per_page: number;
  count: number;
  pull_requests: GitHubPullRequest[];
}

export interface GitHubCommit {
  sha: string;
  short_sha: string;
  message: string;
  author: string | null;
  author_avatar_url: string | null;
  author_email: string | null;
  committed_at: string | null;
  html_url: string;
}

export interface GitHubCommitsResponse {
  repository: string;
  github_username: string | null;
  branch: string | null;
  page: number;
  per_page: number;
  count: number;
  commits: GitHubCommit[];
}

export const githubApi = {
  async getStatus(): Promise<GitHubConnectionStatus> {
    const response = await apiClient.get<GitHubConnectionStatus>(
      '/github/status'
    );

    return response.data;
  },

async getCommits(
  owner: string,
  repo: string,
  branch?: string,
  page = 1,
  perPage = 30
): Promise<GitHubCommitsResponse> {
  const response = await apiClient.get<GitHubCommitsResponse>(
    `/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`,
    {
      params: {
        ...(branch ? { branch } : {}),
        page,
        per_page: perPage,
      },
    }
  );

  return response.data;
},

  async getRepositories(): Promise<GitHubRepositoriesResponse> {
    const response = await apiClient.get<GitHubRepositoriesResponse>(
      '/github/repositories'
    );

    return response.data;
  },

  async getConnectUrl(): Promise<string> {
    const response = await apiClient.get<{ authorization_url: string }>(
      '/github/connect'
    );

    return response.data.authorization_url;
  },
async getPullRequests(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'open',
): Promise<GitHubPullRequestsResponse> {
  const response = await apiClient.get<GitHubPullRequestsResponse>(
    `/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pull-requests`,
    { params: { state, page: 1, per_page: 30 } },
  );

  return response.data;
},
};
