import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { Activity, Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0c1322]/95 backdrop-blur-md border-b border-slate-800 text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none"
            aria-label="Tracepoint Home"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-white">
              tracepoint
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
            TRACE ENGINE v2.4
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300"
          aria-label="Main Navigation"
        >
          <Link
            to="/dashboard"
            className="hover:text-white transition-colors"
          >
            Overview
          </Link>
          <Link
            to="/editor"
            className="hover:text-white transition-colors"
          >
            Code analysis
          </Link>
          <Link
            to="/issues"
            className="hover:text-white transition-colors"
          >
            Bug history
          </Link>
          <Link
            to="/analytics"
            className="hover:text-white transition-colors"
          >
            Productivity
          </Link>
          <Link
            to="/admin"
            className="hover:text-white transition-colors"
          >
            Admin
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Go to workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Get started</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0c1322] px-4 py-3 space-y-2 text-xs">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-white"
          >
            Overview
          </Link>
          <Link
            to="/editor"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-white"
          >
            Code analysis
          </Link>
          <Link
            to="/issues"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-white"
          >
            Bug history
          </Link>
          <Link
            to="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-white"
          >
            Productivity
          </Link>
        </div>
      )}
    </header>
  );
};
