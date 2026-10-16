import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  Bug,
  FolderKanban,
  Github,
  BarChart3,
  Bell,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  GitBranch,
} from 'lucide-react';
import { useIssueStore } from '../../stores/issueStore';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { issues } = useIssueStore();
  const { projects, selectedProject, setSelectedProject } = useProjectStore();
  const { user } = useAuthStore();

  const openCriticalCount = issues.filter(
    (i) => i.severity === 'critical' && i.status !== 'resolved'
  ).length;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/editor',
      label: 'AI Code Editor',
      icon: Code2,
      badge: 'Live',
      badgeColor: 'bg-primary/20 text-primary border border-primary/30',
    },
    {
      to: '/issues',
      label: 'Bug Tracker',
      icon: Bug,
      badge: openCriticalCount > 0 ? `${openCriticalCount} crit` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-500 border border-rose-500/30',
    },
    {
      to: '/projects',
      label: 'Projects & Tasks',
      icon: FolderKanban,
    },
    {
      to: '/github',
      label: 'GitHub Integration',
      icon: Github,
    },
    {
      to: '/analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
    },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      to: '/admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
      adminOnly: true,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card transition-all duration-300 z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                BugPulse AI
              </span>
              <p className="text-[10px] text-muted-foreground font-mono leading-none">v2.4 Developer Ed.</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Project Switcher */}
      {!collapsed && (
        <div className="p-3 border-b border-border bg-muted/20">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-primary" /> Active Project
          </label>
          <select
            value={selectedProject.id}
            onChange={(e) => {
              const proj = projects.find((p) => p.id === e.target.value);
              if (proj) setSelectedProject(proj);
            }}
            className="w-full text-xs font-medium bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground cursor-pointer truncate"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/30 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-2 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-border">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Bug Engine
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">99.8% Online</span>
            </div>
            <div className="mt-2 w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full w-[85%]" />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">DeepCode ML Heuristics Loaded</p>
          </div>
        )}
      </div>
    </aside>
  );
};

