import { create } from 'zustand';
import { Issue, IssueStatus, Severity } from '../types';
import { mockIssues } from '../api/mockData';

interface IssueState {
  issues: Issue[];
  selectedIssue: Issue | null;
  filterSeverity: Severity | 'all';
  filterStatus: IssueStatus | 'all';
  filterAssignee: string | 'all';
  searchQuery: string;

  setSelectedIssue: (issue: Issue | null) => void;
  setFilterSeverity: (sev: Severity | 'all') => void;
  setFilterStatus: (stat: IssueStatus | 'all') => void;
  setFilterAssignee: (assigneeId: string | 'all') => void;
  setSearchQuery: (query: string) => void;
  updateStatus: (id: string, status: IssueStatus) => void;
  updateAssignee: (id: string, assignee: { id: string; name: string; avatarUrl: string }) => void;
  createIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => void;
}

export const useIssueStore = create<IssueState>((set) => ({
  issues: mockIssues,
  selectedIssue: mockIssues[0],
  filterSeverity: 'all',
  filterStatus: 'all',
  filterAssignee: 'all',
  searchQuery: '',

  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  setFilterSeverity: (filterSeverity) => set({ filterSeverity }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterAssignee: (filterAssignee) => set({ filterAssignee }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  updateStatus: (id, status) => {
    set((state) => {
      const updated = state.issues.map((issue) =>
        issue.id === id ? { ...issue, status, updatedAt: new Date().toISOString() } : issue
      );
      const selected = state.selectedIssue?.id === id
        ? { ...state.selectedIssue, status, updatedAt: new Date().toISOString() }
        : state.selectedIssue;

      return { issues: updated, selectedIssue: selected };
    });
  },

  updateAssignee: (id, assignee) => {
    set((state) => {
      const updated = state.issues.map((issue) =>
        issue.id === id ? { ...issue, assignee, updatedAt: new Date().toISOString() } : issue
      );
      const selected = state.selectedIssue?.id === id
        ? { ...state.selectedIssue, assignee, updatedAt: new Date().toISOString() }
        : state.selectedIssue;

      return { issues: updated, selectedIssue: selected };
    });
  },

  createIssue: (newIssueData) => {
    const newIssue: Issue = {
      ...newIssueData,
      id: `ISSUE-${Math.floor(Math.random() * 900 + 1050)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentsCount: 0,
    };
    set((state) => ({
      issues: [newIssue, ...state.issues],
      selectedIssue: newIssue,
    }));
  },
}));

