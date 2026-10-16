import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  Bug,
  FolderKanban,
  Github,
  BarChart3,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
  Sun,
  Moon,
  ChevronRight,
  ExternalLink,
  Flame,
  Activity,
  Play,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [activeCodeTab, setActiveCodeTab] = useState<'vulnerable' | 'fixed'>('vulnerable');

  const vulnerableCode = `async def get_user_by_id(self, user_id: str, search_filter: str = ""):
    # ⚠️ CRITICAL: Raw string interpolation -> SQL Injection (CWE-89)
    query = f"SELECT * FROM users WHERE id = '{user_id}' AND status = '{search_filter}'"
    
    # ⚠️ HIGH: Connection opened without pooled context manager
    conn = await asyncpg.connect(self.dsn)
    active_pools.append(conn) # ⚠️ Memory leak: uncollected socket references
    
    row = await conn.fetchrow(query)
    return dict(row) if row else None`;

  const fixedCode = `async def get_user_by_id(self, user_id: str, search_filter: str = ""):
    # ✅ SECURE: Parameterized bindings prevent SQL injection attacks
    query = """
        SELECT id, username, email, status, created_at 
        FROM users 
        WHERE id = $1 AND ($2 = '' OR status = $2)
    """
    # ✅ CLEAN: Managed connection pool with automatic release
    async with self.pool.acquire() as conn:
        row = await conn.fetchrow(query, user_id, search_filter)
        return dict(row) if row else None`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                BugPulse AI
              </span>
              <span className="hidden sm:inline-block text-[10px] text-muted-foreground font-mono ml-2 px-1.5 py-0.2 bg-muted rounded">
                v2.4
              </span>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#editor-preview" className="hover:text-foreground transition-colors">
              Live Playground
            </a>
            <a href="#metrics" className="hover:text-foreground transition-colors">
              Accuracy & Stats
            </a>
            <Link to="/editor" className="text-primary hover:text-primary/80 transition-colors font-semibold">
              AI Editor
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25 shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DeepCode v4.2 Neural Engine Released — 94.8% Bug Detection F1</span>
            <ChevronRight className="w-3 h-3 opacity-70" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Predict Software Bugs <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Before They Break Production
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            An intelligent developer platform combining static code analysis and graph neural networks to
            detect error-prone patterns, benchmark algorithmic complexity, and boost engineering throughput.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/editor"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all hover:scale-105"
            >
              <Code2 className="w-4 h-4" /> Start AI Code Analysis Free
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border shadow-xs transition-all"
            >
              <Activity className="w-4 h-4 text-primary" /> View Live Dashboard
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Configuration Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full GitHub CI/CD Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Monaco In-Editor Highlighting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Python, TS, Go, Rust Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Code Playground & Scanner Preview */}
      <section id="editor-preview" className="py-12 bg-muted/20 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500">
              <Terminal className="w-3.5 h-3.5" /> Interactive Demonstration
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              See Autonomous Bug Prediction in Action
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Inspect how the AI analyzer detects SQL injection and connection pooling leaks, then synthesizes an optimal refactoring fix.
            </p>
          </div>

          {/* Interactive Shell Window */}
          <div className="bg-[#1e1e1e] text-white rounded-2xl border border-border/80 shadow-2xl overflow-hidden">
            {/* Window title bar */}
            <div className="bg-[#18181b] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono text-zinc-400 ml-3">user_repository.py</span>
              </div>

              {/* Code state switch */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => setActiveCodeTab('vulnerable')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeCodeTab === 'vulnerable'
                      ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚠️ Vulnerable Code (Risk 84/100)
                </button>
                <button
                  onClick={() => setActiveCodeTab('fixed')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeCodeTab === 'fixed'
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ✨ AI Refactored (Risk 12/100)
                </button>
              </div>
            </div>

            {/* Code Body & Side Analysis Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              {/* Code viewer */}
              <div className="lg:col-span-8 p-4 sm:p-6 overflow-x-auto">
                <pre className="font-mono text-xs sm:text-sm leading-relaxed text-zinc-200">
                  {activeCodeTab === 'vulnerable' ? vulnerableCode : fixedCode}
                </pre>
              </div>

              {/* Live Heuristics HUD */}
              <div className="lg:col-span-4 p-5 space-y-4 bg-zinc-950/60 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                      Heuristic Verdict
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        activeCodeTab === 'vulnerable'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {activeCodeTab === 'vulnerable' ? 'High Risk (84%)' : 'Optimal (12%)'}
                    </span>
                  </div>

                  {activeCodeTab === 'vulnerable' ? (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                        <strong>SQL Injection (CWE-89)</strong>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Unsanitized f-string formatting exposes query structure to tampering.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        <strong>Resource Leak (Memory)</strong>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Unclosed raw socket connections accumulate in module-level array.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        <strong>Parameterized Sanitization</strong>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Positional parameters ($1, $2) guarantee database injection immunity.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        <strong>Context Pooled Lifecycle</strong>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Connection automatically released on block termination. 0 byte leak.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10">
                  <Link
                    to="/editor"
                    className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    Open in Full Monaco Editor <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Pillars / Feature Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Cpu className="w-3.5 h-3.5" /> Comprehensive Capability Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Built for Modern High-Velocity Engineering Teams
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            From single-file script checks to multi-repository pull request continuous inspection, BugPulse AI covers every stage of the development lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 w-fit">
              <Bug className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Predictive Bug Scoring</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Proprietary AST call graph neural networks compute risk probability before runtime execution, catching null references, race conditions, and deadlocks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Monaco Editor Highlights</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Full VS Code Monaco editor experience in your browser with real-time gutter glyph markers, wavy underline alerts, and contextual fix suggestions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 w-fit">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Code Smells & Clones</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Detect duplicate fragments across repositories with similarity percentages, anti-pattern detections, and structural cyclomatic complexity warnings.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">1-Click AI Refactoring</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Side-by-side Before/After diff comparison that automatically synthesizes non-breaking, idiomatic fixes with performance gain estimates.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
              <Github className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Continuous GitHub Sync</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Automated pull request annotations, commit risk telemetry, and scheduled deep repository branch scans with live multi-stage progress bars.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500 w-fit">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Sprint Kanban & Triage</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Directly convert detected bugs into sprint tasks, track developer velocity scores, and assign refactor ownership across engineering leads.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / 3 Simple Steps */}
      <section id="how-it-works" className="py-16 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How BugPulse AI Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Automated intelligence from code commit to production release
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-3 relative shadow-xs">
              <span className="text-3xl font-extrabold font-mono text-primary/30">01</span>
              <h3 className="text-base font-bold text-foreground">Ingest & Parse AST</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Paste snippets directly into the Monaco editor or connect your GitHub repository with read permissions.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 space-y-3 relative shadow-xs">
              <span className="text-3xl font-extrabold font-mono text-primary/30">02</span>
              <h3 className="text-base font-bold text-foreground">DeepCode ML Inference</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Our model compares syntax trees against 50M+ verified bug signatures, computing cyclomatic volume and CWE flaws.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 space-y-3 relative shadow-xs">
              <span className="text-3xl font-extrabold font-mono text-primary/30">03</span>
              <h3 className="text-base font-bold text-foreground">Resolve & Refactor</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Review the AI explanation, examine Before/After diffs, and apply optimal fixes in 1-click or file a sprint task.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers / Stats Section */}
      <section id="metrics" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-indigo-950 via-indigo-900 to-violet-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-300">94.8%</p>
              <p className="text-xs sm:text-sm text-indigo-200">Prediction F1-Score</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-300">&lt; 350ms</p>
              <p className="text-xs sm:text-sm text-indigo-200">Average Inference Latency</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-300">58%</p>
              <p className="text-xs sm:text-sm text-indigo-200">Faster PR Turnaround</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-300">3.6%</p>
              <p className="text-xs sm:text-sm text-indigo-200">False Positive Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to start CTA Banner */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Ready to Elevate Your Code Quality?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Join thousands of developers using BugPulse AI to automate static code analysis and predict defects.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all hover:scale-105"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/editor"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
          >
            Launch Web Editor Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card/60 text-xs text-muted-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-foreground">BugPulse AI</span>
            <span>— Developer Productivity & Bug Prediction Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/editor" className="hover:text-foreground transition-colors">
              AI Editor
            </Link>
            <Link to="/issues" className="hover:text-foreground transition-colors">
              Bug Tracker
            </Link>
            <Link to="/github" className="hover:text-foreground transition-colors">
              GitHub Sync
            </Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="text-[11px]">
            &copy; {new Date().getFullYear()} BugPulse AI Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

