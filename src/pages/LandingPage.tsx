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
  Sun,
  Moon,
  ChevronRight,
  Activity,
  Flame,
  Search,
  Check,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'detection' | 'optimization'>('detection');

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
            <a href="#visual-showcase" className="hover:text-foreground transition-colors">
              AI Showcase
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#metrics" className="hover:text-foreground transition-colors">
              Benchmarks
            </a>
            <Link to="/editor" className="text-primary hover:text-primary/80 transition-colors font-semibold">
              Live IDE
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
                <span>Dashboard</span>
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

      {/* Hero Section with High-Impact Imagery */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DeepCode v4.2 Neural Engine Active • 94.8% Bug Detection F1</span>
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
            Autonomous static code intelligence and neural bug prediction. Detect runtime flaws, benchmark algorithmic efficiency, and accelerate pull request approvals.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/editor"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 transition-all hover:scale-105"
            >
              <Code2 className="w-4 h-4" /> Start Free Code Analysis
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border shadow-xs transition-all"
            >
              <Activity className="w-4 h-4 text-primary" /> View Live Dashboard
            </Link>
          </div>

          {/* Gorgeous Visual Platform Mockup Banner (Replacing Raw Code) */}
          <div className="pt-10 max-w-5xl mx-auto relative">
            <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-zinc-950 group">
              {/* High-res platform visual render */}
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80"
                alt="BugPulse AI Platform Analytics & Code Intelligence"
                className="w-full h-80 sm:h-96 md:h-[460px] object-cover object-top opacity-60 mix-blend-luminosity group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

              {/* Floating Glassmorphic Telemetry Cards Over the Visual */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-card/85 backdrop-blur-xl rounded-2xl border border-border shadow-xl text-left">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-500 border border-indigo-500/30">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">DeepCode Real-time Heuristics</h3>
                    <p className="text-xs text-muted-foreground">Intercepted 157 critical vulnerabilities this quarter</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold font-mono">
                    94.8% F1 Score
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold font-mono">
                    &lt; 350ms Latency
                  </div>
                  <Link
                    to="/dashboard"
                    className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual AI Studio Showcase (Replacing Raw Code Editor Block) */}
      <section id="visual-showcase" className="py-16 bg-muted/20 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500">
              <Zap className="w-3.5 h-3.5" /> Visual Intelligence Studio
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Autonomous Code Protection & Optimization
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Our graph neural models inspect AST call hierarchies to identify runtime vulnerabilities and synthesize instant refactorings.
            </p>
          </div>

          {/* Visual Showcase Switcher */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-card border border-border shadow-xs text-xs font-semibold">
              <button
                onClick={() => setActiveWorkflowTab('detection')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  activeWorkflowTab === 'detection'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bug className="w-4 h-4" /> 1. Predictive Risk Detection
              </button>
              <button
                onClick={() => setActiveWorkflowTab('optimization')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  activeWorkflowTab === 'optimization'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-4 h-4" /> 2. AI Generative Refactoring
              </button>
            </div>
          </div>

          {/* Visual Showcase Cards with Rich Imagery */}
          {activeWorkflowTab === 'detection' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-card rounded-3xl border border-rose-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="md:col-span-6 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-rose-500/15 text-rose-500 border border-rose-500/30">
                  Critical Vulnerability Interception
                </span>
                <h3 className="text-2xl font-bold text-foreground">
                  SQL Injection & Memory Starvation Intercepted
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  DeepCode analyzes database access pathways and identified unparameterized string templates formatted directly into SQL execution calls, combined with unclosed socket connections.
                </p>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-500 font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>CWE-89: Improper Neutralization of Special SQL Elements</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-500 font-semibold">
                    <Flame className="w-4 h-4 flex-shrink-0" />
                    <span>Resource Starvation: Unbounded connection retention in pool</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Confidence Score: 98% AI Heuristic Certainty</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/editor"
                    className="inline-flex items-center gap-2 text-xs font-bold text-rose-500 hover:underline"
                  >
                    Open live scenario in Monaco Editor &rarr;
                  </Link>
                </div>
              </div>

              {/* Rich Visual Graphic Image for Detection */}
              <div className="md:col-span-6 rounded-2xl overflow-hidden border border-border shadow-lg relative h-72 sm:h-80 bg-zinc-950">
                <img
                  src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80"
                  alt="Security Risk Radar"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                <div className="absolute top-4 right-4 bg-rose-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Risk Score: 84/100
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-white text-xs space-y-1">
                  <div className="flex justify-between font-mono font-semibold">
                    <span className="text-rose-400">Threat Level: Severe</span>
                    <span>user_repository.py</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    AST Control Flow Graph verified arbitrary execution vector.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-card rounded-3xl border border-emerald-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="md:col-span-6 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  Verified Autonomous Refactor
                </span>
                <h3 className="text-2xl font-bold text-foreground">
                  1-Click Parameterized & Context-Pooled Fix
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  The model automatically generated positional query placeholders ($1, $2) and wrapped database transactions within managed asynchronous connection contexts.
                </p>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>100% Immunity to dynamic SQL injection attacks</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>0 bytes leaked: Guaranteed socket release on scope exit</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-500 font-semibold">
                    <Zap className="w-4 h-4 flex-shrink-0" />
                    <span>Execution Speedup: 18x faster with connection pooling</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/editor"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-500 hover:underline"
                  >
                    Apply refactor in web workspace &rarr;
                  </Link>
                </div>
              </div>

              {/* Rich Visual Graphic Image for Optimization */}
              <div className="md:col-span-6 rounded-2xl overflow-hidden border border-border shadow-lg relative h-72 sm:h-80 bg-zinc-950">
                <img
                  src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1000&auto=format&fit=crop&q=80"
                  alt="AI Code Optimization"
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Risk Score: 12/100 (Clean)
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-white text-xs space-y-1">
                  <div className="flex justify-between font-mono font-semibold">
                    <span className="text-emerald-400">Production Ready</span>
                    <span>18x Faster</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Non-breaking drop-in replacement with verified unit coverage.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6 Core Pillars with Rich Visual Cards */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Cpu className="w-3.5 h-3.5" /> Engineered for Developers
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Six Intelligent Pillars of Code Quality
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            From single-file script checks to continuous multi-repo pull request inspections, BugPulse AI accelerates software reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Bug Scoring */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80"
                alt="Predictive Bug Scoring"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-card/80 backdrop-blur text-rose-500 border border-border">
                <Bug className="w-4 h-4" />
              </div>
            </div>
            <div className="p-6 space-y-2 flex-1">
              <h3 className="text-base font-bold text-foreground">Predictive Bug Scoring</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AST call graph neural networks compute risk probability before runtime execution, catching deadlocks, memory leaks, and injection hazards.
              </p>
            </div>
          </div>

          {/* Card 2: Monaco Editor */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80"
                alt="Monaco Web IDE"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-card/80 backdrop-blur text-indigo-500 border border-border">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
            <div className="p-6 space-y-2 flex-1">
              <h3 className="text-base font-bold text-foreground">Monaco Web IDE Experience</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full-featured VS Code Monaco editor in your browser with real-time gutter glyph markers, wavy underline alerts, and multi-language syntax highlighting.
              </p>
            </div>
          </div>

          {/* Card 3: Code Smells & Complexity */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80"
                alt="Complexity & Efficiency"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-card/80 backdrop-blur text-amber-500 border border-border">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="p-6 space-y-2 flex-1">
              <h3 className="text-base font-bold text-foreground">Complexity & Clone Radar</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatic Big-O Time & Space estimation, Halstead metric calculation, and cross-repo duplicate fragment identification.
              </p>
            </div>
          </div>

          {/* Card 4: Generative Refactoring */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                alt="AI Refactoring"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-card/80 backdrop-blur text-primary border border-border">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="p-6 space-y-2 flex-1">
              <h3 className="text-base font-bold text-foreground">1-Click AI Refactor Fixes</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Interactive Before vs After diff comparisons synthesizing safe, non-breaking patches with calculated performance speedup.
              </p>
            </div>
          </div>

          {/* Card 5: GitHub Sync */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&auto=format&fit=crop&q=80"
                alt="Continuous GitHub Sync"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-card/80 backdrop-blur text-emerald-500 border border-border">
                <Github className="w-4 h-4" />
              </div>
            </div>
            <div className="p-6 space-y-2 flex-1">
              <h3 className="text-base font-bold text-foreground">Continuous GitHub CI/CD</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Continuous pull request risk annotations, branch scanning with multi-stage progress bars, and commit risk telemetry.
              </p>
            </div>
          </div>

          {/* Card 6: Kanban & Productivity */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80"
                alt="Sprint Kanban & Team Velocity"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-card/80 backdrop-blur text-violet-500 border border-border">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="p-6 space-y-2 flex-1">
              <h3 className="text-base font-bold text-foreground">Sprint Kanban & Team Triage</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Directly transition detected security bugs into sprint tasks, track developer velocity scores, and assign remediation tickets.
              </p>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-3xl border border-border p-6 space-y-3 shadow-xs">
              <span className="text-3xl font-extrabold font-mono text-primary/40">01</span>
              <h3 className="text-base font-bold text-foreground">Ingest & Parse AST</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Paste snippets into the web IDE or connect your GitHub repository for continuous automated branch inspection.
              </p>
            </div>

            <div className="bg-card rounded-3xl border border-border p-6 space-y-3 shadow-xs">
              <span className="text-3xl font-extrabold font-mono text-primary/40">02</span>
              <h3 className="text-base font-bold text-foreground">DeepCode ML Inference</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Graph neural networks map call flows against 50M+ bug signatures, computing cyclomatic risk and CWE flaws.
              </p>
            </div>

            <div className="bg-card rounded-3xl border border-border p-6 space-y-3 shadow-xs">
              <span className="text-3xl font-extrabold font-mono text-primary/40">03</span>
              <h3 className="text-base font-bold text-foreground">Resolve & Refactor</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Review root-cause breakdowns, examine Before/After diffs, and apply optimal fixes in 1-click or file sprint tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers / Stats Section */}
      <section id="metrics" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-indigo-950 via-indigo-900 to-violet-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
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
          Join thousands of developers using BugPulse AI to automate static code analysis and predict defects before deployment.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 transition-all hover:scale-105"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/editor"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
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
