import React from 'react';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { useProjectStore } from '../../stores/projectStore';
import { FolderKanban, GitBranch, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TaskBoardPage: React.FC = () => {
  const { selectedProject, projects, setSelectedProject } = useProjectStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/projects"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Projects
            </Link>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-xs font-mono font-bold text-primary">
              {selectedProject.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-primary" /> Sprint Tasks & Refactoring Board
          </h1>
        </div>

        {/* Project Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Switch Project:</span>
          <select
            value={selectedProject.id}
            onChange={(e) => {
              const p = projects.find((proj) => proj.id === e.target.value);
              if (p) setSelectedProject(p);
            }}
            className="text-xs font-semibold bg-muted/60 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <KanbanBoard />
    </div>
  );
};

