import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Command,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumb path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return ['Workspace', 'Overview'];
    if (path.startsWith('/profile') || path.startsWith('/settings')) return ['Workspace', 'Profile settings'];
    if (path.startsWith('/security')) return ['Workspace', 'Account security'];
    if (path.startsWith('/editor')) return ['Workspace', 'Code analysis'];
    if (path.startsWith('/issues/')) return ['Workspace', 'Code analysis', 'Findings'];
    if (path.startsWith('/issues')) return ['Workspace', 'Bug history'];
    if (path.startsWith('/projects/board')) return ['Workspace', 'Projects & tasks'];
    if (path.startsWith('/projects')) return ['Workspace', 'Pull requests'];
    if (path.startsWith('/github')) return ['Workspace', 'Repositories'];
    if (path.startsWith('/analytics')) return ['Workspace', 'Productivity analytics'];
    if (path.startsWith('/notifications')) return ['Workspace', 'Notifications'];
    if (path.startsWith('/admin')) return ['Workspace', 'Admin dashboard'];
    return ['Workspace', 'Overview'];
  };

  const breadcrumbs = getBreadcrumb();

  const displayName = user?.name || 'Maya Chen';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'MC';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/issues?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] sticky top-0 z-30 flex items-center justify-between px-6 transition-colors">
      {/* 1. Left Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-400 dark:text-slate-600">/</span>}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'font-medium text-slate-900 dark:text-slate-200'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* 2. Middle Search Bar */}
      <div className="flex-1 max-w-sm mx-8">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything... ⌘ K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg placeholder:text-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </form>
      </div>

      {/* 3. Right Status & Actions */}
      <div className="flex items-center gap-3">
        {/* DEMO WORKSPACE Tag Pill */}
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
          DEMO WORKSPACE
        </span>

        {/* Notifications Icon with count */}
        <Link
          to="/notifications"
          className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
            4
          </span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Initials Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer transition-colors"
            title={displayName}
          >
            {initials}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {user?.email || 'maya@acme.dev'}
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile Settings</span>
              </Link>

              <Link
                to="/security"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Account Security</span>
              </Link>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
