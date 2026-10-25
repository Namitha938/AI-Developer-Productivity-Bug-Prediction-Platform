
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  FolderGit2,
  GitPullRequest,
  CheckSquare,
  TrendingUp,
  Bug,
  Users,
  Bell,
  FileText,
  ShieldAlert,
  User,
  Shield,
  ChevronsUpDown,
  Settings,
  Activity,
  FolderKanbanIcon,
} from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const developerItems: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/editor', label: 'Code Analysis', icon: Code2 },
  { to: '/github', label: 'Repositories', icon: FolderGit2 },
  { to: '/projects', label: 'Projects', icon: FolderKanbanIcon },
  { to: '/projects/board', label: 'Projects & Tasks', icon: CheckSquare },
  { to: '/issues', label: 'Bug History', icon: Bug },
  { to: '/analytics', label: 'Productivity', icon: TrendingUp },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const techLeadItems: NavItem[] = [
  { to: '/reports', label: 'Team Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const adminItems: NavItem[] = [
  { to: '/admin', label: 'Admin Dashboard', icon: ShieldAlert },
  { to: '/admin/team', label: 'Team Management', icon: Users },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const role: UserRole = user?.role ?? 'developer';

  const navItems =
    role === 'admin'
      ? adminItems
      : role === 'tech_lead'
        ? techLeadItems
        : developerItems;

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';
  const displayRole =
    role === 'admin'
      ? 'Administrator'
      : role === 'tech_lead'
        ? 'Tech Lead'
        : 'Developer';

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <aside className="relative flex flex-col w-60 shrink-0 bg-white dark:bg-[#0c1322] border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 select-none z-20 h-screen overflow-y-auto overflow-x-hidden font-sans">
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-800/80">
        <NavLink
          to={role === 'admin' ? '/admin' : role === 'tech_lead' ? '/reports' : '/dashboard'}
          className="flex items-center gap-2.5"
        >
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-4 h-4" />
          </div>

          <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
            BugPulse AI
          </span>
        </NavLink>
      </div>

      {/* Signed-in user */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#141d30]/70 border border-slate-200 dark:border-slate-700/50">
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {displayName}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {displayEmail || displayRole}
            </p>
          </div>

          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Role-specific navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-slate-400 font-semibold uppercase">
          {role === 'admin'
            ? 'Administration'
            : role === 'tech_lead'
              ? 'Team Workspace'
              : 'Developer Workspace'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/dashboard' || item.to === '/projects'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 mr-2.5" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Workspace information */}
      <div className="p-3 mx-2 mb-2 rounded-xl bg-slate-50 dark:bg-[#141d30]/80 border border-slate-200 dark:border-slate-800 space-y-1">
        <div className="flex items-center gap-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
          <Shield className="w-3.5 h-3.5" />
          <span>{displayRole}</span>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
          {role === 'admin'
            ? 'Manage users and platform operations.'
            : role === 'tech_lead'
              ? 'Review team reports and productivity.'
              : 'Analyze code and track bug risk.'}
        </p>
      </div>

      {/* Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090f1c]">
        <NavLink
          to="/profile"
          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {displayRole}
              </div>
            </div>
          </div>

          <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </NavLink>
      </div>
    </aside>
  );
};
