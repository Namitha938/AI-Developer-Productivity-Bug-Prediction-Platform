import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Sparkles,
  Github,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Bug,
  CheckCircle2,
  Terminal,
  Code2,
  ArrowLeft,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('alex.rivera@codepulse.ai');
  const [password, setPassword] = useState('password123');
  const { login, loginWithGitHub, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGitHubLogin = async () => {
    const success = await loginWithGitHub();
    if (success) {
      navigate('/dashboard');
    }
  };

  const fillDemo = (role: 'developer' | 'lead' | 'admin') => {
    if (role === 'developer') setEmail('alex.rivera@codepulse.ai');
    if (role === 'lead') setEmail('elena.rostova@codepulse.ai');
    if (role === 'admin') setEmail('marcus.chen@codepulse.ai');
    setPassword('secret123');
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* Left Column: Image & AI Code Intelligence Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Image with Dark Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-indigo-950/60" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-200 bg-clip-text text-transparent">
                BugPulse AI
              </span>
              <p className="text-[10px] text-zinc-400 font-mono leading-none">Code Intelligence v2.4</p>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Center: Live Bug Prediction Card Showcase */}
        <div className="relative z-10 max-w-md my-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>DeepCode Neural Engine Active</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Real-time static analysis meets generative refactoring.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Predict bugs in your pull requests, benchmark algorithmic complexity, and fix memory leaks before deployment.
            </p>
          </div>

          {/* Floating Glassmorphism Bug Alert Widget */}
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/15 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Bug className="w-4 h-4" />
                </span>
                <span className="font-mono font-semibold text-zinc-200">user_repository.py:L14</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Critical (95/100)
              </span>
            </div>

            <div className="bg-black/60 rounded-xl p-3 font-mono text-[11px] text-zinc-300 border border-white/5 space-y-1">
              <p className="text-rose-400 font-semibold">// ⚠️ SQL Injection Vulnerability Detected</p>
              <p className="text-zinc-400">query = f"SELECT * FROM users WHERE id = '{'{user_id}'}'"</p>
              <p className="text-emerald-400 font-semibold pt-1">// ✨ Suggested AI Parameterized Binding:</p>
              <p className="text-zinc-300">query = "SELECT * FROM users WHERE id = $1"</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Injection Immune</span>
              </span>
              <span className="font-mono text-indigo-300">Latency: 340ms</span>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <div>
              <strong className="text-white block text-sm font-mono font-bold">94.8%</strong>
              <span>Prediction F1</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <strong className="text-white block text-sm font-mono font-bold">&lt; 350ms</strong>
              <span>Inference Time</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <strong className="text-white block text-sm font-mono font-bold">150k+</strong>
              <span>PRs Scanned</span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500">Trusted by modern dev teams</span>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header Mobile Brand */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-foreground">BugPulse AI</span>
            </Link>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              &larr; Home
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Access your personalized developer dashboard, risk alerts, and bug prediction models.
            </p>
          </div>

          {/* GitHub Sign-In Button */}
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold rounded-xl text-sm transition-all shadow-xs"
          >
            <Github className="w-4 h-4" />
            Continue with GitHub
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-xs uppercase text-muted-foreground font-semibold tracking-wider">
              Or with work email
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Platform <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-border">
            <p className="text-[11px] text-muted-foreground mb-2 text-center font-medium">
              Demo fast login presets:
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => fillDemo('developer')}
                type="button"
                className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/70 hover:bg-primary/10 hover:text-primary transition-colors border border-border font-medium"
              >
                Developer
              </button>
              <button
                onClick={() => fillDemo('lead')}
                type="button"
                className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/70 hover:bg-primary/10 hover:text-primary transition-colors border border-border font-medium"
              >
                Tech Lead
              </button>
              <button
                onClick={() => fillDemo('admin')}
                type="button"
                className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/70 hover:bg-primary/10 hover:text-primary transition-colors border border-border font-medium"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
