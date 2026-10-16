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
  CheckCircle2,
  Zap,
  ArrowLeft,
  Activity,
  Cpu,
  TrendingUp,
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
      {/* Left Column: Beautiful AI & Developer Visual Showcase (No raw code blocks) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Vibrant High-Resolution 3D Neural Artwork Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-screen scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-indigo-950/70" />
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-indigo-500/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[450px] h-[450px] bg-violet-500/25 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Branding & Navigation */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-200 bg-clip-text text-transparent">
                BugPulse AI
              </span>
              <p className="text-[11px] text-zinc-400 font-medium">Developer Productivity & Prediction Platform</p>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Center: Beautiful Visual Hero Card Showcase */}
        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 backdrop-blur-md shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Next-Gen Machine Learning Code Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Elevate Engineering Quality With Predictive AI.
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Detect critical regressions, predict bug risks across pull requests, and optimize complex software systems with autonomous heuristics.
            </p>
          </div>

          {/* Graphical AI Shield & Telemetry Glass Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl relative overflow-hidden space-y-5">
            {/* Visual Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">DeepCode Neural Guard</h4>
                  <p className="text-[11px] text-zinc-400">Autonomous Scanning Engine</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Protection
              </span>
            </div>

            {/* Visual Metrics Showcase */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-2xl p-3 border border-white/10 text-center space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Accuracy</span>
                <span className="text-xl font-extrabold text-indigo-300 font-mono">94.8%</span>
                <span className="text-[10px] text-emerald-400 block font-medium">Model F1</span>
              </div>
              <div className="bg-black/30 rounded-2xl p-3 border border-white/10 text-center space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Latency</span>
                <span className="text-xl font-extrabold text-violet-300 font-mono">340ms</span>
                <span className="text-[10px] text-zinc-400 block">Avg Inference</span>
              </div>
              <div className="bg-black/30 rounded-2xl p-3 border border-white/10 text-center space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Velocity</span>
                <span className="text-xl font-extrabold text-emerald-300 font-mono">+58%</span>
                <span className="text-[10px] text-emerald-400 block font-medium">PR Speed</span>
              </div>
            </div>

            {/* Visual Quality Progress Indicator */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" /> Platform Security Index
                </span>
                <span className="text-indigo-300 font-mono font-bold">98.2 / 100</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full w-[98%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>150,000+ Repositories Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Zero-Day Escapes</span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500">ISO-27001 Certified</span>
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
