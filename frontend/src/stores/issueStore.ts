
import { create } from 'zustand';
import { apiClient } from '../api/client';
import { Issue, IssueStatus, Severity } from '../types';

interface ApiAssignee {
  id: string;
  name: string;
  avatar_url?: string;
}

interface ApiIssue {
  id: string;
  title: string;
  description?: string;
  severity: Severity;
  status: IssueStatus;
  assignee?: ApiAssignee | null;
  project?: string;
  file_location?: string;
  line_range?: string;
  risk_score?: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  code_snippet?: string | null;
  comments_count?: number;
}

interface IssueListResponse {
  issues: ApiIssue[];
  count: number;
  limit: number;
  offset: number;
}

interface IssueState {
  issues: Issue[];
  selectedIssue: Issue | null;
  filterSeverity: Severity | 'all';
  filterStatus: IssueStatus | 'all';
  filterAssignee: string | 'all';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  loadIssues: () => Promise<void>;
  setSelectedIssue: (issue: Issue | null) => void;
  setFilterSeverity: (severity: Severity | 'all') => void;
  setFilterStatus: (status: IssueStatus | 'all') => void;
  setFilterAssignee: (assigneeId: string | 'all') => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  updateStatus: (id: string, status: IssueStatus) => Promise<void>;
  updateAssignee: (
    id: string,
    assignee: { id: string; name: string; avatarUrl: string } | null
  ) => Promise<void>;
  createIssue: (
    issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>
  ) => Promise<void>;
}

function mapIssue(data: ApiIssue): Issue {
  const assignee = data.assignee;

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? '',
    severity: data.severity,
    status: data.status,
    assignee: {
      id: assignee?.id ?? '',
      name: assignee?.name ?? 'Unassigned',
      avatarUrl: assignee?.avatar_url ?? '',
    },
    project: data.project ?? '',
    fileLocation: data.file_location ?? '',
    lineRange: data.line_range ?? '',
    riskScore: data.risk_score ?? 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    tags: data.tags ?? [],
    codeSnippet: data.code_snippet ?? undefined,
    commentsCount: data.comments_count ?? 0,
  };
}

function getErrorMessage(error: unknown): string {
  const apiMessage = (
    error as {
      response?: { data?: { detail?: string } };
      message?: string;
    }
  )?.response?.data?.detail;

  return (
    apiMessage ||
    (error as { message?: string })?.message ||
    'Something went wrong while accessing issues.'
  );
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  selectedIssue: null,
  filterSeverity: 'all',
  filterStatus: 'all',
  filterAssignee: 'all',
  searchQuery: '',
  isLoading: false,
  error: null,

  loadIssues: async () => {
    set({ isLoading: true, error: null });

    try {
      const allIssues: ApiIssue[] = [];
      const pageSize = 100;
      let offset = 0;
      let total = 0;

      do {
        const response = await apiClient.get<IssueListResponse>(
          '/issues',
          { params: { limit: pageSize, offset } }
        );

        const page = response.data;
        allIssues.push(...page.issues);
        total = page.count;
        offset += page.issues.length;

        if (page.issues.length === 0) break;
      } while (offset < total);

      const issues = allIssues.map(mapIssue);
      const previousSelected = get().selectedIssue;
      const selectedIssue =
        issues.find((issue) => issue.id === previousSelected?.id) ??
        issues[0] ??
        null;

      set({ issues, selectedIssue, error: null });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  setFilterSeverity: (filterSeverity) => set({ filterSeverity }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterAssignee: (filterAssignee) => set({ filterAssignee }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearError: () => set({ error: null }),

  updateStatus: async (id, status) => {
    set({ error: null });

    try {
      const response = await apiClient.patch<ApiIssue>(
        `/issues/${encodeURIComponent(id)}`,
        { status }
      );

      const updatedIssue = mapIssue(response.data);

      set((state) => ({
        issues: state.issues.map((issue) =>
          issue.id === id ? updatedIssue : issue
        ),
        selectedIssue:
          state.selectedIssue?.id === id
            ? updatedIssue
            : state.selectedIssue,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  updateAssignee: async (id, assignee) => {
    set({ error: null });

    try {
      const response = await apiClient.patch<ApiIssue>(
        `/issues/${encodeURIComponent(id)}`,
        {
          assignee: assignee
            ? {
                id: assignee.id,
                name: assignee.name,
                avatar_url: assignee.avatarUrl,
              }
            : null,
        }
      );

      const updatedIssue = mapIssue(response.data);

      set((state) => ({
        issues: state.issues.map((issue) =>
          issue.id === id ? updatedIssue : issue
        ),
        selectedIssue:
          state.selectedIssue?.id === id
            ? updatedIssue
            : state.selectedIssue,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  createIssue: async (issueData) => {
    set({ error: null });

    try {
      const response = await apiClient.post<ApiIssue>('/issues', {
        title: issueData.title,
        description: issueData.description,
        severity: issueData.severity,
        status: issueData.status,
        assignee: issueData.assignee?.id
          ? {
              id: issueData.assignee.id,
              name: issueData.assignee.name,
              avatar_url: issueData.assignee.avatarUrl,
            }
          : null,
        project: issueData.project,
        file_location: issueData.fileLocation,
        line_range: issueData.lineRange,
        risk_score: issueData.riskScore,
        tags: issueData.tags,
        code_snippet: issueData.codeSnippet ?? null,
      });

      const newIssue = mapIssue(response.data);

      set((state) => ({
        issues: [newIssue, ...state.issues],
        selectedIssue: newIssue,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },
}));
