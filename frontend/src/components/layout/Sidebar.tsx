import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/editor', label: 'Code analysis', icon: Code2 },
    { to: '/github', label: 'Repositories', icon: FolderGit2 },
    { to: '/projects', label: 'Pull requests', icon: GitPullRequest },
    { to: '/projects/board', label: 'Projects & tasks', icon: CheckSquare },
    { to: '/analytics', label: 'Productivity', icon: TrendingUp },
    { to: '/issues', label: 'Bug history', icon: Bug, badge: '12' },
    { to: '/admin', label: 'Team', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: '6' },
    { to: '/analytics', label: 'Reports', icon: FileText },
    { to: '/admin', label: 'Admin', icon: ShieldAlert },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/security', label: 'Security', icon: Shield },
  ];

  const displayName = user?.name || 'Maya Chen';
  const displayRole = user?.title || 'Frontend developer';
  const displayEmail = user?.email || 'maya@acme.dev';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'MC';

  return (
    <aside
      className="relative flex flex-col w-60 shrink-0 bg-white dark:bg-[#0c1322] border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 select-none z-20 h-screen overflow-y-auto overflow-x-hidden font-sans transition-colors"
    >
      {/* 1. Brand Logo */}
      <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
            tracepoint
          </span>
        </NavLink>
      </div>

      {/* 2. Workspace Selector */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#141d30]/70 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-[#141d30] cursor-pointer transition-colors">
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">
              Acme Engineering
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
              Team workspace · Pro plan
            </p>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* 3. Navigation Links */}
      <div className="flex-1 py-3 px-2 space-y-0.5">
        <div className="px-3 pb-1 text-[10px] font-mono tracking-widest text-slate-400 font-semibold uppercase">
          WORKSPACE
        </div>

        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`${item.to}-${index}`}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                    item.label === 'Bug history'
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* 4. Trace Engine Info Widget */}
      <div className="p-3 mx-2 mb-2 rounded-xl bg-slate-50 dark:bg-[#141d30]/80 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
        <div className="flex items-center justify-between font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
          <span>TRACE ENGINE v2.4</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-[10px] font-medium leading-tight">
          Static + predictive analysis
        </p>
        <p className="text-slate-500 text-[9px] leading-tight">
          Illustrative workspace data
        </p>
      </div>

      {/* 5. User Footer Pill */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090f1c]">
        <NavLink
          to="/profile"
          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                {displayRole}
              </div>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0" />
        </NavLink>
      </div>
    </aside>
  );
};
