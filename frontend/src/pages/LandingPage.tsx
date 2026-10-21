import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import '../styles/landing.css';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Code2,
  Sun,
  Moon,
  Menu,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Cpu,
  Binary,
  Network,
  FileCheck2,
  GitPullRequest,
  LineChart,
  Terminal,
  ShieldCheck,
  Github,
  GitBranch,
  MessageSquare,
  Workflow,
  Clock,
  Layers,
  Database,
  Lock,
  Bug,
  ExternalLink,
  Users,
} from 'lucide-react';

/* ==========================================================================
   Small Reusable IntersectionObserver Hook (useReveal)
   ========================================================================== */
function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isRevealed };
}

/* ==========================================================================
   Smooth Count-Up Hook (~1.2s ease-out)
   ========================================================================== */
function useCountUp(
  target: number,
  decimals = 0,
  isTriggered = true,
  duration = 1200
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isTriggered) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * target;

      setValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, isTriggered, duration]);

  return value.toFixed(decimals);
}

// Preset code samples for Sandbox Scanner
const PRESET_SNIPPETS = {
  python_sql: {
    id: 'python_sql',
    name: 'Python SQL Injection',
    cwe: 'CWE-89',
    lang: 'python',
    code: `def get_user_records(db_conn, user_id, raw_filter):
    # Dynamic string formatting allows arbitrary SQL injection (CWE-89)
    query = f"SELECT * FROM users WHERE id = '{user_id}' AND status = '{raw_filter}'"
    
    # Resource leak: file handle without context manager
    audit_file = open("/var/log/audit.log", "a")
    audit_file.write(f"Lookup for {user_id}\\n")
    
    return db_conn.execute(query)`,
    risk: 88,
    cyclomatic: 3,
    cognitive: 5,
    flaws: 2,
    issues: [
      {
        title: 'SQL Injection via Unsanitized F-String',
        cwe: 'CWE-89',
        severity: 'Critical',
        description: 'Unescaped user input formatted directly into raw SQL command string.',
        fix: 'Use parameterized query parameters: db_conn.execute(query, (user_id, raw_filter))',
      },
      {
        title: 'Unclosed File Descriptor Resource Leak',
        cwe: 'CWE-775',
        severity: 'Medium',
        description: 'File open() invoked without a context manager or explicit close() handle.',
        fix: 'Wrap inside context manager: with open(...) as audit_file:',
      },
    ],
  },
  ts_dom_eval: {
    id: 'ts_dom_eval',
    name: 'TypeScript DOM & eval',
    cwe: 'CWE-79 / CWE-95',
    lang: 'typescript',
    code: `export function renderUserProfile(container: HTMLElement, data: any) {
  // Direct innerHTML assignment allows Cross-Site Scripting (CWE-79)
  container.innerHTML = \`<div class="profile">\${data.bio}</div>\`;

  // Arbitrary execution of untrusted dynamic expression (CWE-95)
  if (data.transformHook) {
    const fn = eval(data.transformHook);
    fn(container);
  }
}`,
    risk: 94,
    cyclomatic: 4,
    cognitive: 6,
    flaws: 2,
    issues: [
      {
        title: 'DOM XSS via innerHTML Sink',
        cwe: 'CWE-79',
        severity: 'Critical',
        description: 'Unsanitized user bio directly injected into the DOM tree.',
        fix: 'Use textContent or DOMPurify.sanitize(data.bio)',
      },
      {
        title: 'Arbitrary Code Execution via eval()',
        cwe: 'CWE-95',
        severity: 'Critical',
        description: 'eval executes untrusted dynamic scripts in client application scope.',
        fix: 'Replace eval with a safe parser or predetermined action registry.',
      },
    ],
  },
  java_stream: {
    id: 'java_stream',
    name: 'Java Unclosed Stream',
    cwe: 'CWE-404',
    lang: 'java',
    code: `public byte[] readPayload(File targetFile) throws IOException {
    // Unclosed FileInputStream will cause file descriptor starvation (CWE-404)
    FileInputStream fis = new FileInputStream(targetFile);
    byte[] buffer = new byte[(int) targetFile.length()];
    fis.read(buffer);
    
    // Exception thrown here leaves file stream permanently open
    processSignature(buffer);
    return buffer;
}`,
    risk: 76,
    cyclomatic: 2,
    cognitive: 3,
    flaws: 1,
    issues: [
      {
        title: 'Improper Resource Shutdown (Resource Leak)',
        cwe: 'CWE-404',
        severity: 'High',
        description: 'Stream is not enclosed in a try-with-resources statement, leading to leaked handles.',
        fix: 'Enclose stream in: try (FileInputStream fis = new FileInputStream(targetFile)) { ... }',
      },
    ],
  },
  python_safe: {
    id: 'python_safe',
    name: 'Python Safe AST',
    cwe: 'Clean AST',
    lang: 'python',
    code: `def get_user_records_safe(db_conn, user_id: str, status_filter: str):
    """Safely retrieves sanitized records using parameterized bindings."""
    query = "SELECT id, name, status FROM users WHERE id = %s AND status = %s"
    
    with open("/var/log/audit.log", "a") as log_file:
        log_file.write(f"Authorized lookup for user {user_id}\\n")
        
    return db_conn.execute(query, (user_id, status_filter))`,
    risk: 12,
    cyclomatic: 1,
    cognitive: 1,
    flaws: 0,
    issues: [],
  },
};

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<keyof typeof PRESET_SNIPPETS>('python_sql');
  const [codeContent, setCodeContent] = useState(PRESET_SNIPPETS.python_sql.code);
  const [isScanning, setIsScanning] = useState(false);
  const [animatedRisk, setAnimatedRisk] = useState(PRESET_SNIPPETS.python_sql.risk);

  const snippet = PRESET_SNIPPETS[selectedSnippet];

  // Smoothly animate risk score when snippet or scan changes
  useEffect(() => {
    let startTimestamp: number | null = null;
    const startRisk = animatedRisk;
    const targetRisk = snippet.risk;
    const duration = 400;
    let animId: number;

    const step = (ts: number) => {
      if (!startTimestamp) startTimestamp = ts;
      const progress = Math.min((ts - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 2);
      setAnimatedRisk(Math.round(startRisk + (targetRisk - startRisk) * ease));
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [snippet.risk]);

  const handleSelectSnippet = (key: keyof typeof PRESET_SNIPPETS) => {
    setSelectedSnippet(key);
    setCodeContent(PRESET_SNIPPETS[key].code);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 450);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Section Reveal hooks
  const aboutSection = useReveal();
  const scannerSection = useReveal();
  const featuresSection = useReveal();
  const pipelineSection = useReveal();
  const integrationsSection = useReveal();
  const benchmarksSection = useReveal();
  const ctaSection = useReveal();

  // Benchmarks Animated Stats
  const benchF1 = useCountUp(91.4, 1, benchmarksSection.isRevealed);
  const benchNodes = useCountUp(10, 0, benchmarksSection.isRevealed);
  const benchLatency = useCountUp(38, 0, benchmarksSection.isRevealed);

  // Benchmarks Table Animated Values
  const d4jAcc = useCountUp(91.4, 1, benchmarksSection.isRevealed);
  const d4jPrec = useCountUp(89.2, 1, benchmarksSection.isRevealed);
  const d4jRec = useCountUp(88.6, 1, benchmarksSection.isRevealed);
  const d4jF1 = useCountUp(88.9, 1, benchmarksSection.isRevealed);
  const d4jLat = useCountUp(36, 0, benchmarksSection.isRevealed);

  const csnAcc = useCountUp(89.8, 1, benchmarksSection.isRevealed);
  const csnPrec = useCountUp(87.6, 1, benchmarksSection.isRevealed);
  const csnRec = useCountUp(86.4, 1, benchmarksSection.isRevealed);
  const csnF1 = useCountUp(87.0, 1, benchmarksSection.isRevealed);
  const csnLat = useCountUp(41, 0, benchmarksSection.isRevealed);

  const bcbAcc = useCountUp(93.7, 1, benchmarksSection.isRevealed);
  const bcbPrec = useCountUp(92.1, 1, benchmarksSection.isRevealed);
  const bcbRec = useCountUp(91.0, 1, benchmarksSection.isRevealed);
  const bcbF1 = useCountUp(91.5, 1, benchmarksSection.isRevealed);
  const bcbLat = useCountUp(44, 0, benchmarksSection.isRevealed);

  return (
    <div className="tp-landing min-h-screen bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* 1. Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="tp-container h-16 flex items-center justify-between">
          {/* Logo & Version Badge */}
          <div className="flex items-center gap-3">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('home');
              }}
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-slate-900 dark:text-white">
                tracepoint
              </span>
            </a>

            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              TRACE ENGINE v2.4
            </span>
          </div>

          {/* Navigation Links with animated growing underline */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollTo('home')}
              className="tp-nav-link hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="tp-nav-link hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => scrollTo('scanner')}
              className="tp-nav-link hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Scanner
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="tp-nav-link hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('pipeline')}
              className="tp-nav-link hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Pipeline
            </button>
            <button
              onClick={() => scrollTo('integrations')}
              className="tp-nav-link hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Integrations
            </button>
            <button
              onClick={() => scrollTo('benchmarks')}
              className="tp-nav-link hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Benchmarks
            </button>
          </nav>

          {/* Right Actions: Theme Toggle, Sign In, Get Started */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="tp-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 tp-arrow-icon" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="tp-btn-primary inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-3 h-3 tp-arrow-icon" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1d] px-6 py-4 space-y-2 text-xs">
            <button onClick={() => scrollTo('home')} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white w-full text-left">Home</button>
            <button onClick={() => scrollTo('about')} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white w-full text-left">About</button>
            <button onClick={() => scrollTo('scanner')} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white w-full text-left">Scanner</button>
            <button onClick={() => scrollTo('features')} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white w-full text-left">Features</button>
            <button onClick={() => scrollTo('pipeline')} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white w-full text-left">Pipeline</button>
            <button onClick={() => scrollTo('integrations')} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white w-full text-left">Integrations</button>
            <button onClick={() => scrollTo('benchmarks')} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white w-full text-left">Benchmarks</button>
          </div>
        )}
      </header>

      {/* 2. SECTION: Home (Hero, id="home") */}
      <section id="home" className="relative pt-16 pb-20 overflow-hidden scroll-mt-20">
        <div className="tp-glow top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-600/10" />

        <div className="tp-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column (7 cols): Copy & Actions with 80ms sequential stagger */}
            <div className="lg:col-span-7 space-y-6">
              {/* Stagger 0: Tag */}
              <div className="tp-hero-stagger-0 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 tp-dot-pulse" />
                <span className="font-mono text-[11px] tracking-wider uppercase">
                  DEVELOPER INTELLIGENCE, CONNECTED.
                </span>
              </div>

              {/* Stagger 1: Headline */}
              <h1 className="tp-hero-stagger-1 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Your next bug.
                <br />
                Caught before
                <br />
                production.
              </h1>

              {/* Stagger 2: Subtext */}
              <p className="tp-hero-stagger-2 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Turn code signals into clear next steps. Build with confidence, one pull request at a time.
              </p>

              {/* Stagger 3: Buttons */}
              <div className="tp-hero-stagger-3 pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="tp-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <span>Explore live demo</span>
                  <ArrowRight className="w-4 h-4 tp-arrow-icon" />
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-xs transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                >
                  <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Open code analysis</span>
                </button>
              </div>

              {/* Stagger 4: Three Check Items */}
              <div className="tp-hero-stagger-4 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Deterministic AST Analysis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Zero Code Retention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>94% Model Accuracy</span>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Stagger 5 + Gentle Floating Trace Card */}
            <div className="lg:col-span-5 tp-hero-stagger-5">
              <div
                tabIndex={0}
                className="tp-card tp-float-card bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase">
                    TRACE / TP-284
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 transition-colors">
                    High risk
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    One missing key. Two charges.
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    AI detected a non-idempotent payment capture before it reached production.
                  </p>
                </div>

                {/* Sequence Flow Diagram */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px]">
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Capture succeeds
                  </div>
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Response times out
                  </div>
                  <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-semibold">
                    Retry charges again
                  </div>
                </div>

                {/* Suggested Fix Box */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px]">suggested fix · payment.ts</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    + idempotencyKey: `payment:${'{'}order.id{'}'}`
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <span className="text-[11px]">94% model confidence</span>
                  <Link
                    to="/issues/TP-284"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium flex items-center gap-1 group"
                  >
                    <span>Explore the signal</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: About (id="about") */}
      <section
        id="about"
        ref={aboutSection.ref}
        className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-[#080d1a] scroll-mt-20 transition-colors"
      >
        <div className="tp-container space-y-12">
          {/* Section Heading with Scroll Reveal */}
          <div
            className={`text-center max-w-2xl mx-auto space-y-3 tp-reveal ${
              aboutSection.isRevealed ? 'is-revealed' : ''
            }`}
          >
            <span className="text-[11px] font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
              ABOUT TRACEPOINT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Autonomous Intelligence For Reliable Software
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tracepoint bridges compiler-level AST analysis with graph neural networks, empowering modern engineering teams to ship ambitious software without regression fear.
            </p>
          </div>

          {/* Cards with 70ms stagger per card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              tabIndex={0}
              style={{ transitionDelay: '0ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                aboutSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                <Bug className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Catch bugs early</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detect non-idempotent mutations, race conditions, memory leaks, and injection flaws at commit time before code hits staging.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '70ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                aboutSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Private by design</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero code retention policy. Code tokens are analyzed ephemerally in-memory with enterprise-grade encryption in transit and at rest.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '140ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                aboutSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Built for whole teams</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Designed for engineers, tech leads, and DevOps pipelines with GitHub PR bots, automated remediation diffs, and SARIF exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: Live Sandbox Scanner (id="scanner") */}
      <section
        id="scanner"
        ref={scannerSection.ref}
        className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0a0f1d] scroll-mt-20 transition-colors"
      >
        <div className="tp-container space-y-8">
          <div
            className={`flex flex-col md:flex-row md:items-end justify-between gap-4 tp-reveal ${
              scannerSection.isRevealed ? 'is-revealed' : ''
            }`}
          >
            <div>
              <span className="text-[11px] font-mono tracking-widest text-blue-600 dark:text-blue-400 font-semibold uppercase">
                INTERACTIVE CODE LAB
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                Live Sandbox Scanner
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Select a vulnerability preset or edit the code directly to see real-time AST tokenization, risk scoring, and cognitive complexity analysis.
              </p>
            </div>

            {/* Run Button with gentle press feedback */}
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="tp-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer shrink-0"
            >
              {isScanning ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isScanning ? 'Analyzing AST...' : 'Analyze Snippet'}</span>
            </button>
          </div>

          {/* 4 Sample Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(PRESET_SNIPPETS) as (keyof typeof PRESET_SNIPPETS)[]).map((key) => {
              const item = PRESET_SNIPPETS[key];
              const isSelected = selectedSnippet === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectSnippet(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="ml-1.5 text-[10px] opacity-75 font-mono">({item.cwe})</span>
                </button>
              );
            })}
          </div>

          {/* Code Box & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Code Box (7 cols) */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1322] shadow-sm p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span>sandbox.{snippet.lang} · Editable</span>
                <span className="uppercase">{snippet.lang}</span>
              </div>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                rows={12}
                className="w-full bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none p-1"
                spellCheck={false}
              />
            </div>

            {/* Results Panel (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1020] shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                    ANALYSIS OUTCOME
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">AST & Neural verdict</span>
                </div>
                {/* Animated Risk Score with smooth transition */}
                <div className="text-right">
                  <span
                    className={`text-2xl font-bold font-mono transition-colors duration-300 ${
                      animatedRisk > 70
                        ? 'text-rose-600 dark:text-rose-500'
                        : animatedRisk > 30
                        ? 'text-amber-500'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {animatedRisk}/100
                  </span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">Risk Score</span>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Cyclomatic</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{snippet.cyclomatic}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Cognitive</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{snippet.cognitive}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Flaws</span>
                  <span
                    className={`font-bold mt-0.5 block transition-colors duration-300 ${
                      snippet.flaws > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {snippet.flaws}
                  </span>
                </div>
              </div>

              {/* Detected Exposures with Fixes: Animated Fade & Slide in on change */}
              <div key={selectedSnippet} className="space-y-2.5 pt-1">
                {snippet.issues.length === 0 ? (
                  <div className="tp-flaw-item p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>No vulnerabilities or code smells detected in this snippet.</span>
                  </div>
                ) : (
                  snippet.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      style={{ animationDelay: `${idx * 80}ms` }}
                      className="tp-flaw-item p-3 rounded-lg bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{issue.title}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 transition-colors">
                          {issue.cwe}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{issue.description}</p>
                      <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                        fix: {issue.fix}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: Features (id="features") */}
      <section
        id="features"
        ref={featuresSection.ref}
        className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-[#080d1a] scroll-mt-20 transition-colors"
      >
        <div className="tp-container space-y-12">
          {/* Section Heading with Scroll Reveal */}
          <div
            className={`text-center max-w-2xl mx-auto space-y-2 tp-reveal ${
              featuresSection.isRevealed ? 'is-revealed' : ''
            }`}
          >
            <span className="text-[11px] font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
              PLATFORM CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Engineered for Modern Engineering Organizations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Full-lifecycle code intelligence from local editor inspection to continuous integration and executive quality dashboards.
            </p>
          </div>

          {/* 6 Feature Cards with 70ms stagger */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              tabIndex={0}
              style={{ transitionDelay: '0ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                featuresSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                <Binary className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Deterministic AST & Control Flow</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Parses source code into deep syntax trees to calculate execution branches, cyclomatic paths, and unsafe variable bounds.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '70ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                featuresSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Graph Neural Network Prediction</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Trained on Defect4J and millions of real commits to predict bug probability in milliseconds before unit tests execute.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '140ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                featuresSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cognitive & Cyclomatic Auditing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pins down algorithmic bottlenecks, high-maintenance methods, and runaway complexity scores across thousands of files.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '210ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                featuresSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Automated SARIF 2.1.0 Reports</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Seamlessly exports standardized OASIS SARIF outputs to plug into GitHub Advanced Security and enterprise CI/CD gates.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '280ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                featuresSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">GitHub & CI/CD Automated PR Bot</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Leaves inline diff suggestions, flags high-risk files, and prevents bug regressions directly inside pull request reviews.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '350ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-6 space-y-3 tp-reveal ${
                featuresSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-600/15 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Productivity & Risk Velocity Analytics</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Empowers engineering leaders with cycle times, defect escape rates, and maintainability trends across all services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: Pipeline (id="pipeline") */}
      <section
        id="pipeline"
        ref={pipelineSection.ref}
        className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0a0f1d] scroll-mt-20 transition-colors"
      >
        <div className="tp-container space-y-12">
          {/* Section Heading with Scroll Reveal */}
          <div
            className={`text-center max-w-2xl mx-auto space-y-2 tp-reveal ${
              pipelineSection.isRevealed ? 'is-revealed' : ''
            }`}
          >
            <span className="text-[11px] font-mono tracking-widest text-blue-600 dark:text-blue-400 font-semibold uppercase">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Multi-Layered Code Intelligence Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              How Tracepoint transforms raw Git commits into verified remediation diffs in under{' '}
              <span className={`inline-block font-mono font-semibold text-emerald-600 dark:text-emerald-400 ${pipelineSection.isRevealed ? 'tp-pulse-once' : ''}`}>
                &lt; 38ms
              </span>
              .
            </p>
          </div>

          {/* 5 Steps Grid revealing in order with 70ms stagger */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div
              tabIndex={0}
              style={{ transitionDelay: '0ms' }}
              className={`tp-card bg-slate-50 dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-4 space-y-2 text-left tp-reveal ${
                pipelineSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">01</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Source Ingestion</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Streamed over TLS into ephemeral memory. Zero code stored on disk.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '70ms' }}
              className={`tp-card bg-slate-50 dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-4 space-y-2 text-left tp-reveal ${
                pipelineSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">02</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">AST Tokenization</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Tree-sitter grammars generate abstract syntax trees and call graphs.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '140ms' }}
              className={`tp-card bg-slate-50 dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-4 space-y-2 text-left tp-reveal ${
                pipelineSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">03</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">GNN Inference</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Structural semantic embedding predicts fault probability in{' '}
                <span className={`font-mono font-semibold text-emerald-600 dark:text-emerald-400 ${pipelineSection.isRevealed ? 'tp-pulse-once' : ''}`}>
                  &lt; 38ms
                </span>
                .
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '210ms' }}
              className={`tp-card bg-slate-50 dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-4 space-y-2 text-left tp-reveal ${
                pipelineSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">04</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">CWE Heuristics</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Cross-references OWASP Top 10 and CWE taxonomies for deterministic accuracy.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '280ms' }}
              className={`tp-card bg-slate-50 dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-4 space-y-2 text-left tp-reveal ${
                pipelineSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">05</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">SARIF 2.1.0 Output</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Synthesizes instant refactoring diffs, risk score badges, and PR comments.
              </p>
            </div>
          </div>

          {/* SARIF / CycloneDX Banner */}
          <div
            className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-xs tp-reveal ${
              pipelineSection.isRevealed ? 'is-revealed' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Enterprise Standards Compliance</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Fully compliant with OASIS SARIF 2.1.0 and CycloneDX 1.5 software bill of materials specifications.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
              SARIF · CycloneDX · SPDX
            </span>
          </div>
        </div>
      </section>

      {/* 7. SECTION: Integrations (id="integrations") */}
      <section
        id="integrations"
        ref={integrationsSection.ref}
        className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-[#080d1a] scroll-mt-20 transition-colors"
      >
        <div className="tp-container space-y-12">
          {/* Section Heading with Scroll Reveal */}
          <div
            className={`text-center max-w-2xl mx-auto space-y-2 tp-reveal ${
              integrationsSection.isRevealed ? 'is-revealed' : ''
            }`}
          >
            <span className="text-[11px] font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
              ECOSYSTEM CONNECTIVITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Seamlessly Fits Your Existing Toolchain
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Connects with your code hosts, CI/CD runners, chat channels, and project trackers without workflow disruptions.
            </p>
          </div>

          {/* 6 Integration Cards with 70ms stagger */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              tabIndex={0}
              style={{ transitionDelay: '0ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 space-y-2.5 tp-reveal ${
                integrationsSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Github className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  Native Integration
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">GitHub</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated PR bot reviews, status check blocks, and security advisory syncing via GitHub Actions.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '70ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 space-y-2.5 tp-reveal ${
                integrationsSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  Active Support
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">VS Code Extension</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time inline diagnostics, complexity heatmaps, and instant fix suggestions right inside editor tabs.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '140ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 space-y-2.5 tp-reveal ${
                integrationsSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center">
                  <GitBranch className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  Native Integration
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">GitLab CI/CD</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generates gl-code-quality reports and enforces merge request gates on high-risk files.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '210ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 space-y-2.5 tp-reveal ${
                integrationsSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  Active Support
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">JetBrains IDEs</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                IntelliJ, PyCharm, and WebStorm plugin for cognitive complexity inspection and code smell detection.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '280ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 space-y-2.5 tp-reveal ${
                integrationsSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  Active Support
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Slack & Teams</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dispatches instant webhook alerts when high-risk commits or zero-days are pushed to main branches.
              </p>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '350ms' }}
              className={`tp-card bg-white dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 space-y-2.5 tp-reveal ${
                integrationsSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                  <Workflow className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  Native Integration
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Jira Software</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically creates prioritized bug tickets with reproduction steps, stack traces, and line references.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION: Benchmarks (id="benchmarks") */}
      <section
        id="benchmarks"
        ref={benchmarksSection.ref}
        className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0a0f1d] scroll-mt-20 transition-colors"
      >
        <div className="tp-container space-y-12">
          {/* Section Heading with Scroll Reveal */}
          <div
            className={`text-center max-w-2xl mx-auto space-y-2 tp-reveal ${
              benchmarksSection.isRevealed ? 'is-revealed' : ''
            }`}
          >
            <span className="text-[11px] font-mono tracking-widest text-blue-600 dark:text-blue-400 font-semibold uppercase">
              EMPIRICAL VALIDATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Rigorous Scientific Model Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tested against industry-standard defect benchmarks with 10-fold cross-validation.
            </p>
          </div>

          {/* 3 Callout Cards with Count-Up animation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div
              tabIndex={0}
              style={{ transitionDelay: '0ms' }}
              className={`tp-card bg-slate-50/80 dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 flex items-center gap-4 tp-reveal ${
                benchmarksSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  &lt; {benchLatency}ms
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Mean Inference Latency</span>
              </div>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '70ms' }}
              className={`tp-card bg-slate-50/80 dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 flex items-center gap-4 tp-reveal ${
                benchmarksSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-600/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {benchF1}%
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Defect4J F1-Score</span>
              </div>
            </div>

            <div
              tabIndex={0}
              style={{ transitionDelay: '140ms' }}
              className={`tp-card bg-slate-50/80 dark:bg-[#10172a] border border-slate-200 dark:border-slate-800/80 p-5 flex items-center gap-4 tp-reveal ${
                benchmarksSection.isRevealed ? 'is-revealed' : ''
              }`}
            >
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-600/15 text-purple-600 dark:text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {benchNodes}M+
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Trained AST Nodes</span>
              </div>
            </div>
          </div>

          {/* Benchmarks Table: Rows slide in one after another */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1222] p-5 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-2.5 font-medium">BENCHMARK DATASET</th>
                  <th className="py-2.5 font-medium">LANGUAGE</th>
                  <th className="py-2.5 font-medium">ACCURACY</th>
                  <th className="py-2.5 font-medium">PRECISION</th>
                  <th className="py-2.5 font-medium">RECALL</th>
                  <th className="py-2.5 font-medium">F1 SCORE</th>
                  <th className="py-2.5 font-medium">LATENCY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-xs">
                {/* Row 1 */}
                <tr
                  style={{ transitionDelay: '100ms' }}
                  className={`tp-reveal-left ${benchmarksSection.isRevealed ? 'is-revealed' : ''}`}
                >
                  <td className="py-3 font-semibold text-slate-900 dark:text-white font-sans">Defect4J v2.0</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 font-sans">Java / Kotlin</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold">{d4jAcc}%</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{d4jPrec}%</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{d4jRec}%</td>
                  <td className="py-3 text-blue-600 dark:text-blue-400 font-bold">{d4jF1}%</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold">{d4jLat}ms</td>
                </tr>
                {/* Row 2 */}
                <tr
                  style={{ transitionDelay: '200ms' }}
                  className={`tp-reveal-left ${benchmarksSection.isRevealed ? 'is-revealed' : ''}`}
                >
                  <td className="py-3 font-semibold text-slate-900 dark:text-white font-sans">CodeSearchNet Corpus</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 font-sans">Python, TS, Go</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold">{csnAcc}%</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{csnPrec}%</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{csnRec}%</td>
                  <td className="py-3 text-blue-600 dark:text-blue-400 font-bold">{csnF1}%</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold">{csnLat}ms</td>
                </tr>
                {/* Row 3 */}
                <tr
                  style={{ transitionDelay: '300ms' }}
                  className={`tp-reveal-left ${benchmarksSection.isRevealed ? 'is-revealed' : ''}`}
                >
                  <td className="py-3 font-semibold text-slate-900 dark:text-white font-sans">BigCloneBench</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 font-sans">Multi-Language Duplicates</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold">{bcbAcc}%</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{bcbPrec}%</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{bcbRec}%</td>
                  <td className="py-3 text-blue-600 dark:text-blue-400 font-bold">{bcbF1}%</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold">{bcbLat}ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. SECTION: Final Call To Action */}
      <section
        ref={ctaSection.ref}
        className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-slate-100 dark:from-[#080d1a] dark:to-[#050811] text-center transition-colors"
      >
        <div
          className={`tp-container max-w-4xl mx-auto space-y-6 tp-reveal ${
            ctaSection.isRevealed ? 'is-revealed' : ''
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Start catching critical bugs before production.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join engineering teams shipping with confidence. Eliminate regressions and elevate code quality on every pull request.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="tp-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/30"
            >
              <span>Create account</span>
              <ArrowRight className="w-4 h-4 tp-arrow-icon" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-xs transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. SECTION: Footer (PART 1: Right navigation links removed, balanced layout) */}
      <footer className="bg-slate-100 dark:bg-[#050811] border-t border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 font-sans py-12 transition-colors">
        <div className="tp-container space-y-8">
          {/* Top section: Tracepoint branding & mission on left, clean balanced layout */}
          <div className="pb-6 border-b border-slate-200 dark:border-slate-800/80">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
                  tracepoint
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Turn code signals into clear next steps. Build with confidence, one pull request at a time.
              </p>
            </div>
          </div>

          {/* Bottom Bar: Preserved 3 items */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>Built for the teams behind reliable software.</p>
            <p className="font-mono uppercase text-[10px] tracking-wider text-slate-500">
              ENCRYPTED IN TRANSIT / PRIVATE BY DESIGN
            </p>
            <p>© 2026 Tracepoint · Illustrative product experience</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
