
import { create } from 'zustand';
import { apiClient } from '../api/client';
import type {
  Project,
  TaskItem,
  GitHubRepo,
  PullRequestItem,
  CommitItem,
} from '../types';

interface ApiProject {
  id: string;
  name: string;
  description?: string;
  repo_url?: string;
  default_branch?: string;
  created_at?: string;
  updated_at?: string;
  members?: Array<{
    uid?: string;
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    avatar_url?: string;
    avatarUrl?: string;
  }>;
}

interface ApiTask {
  id: string;
  title: string;
  description?: string;
  status: TaskItem['status'];
  priority: TaskItem['priority'];
  tags?: string[];
  due_date?: string | null;
  assignee_uid?: string | null;
  bug_issue_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProjectState {
  projects: Project[];
  tasks: TaskItem[];
  repos: GitHubRepo[];
  pullRequests: PullRequestItem[];
  commits: CommitItem[];
  selectedProject: Project | null;
  isLoadingProjects: boolean;
  isLoadingTasks: boolean;
  isSavingTask: boolean;
  isScanningRepo: boolean;
  scanProgress: number;
  scanCurrentStep: string;
  error: string | null;

  loadProjects: () => Promise<void>;
  selectProject: (project: Project | null) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  createProject: (input: {
    name: string;
    description?: string;
    repoUrl?: string;
    defaultBranch?: string;
  }) => Promise<void>;
  updateProject: (
    projectId: string,
    input: Partial<Pick<Project, 'name' | 'description' | 'repoUrl' | 'defaultBranch'>>
  ) => Promise<void>;
  loadTasks: (projectId?: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskItem['status']) => Promise<void>;
  addTask: (task: Omit<TaskItem, 'id' | 'assignee'> & {
    assigneeUid?: string;
  }) => Promise<void>;
  connectRepo: (repoName: string) => void;
  triggerRepoScan: (repoId: string) => Promise<void>;
  addProjectMember: (projectId: string, email: string, role: string) => void;
  clearError: () => void;
}

function mapProject(data: ApiProject): Project {
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? '',
    repoUrl: data.repo_url ?? '',
    defaultBranch: data.default_branch ?? 'main',
    createdAt: data.created_at ?? '',
    updatedAt: data.updated_at ?? '',
    members: (data.members ?? []).map((member) => ({
      id: member.uid ?? member.id ?? '',
      name: member.name ?? '',
      email: member.email ?? '',
      role: member.role ?? 'Member',
      avatarUrl: member.avatar_url ?? member.avatarUrl ?? '',
    })),
  };
}

function mapTask(data: ApiTask): TaskItem {
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? '',
    status: data.status,
    priority: data.priority,
    tags: data.tags ?? [],
    dueDate: data.due_date ?? null,
    assigneeUid: data.assignee_uid ?? undefined,
    bugIssueId: data.bug_issue_id,
  };
}

function getErrorMessage(error: unknown): string {
  const responseMessage = (
    error as { response?: { data?: { detail?: unknown } } }
  )?.response?.data?.detail;

  if (typeof responseMessage === 'string') {
    return responseMessage;
  }

  return error instanceof Error
    ? error.message
    : 'An unexpected error occurred.';
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  tasks: [],
  repos: [],
  pullRequests: [],
  commits: [],
  selectedProject: null,
  isLoadingProjects: false,
  isLoadingTasks: false,
  isSavingTask: false,
  isScanningRepo: false,
  scanProgress: 0,
  scanCurrentStep: '',
  error: null,

  loadProjects: async () => {
    set({ isLoadingProjects: true, error: null });

    try {
      const response = await apiClient.get<{ projects: ApiProject[] }>(
        '/projects'
      );
      const projects = response.data.projects.map(mapProject);
      const previousSelected = get().selectedProject;
      const selectedProject =
        projects.find((project) => project.id === previousSelected?.id) ??
        projects[0] ??
        null;

      set({ projects, selectedProject, isLoadingProjects: false });

      if (selectedProject) {
        await get().loadTasks(selectedProject.id);
      } else {
        set({ tasks: [] });
      }
    } catch (error) {
      set({
        isLoadingProjects: false,
        error: `Could not load projects: ${getErrorMessage(error)}`,
      });
    }
  },

  selectProject: async (project) => {
    set({ selectedProject: project, tasks: [], error: null });

    if (project) {
      await get().loadTasks(project.id);
    }
  },

  setSelectedProject: (project) => {
    set({ selectedProject: project });
  },

  createProject: async (input) => {
    set({ error: null });

    try {
      const response = await apiClient.post<ApiProject>('/projects', {
        name: input.name.trim(),
        description: input.description?.trim() ?? '',
        repo_url: input.repoUrl?.trim() ?? '',
        default_branch: input.defaultBranch?.trim() || 'main',
      });

      const project = mapProject(response.data);

      set((state) => ({
        projects: [project, ...state.projects],
        selectedProject: project,
        tasks: [],
      }));
    } catch (error) {
      set({ error: `Could not create project: ${getErrorMessage(error)}` });
      throw error;
    }
  },

  updateProject: async (projectId, input) => {
    set({ error: null });

    const payload: Record<string, string> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description;
    if (input.repoUrl !== undefined) payload.repo_url = input.repoUrl;
    if (input.defaultBranch !== undefined) {
      payload.default_branch = input.defaultBranch;
    }

    try {
      const response = await apiClient.patch<ApiProject>(
        `/projects/${encodeURIComponent(projectId)}`,
        payload
      );
      const updated = mapProject(response.data);

      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? updated : project
        ),
        selectedProject:
          state.selectedProject?.id === projectId
            ? updated
            : state.selectedProject,
      }));
    } catch (error) {
      set({ error: `Could not update project: ${getErrorMessage(error)}` });
      throw error;
    }
  },

  loadTasks: async (projectId) => {
    const targetProjectId = projectId ?? get().selectedProject?.id;

    if (!targetProjectId) {
      set({ tasks: [], isLoadingTasks: false });
      return;
    }

    set({ isLoadingTasks: true, error: null });

    try {
      const response = await apiClient.get<{ tasks: ApiTask[] }>(
        `/projects/${encodeURIComponent(targetProjectId)}/tasks`
      );

      // Avoid displaying results for a project that is no longer selected.
      if (get().selectedProject?.id === targetProjectId) {
        set({
          tasks: response.data.tasks.map(mapTask),
          isLoadingTasks: false,
        });
      } else {
        set({ isLoadingTasks: false });
      }
    } catch (error) {
      set({
        isLoadingTasks: false,
        error: `Could not load tasks: ${getErrorMessage(error)}`,
      });
    }
  },

  moveTask: async (taskId, newStatus) => {
    const projectId = get().selectedProject?.id;
    if (!projectId) {
      set({ error: 'Select a project before moving a task.' });
      return;
    }

    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) {
      set({ error: 'Task not found in the selected project.' });
      return;
    }

    if (task.status === newStatus) return;

    set({ error: null });

    try {
      const response = await apiClient.patch<ApiTask>(
        `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`,
        { status: newStatus }
      );
      const updated = mapTask(response.data);

      if (get().selectedProject?.id === projectId) {
        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === taskId ? updated : item
          ),
        }));
      }
    } catch (error) {
      set({ error: `Could not move task: ${getErrorMessage(error)}` });
    }
  },

  addTask: async (task) => {
    const projectId = get().selectedProject?.id;
    if (!projectId) {
      set({ error: 'Create or select a project before adding tasks.' });
      return;
    }

    set({ isSavingTask: true, error: null });

    try {
      const response = await apiClient.post<ApiTask>(
        `/projects/${encodeURIComponent(projectId)}/tasks`,
        {
          title: task.title.trim(),
          description: task.description,
          status: task.status,
          priority: task.priority,
          tags: task.tags,
          due_date: task.dueDate ?? null,
          assignee_uid: task.assigneeUid ?? null,
        }
      );

      const created = mapTask(response.data);

      if (get().selectedProject?.id === projectId) {
        set((state) => ({ tasks: [created, ...state.tasks] }));
      }
    } catch (error) {
      set({ error: `Could not create task: ${getErrorMessage(error)}` });
      throw error;
    } finally {
      set({ isSavingTask: false });
    }
  },

  connectRepo: (repoName) => {
    set({
      error: repoName.trim()
        ? 'Repository connection is not implemented yet. No server-side changes were made.'
        : 'Enter a valid repository name.',
    });
  },

  triggerRepoScan: async (repoId) => {
    set({
      isScanningRepo: false,
      scanProgress: 0,
      scanCurrentStep: '',
      error: repoId.trim()
        ? 'Repository scanning is not connected to the backend or ML service. No scan was performed.'
        : 'Select a repository before requesting a scan.',
    });
  },

  addProjectMember: (projectId, email, role) => {
    set({
      error:
        projectId.trim() && email.trim() && role.trim()
          ? 'Project-member management is not connected yet. No invitation was sent.'
          : 'Project, email, and role are required.',
    });
  },

  clearError: () => set({ error: null }),
}));
