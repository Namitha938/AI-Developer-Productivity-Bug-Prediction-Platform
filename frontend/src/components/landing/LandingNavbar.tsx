import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { Sparkles, Sun, Moon, Menu, X, ArrowRight, Code2 } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa]/90 dark:bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo + Brand + Enterprise Badge */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded-xl p-1"
            aria-label="BugPulse AI Home"
          >
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              BugPulse AI
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            Enterprise v2.4
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => scrollToSection('scanner')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded px-1"
          >
            Live Scanner
          </button>
          <button
            onClick={() => scrollToSection('capabilities')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded px-1"
          >
            Capabilities
          </button>
          <button
            onClick={() => scrollToSection('architecture')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded px-1"
          >
            Architecture
          </button>
          <button
            onClick={() => scrollToSection('integrations')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded px-1"
          >
            Integrations
          </button>
          <button
            onClick={() => scrollToSection('benchmarks')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded px-1"
          >
            Benchmarks
          </button>
          <Link
            to="/editor"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Web IDE</span>
          </Link>
        </nav>

        {/* Right: Theme Toggle + Indigo Console Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
          >
            <span>{isAuthenticated ? 'Dashboard' : 'Sign in'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            aria-label="Open mobile navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-[#fafafa] dark:bg-[#0b0f19] px-5 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
              Enterprise v2.4 Navigation
            </span>
          </div>
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            <button
              onClick={() => scrollToSection('scanner')}
              className="text-left py-1.5 hover:text-indigo-600 transition-colors"
            >
              Live Scanner
            </button>
            <button
              onClick={() => scrollToSection('capabilities')}
              className="text-left py-1.5 hover:text-indigo-600 transition-colors"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="text-left py-1.5 hover:text-indigo-600 transition-colors"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection('integrations')}
              className="text-left py-1.5 hover:text-indigo-600 transition-colors"
            >
              Integrations
            </button>
            <button
              onClick={() => scrollToSection('benchmarks')}
              className="text-left py-1.5 hover:text-indigo-600 transition-colors"
            >
              Benchmarks
            </button>
            <Link
              to="/editor"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-1.5 font-semibold text-indigo-600 dark:text-indigo-400"
            >
              Web IDE (Code Sandbox)
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(isAuthenticated ? '/dashboard' : '/login');
              }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
