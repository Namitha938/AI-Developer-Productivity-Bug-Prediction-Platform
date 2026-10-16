import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Project } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  FolderKanban,
  GitBranch,
  ShieldCheck,
  Users,
  Plus,
  ExternalLink,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const { projects, setSelectedProject, addProjectMember } = useProjectStore();
  const navigate = useNavigate();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0].id);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Contributor');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    addProjectMember(selectedProjectId, inviteEmail, inviteRole);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-primary" /> Engineering Projects
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage repository health, engineering members, and sprint task boards
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/projects/board"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <FolderKanban className="w-4 h-4 text-primary" /> View Sprint Task Board
          </Link>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary/20 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary">
                    <GitBranch className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold font-mono text-foreground">{project.name}</h3>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                    project.healthScore >= 80
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : project.healthScore >= 60
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}
                >
                  {project.healthScore}% health
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{project.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xl border border-border/50 text-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Open Issues</span>
                  <span className="text-sm font-bold font-mono text-rose-500">
                    {project.openIssuesCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Resolved</span>
                  <span className="text-sm font-bold font-mono text-emerald-500">
                    {project.resolvedIssuesCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Test Cov.</span>
                  <span className="text-sm font-bold font-mono text-foreground">
                    {project.testCoveragePercent}%
                  </span>
                </div>
              </div>

              {/* Members */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5 flex items-center justify-between">
                  <span>Assigned Members ({project.members.length})</span>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setIsInviteModalOpen(true);
                    }}
                    className="text-primary hover:underline font-normal text-[10px]"
                  >
                    + Add
                  </button>
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {project.members.map((member) => (
                      <img
                        key={member.id}
                        src={member.avatarUrl}
                        alt={member.name}
                        title={`${member.name} (${member.role})`}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-background border border-border object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground ml-1">
                    {project.members.map((m) => m.name.split(' ')[0]).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground">
                Last scanned: {project.lastScannedAt}
              </span>
              <button
                onClick={() => {
                  setSelectedProject(project);
                  navigate('/projects/board');
                }}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Sprint Board &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Engineering Member"
        description="Grant access to project vulnerability analysis and pull request scans"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Developer Email</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="engineer@company.com"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Project Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="Contributor">Contributor</option>
              <option value="Maintainer">Maintainer / Lead</option>
              <option value="Viewer">Viewer / Auditor</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

