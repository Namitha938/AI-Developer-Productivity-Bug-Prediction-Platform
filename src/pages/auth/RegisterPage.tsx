import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Sparkles,
  Github,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Code2,
  ArrowLeft,
  Terminal,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, loginWithGitHub, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setFormError('Please accept the developer terms of service.');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGitHub = async () => {
    const success = await loginWithGitHub();
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* Left Column: Image & Platform Value Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Image with Dark Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-indigo-950/60" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-200 bg-clip-text text-transparent">
                BugPulse AI
              </span>
              <p className="text-[10px] text-zinc-400 font-mono leading-none">Developer Edition</p>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-md my-auto space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Free Community Plan Available</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Start catching critical defects before your users do.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Equip your engineering team with AST call-graph inspections, automated pull request risk audits, and 1-click refactoring diffs.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-zinc-300 bg-zinc-900/70 p-3 rounded-xl border border-white/10 backdrop-blur">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-semibold">Polyglot Code Support</strong>
                <span className="text-[11px] text-zinc-400">Python, TypeScript, Go, Rust, Java & C++</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-300 bg-zinc-900/70 p-3 rounded-xl border border-white/10 backdrop-blur">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-semibold">Integrated Monaco Web Editor</strong>
                <span className="text-[11px] text-zinc-400">Syntax highlighting with inline risk gutter glyphs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-zinc-400 flex items-center justify-between">
          <span>Zero credit card required</span>
          <span className="font-mono text-indigo-300">ISO-27001 & SOC-2 Compliant</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header Mobile Brand */}
          <div className="lg:hidden flex items-center justify-between mb-2">
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

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Create Developer Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start automating code quality inspections and predicting software bugs.
            </p>
          </div>

          {/* GitHub Sign-Up Button */}
          <button
            onClick={handleGitHub}
            type="button"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold rounded-xl text-sm transition-all shadow-xs"
          >
            <Github className="w-4 h-4" />
            Sign up with GitHub
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-xs uppercase text-muted-foreground font-semibold tracking-wider">
              Or with work email
            </span>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8+ chars"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Confirm</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground pt-1">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>I accept Developer Terms of Service & Privacy Policy</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Provisioning Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
