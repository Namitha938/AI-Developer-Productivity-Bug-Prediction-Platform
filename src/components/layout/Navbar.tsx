import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import {
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Activity,
  Github,
  Command,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/issues?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search code smells, issues, PRs, files... (Cmd+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-10 py-1.5 text-xs sm:text-sm bg-muted/60 border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-card border border-border rounded shadow-xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </form>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ML Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>DeepCode v4 Engine Active</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Profile */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
          >
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-xs font-semibold text-foreground leading-none">
                {user?.name || 'Developer'}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                {user?.role?.replace('_', ' ') || 'Engineer'}
              </span>
            </div>
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full border border-primary/30 object-cover"
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card text-card-foreground rounded-xl border border-border shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-bold">
                  {user?.role}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-foreground hover:bg-muted transition-colors"
                >
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/github');
                  }}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-foreground hover:bg-muted transition-colors"
                >
                  <Github className="w-4 h-4 text-muted-foreground" />
                  GitHub Sync
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-foreground hover:bg-muted transition-colors"
                  >
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    Admin Panel
                  </button>
                )}
              </div>

              <div className="border-t border-border pt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

