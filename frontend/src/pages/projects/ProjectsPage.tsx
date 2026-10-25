
import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import type { Project } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  FolderKanban,
  GitBranch,
  Plus,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    setSelectedProject,
    loadProjects,
    createProject,
    isLoadingProjects,
    error,
    clearError,
  } = useProjectStore();

  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId('');
      return;
    }

    setSelectedProjectId((currentId) =>
      projects.some((project) => project.id === currentId)
        ? currentId
        : projects[0].id
    );
  }, [projects]);

  const openProjectBoard = (project: Project) => {
    setSelectedProject(project);
    navigate('/projects/board');
  };

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError(null);

    if (!projectName.trim()) {
      setFormError('Project name is required.');
      return;
    }

    if (isCreating) return;

    setIsCreating(true);

    try {
      await createProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
        repoUrl: repoUrl.trim(),
        defaultBranch: defaultBranch.trim() || 'main',
      });

      setProjectName('');
      setProjectDescription('');
      setRepoUrl('');
      setDefaultBranch('main');
      setIsCreateModalOpen(false);

      // Refresh from the backend to verify persisted project data.
      await loadProjects();
    } catch {
      setFormError(
        useProjectStore.getState().error ??
          'Could not create the project. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-primary" />
            Engineering Projects
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage projects and their sprint task boards
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Backend errors */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="shrink-0 rounded px-2 py-1 hover:bg-rose-500/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoadingProjects && projects.length === 0 && (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground" role="status">
            Loading projects…
          </p>
        </div>
      )}

      {/* Project cards */}
      {!isLoadingProjects && projects.length === 0 && !error && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-base font-semibold text-foreground">
            No projects yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to start organizing tasks.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Create your first project
          </button>
        </div>
      )}

      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`animated-card card-shimmer animate-fade-in-up stagger-${Math.min(index + 1, 5)} bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4 hover:border-primary/60 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                      <GitBranch className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold font-mono text-foreground break-words">
                      {project.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.description || 'No description provided.'}
                </p>

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1.5 text-xs text-primary hover:underline break-all"
                  >
                    <GitBranch className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{project.repoUrl}</span>
                  </a>
                )}

                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-xl border border-border/50">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      Default branch
                    </span>
                    <span className="text-xs font-semibold font-mono text-foreground">
                      {project.defaultBranch || 'main'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      Members
                    </span>
                    <span className="text-xs font-semibold text-foreground inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {project.members.length}
                    </span>
                  </div>
                </div>

                {/* Only show health metrics when actual scan data exists. */}
                {(
                  project.healthScore !== undefined ||
                  project.openIssuesCount !== undefined ||
                  project.resolvedIssuesCount !== undefined ||
                  project.testCoveragePercent !== undefined
                ) && (
                  <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-xl border border-border/50 text-center">
                    {project.healthScore !== undefined && (
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          Health
                        </span>
                        <span className="text-sm font-bold font-mono text-foreground">
                          {project.healthScore}%
                        </span>
                      </div>
                    )}
                    {project.openIssuesCount !== undefined && (
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          Open issues
                        </span>
                        <span className="text-sm font-bold font-mono text-rose-500">
                          {project.openIssuesCount}
                        </span>
                      </div>
                    )}
                    {project.resolvedIssuesCount !== undefined && (
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          Resolved
                        </span>
                        <span className="text-sm font-bold font-mono text-emerald-500">
                          {project.resolvedIssuesCount}
                        </span>
                      </div>
                    )}
                    {project.testCoveragePercent !== undefined && (
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          Test coverage
                        </span>
                        <span className="text-sm font-bold font-mono text-foreground">
                          {project.testCoveragePercent}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <span className="text-[10px] text-muted-foreground">
                  {project.lastScannedAt
                    ? `Last scanned: ${project.lastScannedAt}`
                    : 'Not scanned yet'}
                </span>
                <button
                  type="button"
                  onClick={() => openProjectBoard(project)}
                  className="shrink-0 text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Sprint Board
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (!isCreating) {
            setIsCreateModalOpen(false);
            setFormError(null);
          }
        }}
        title="Create Engineering Project"
        description="Create a persistent project in your BugPulse AI workspace."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label
              htmlFor="project-name"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              required
              maxLength={120}
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="e.g. Payment Service"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Description
            </label>
            <textarea
              id="project-description"
              rows={3}
              maxLength={2000}
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
              placeholder="What does this project do?"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label
              htmlFor="project-repo"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Repository URL (optional)
            </label>
            <input
              id="project-repo"
              type="url"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label
              htmlFor="project-branch"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Default Branch
            </label>
            <input
              id="project-branch"
              type="text"
              value={defaultBranch}
              onChange={(event) => setDefaultBranch(event.target.value)}
              placeholder="main"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {formError && (
            <p role="alert" className="text-xs text-rose-500">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !projectName.trim()}
              className="px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
