import { create } from 'zustand';
import { Project, TaskItem, GitHubRepo, PullRequestItem, CommitItem } from '../types';
import {
  mockProjects,
  mockTasks,
  mockGitHubRepos,
  mockPullRequests,
  mockCommits,
  mockUsers,
} from '../api/mockData';

interface ProjectState {
  projects: Project[];
  tasks: TaskItem[];
  repos: GitHubRepo[];
  pullRequests: PullRequestItem[];
  commits: CommitItem[];
  selectedProject: Project;
  isScanningRepo: boolean;
  scanProgress: number; // 0 to 100
  scanCurrentStep: string;

  setSelectedProject: (proj: Project) => void;
  moveTask: (taskId: string, newStatus: TaskItem['status']) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  connectRepo: (repoName: string) => void;
  triggerRepoScan: (repoId: string) => Promise<void>;
  addProjectMember: (projectId: string, email: string, role: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: mockProjects,
  tasks: mockTasks,
  repos: mockGitHubRepos,
  pullRequests: mockPullRequests,
  commits: mockCommits,
  selectedProject: mockProjects[0],
  isScanningRepo: false,
  scanProgress: 0,
  scanCurrentStep: '',

  setSelectedProject: (selectedProject) => set({ selectedProject }),

  moveTask: (taskId, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    }));
  },

  addTask: (taskData) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `TSK-${Math.floor(Math.random() * 800 + 300)}`,
    };
    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }));
  },

  connectRepo: (repoName: string) => {
    const newRepo: GitHubRepo = {
      id: 'repo-' + Date.now(),
      name: repoName,
      owner: repoName.split('/')[0] || 'codepulse',
      stars: 12,
      forks: 2,
      openPRs: 0,
      lastCommitMessage: 'Initial sync with BugPulse AI',
      lastCommitHash: 'a71b29c',
      lastCommitDate: 'Just now',
      branch: 'main',
      isConnected: true,
      scanStatus: 'idle',
    };
    set((state) => ({
      repos: [newRepo, ...state.repos],
    }));
  },

  triggerRepoScan: async (repoId: string) => {
    set({
      isScanningRepo: true,
      scanProgress: 10,
      scanCurrentStep: 'Cloning tree & parsing Abstract Syntax Trees (AST)...',
    });

    // Update repo status in state
    set((state) => ({
      repos: state.repos.map((r) =>
        r.id === repoId ? { ...r, scanStatus: 'scanning' } : r
      ),
    }));

    await new Promise((r) => setTimeout(r, 900));
    set({ scanProgress: 35, scanCurrentStep: 'Constructing Control Flow & Call Graph hierarchies...' });

    await new Promise((r) => setTimeout(r, 1100));
    set({ scanProgress: 65, scanCurrentStep: 'Executing DeepCode ML Bug Prediction Neural Heuristics...' });

    await new Promise((r) => setTimeout(r, 1000));
    set({ scanProgress: 90, scanCurrentStep: 'Evaluating OWASP Top 10 & CWE vulnerability signatures...' });

    await new Promise((r) => setTimeout(r, 700));
    set({
      scanProgress: 100,
      scanCurrentStep: 'Scan complete! Generated 3 bug insights and 1 refactoring PR.',
      isScanningRepo: false,
    });

    set((state) => ({
      repos: state.repos.map((r) =>
        r.id === repoId ? { ...r, scanStatus: 'warning', lastScanRiskScore: 78 } : r
      ),
    }));
  },

  addProjectMember: (projectId: string, email: string, role: string) => {
    const existingUser = mockUsers.find((u) => u.email === email) || {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0],
      email,
      role: 'developer' as const,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
    };

    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              members: [
                ...proj.members,
                {
                  id: existingUser.id,
                  name: existingUser.name,
                  email: existingUser.email,
                  role: role || 'Contributor',
                  avatarUrl: existingUser.avatarUrl,
                },
              ],
            }
          : proj
      ),
    }));
  },
}));

