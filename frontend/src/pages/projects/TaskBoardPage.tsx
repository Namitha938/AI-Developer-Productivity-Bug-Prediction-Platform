
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  ArrowLeft,
  Plus,
  ClipboardList,
} from 'lucide-react';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { useProjectStore } from '../../stores/projectStore';

export const TaskBoardPage: React.FC = () => {
  const {
    selectedProject,
    projects,
    setSelectedProject,
  } = useProjectStore();

  if (!selectedProject || projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Projects
          </Link>
        </div>

        <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ClipboardList className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold text-foreground">
            No project selected
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            There are no projects available to display yet. Project loading
            and creation need to be connected to the backend before tasks can
            appear here.
          </p>

          <Link
            to="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Go to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Link
              to="/projects"
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Projects
            </Link>

            <span className="text-xs text-muted-foreground">/</span>

            <span className="text-xs font-mono font-bold text-primary">
              {selectedProject.name}
            </span>
          </div>

          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <FolderKanban className="h-6 w-6 text-primary" />
            Sprint Tasks &amp; Refactoring Board
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="project-switcher"
            className="text-xs font-medium text-muted-foreground"
          >
            Switch Project:
          </label>

          <select
            id="project-switcher"
            value={selectedProject.id}
            onChange={(event) => {
              const project = projects.find(
                (item) => item.id === event.target.value
              );

              if (project) {
                setSelectedProject(project);
              }
            }}
            className="cursor-pointer rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <KanbanBoard />
    </div>
  );
};
