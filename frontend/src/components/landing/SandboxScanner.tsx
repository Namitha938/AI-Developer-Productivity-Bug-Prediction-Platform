import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysisStore } from '../../stores/analysisStore';
import { analyzeArbitraryCode } from '../../utils/analyzer';
import {
  Cpu,
  FileCode2,
  Bug,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Sparkles,
} from 'lucide-react';

const PRESET_SNIPPETS = {
  python_sql: {
    name: 'Python • SQL Injection (CWE-89)',
    language: 'python',
    filename: 'auth_service.py',
    code: `def authenticate_user(db, username, raw_password, debug_log):
    # Dynamic string interpolation allows arbitrary SQL injection (CWE-89)
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{raw_password}'"
    
    # File descriptor opened without context manager or close() leak
    f = open(debug_log, "a")
    f.write(f"Auth attempt for {username}\\n")
    
    return db.execute(query)`,
  },
  javascript_xss: {
    name: 'TypeScript • Unsanitized DOM & eval',
    language: 'typescript',
    filename: 'profileRenderer.ts',
    code: `export function renderUserProfile(container: HTMLElement, profile: any) {
  // Vulnerable to cross-site scripting (CWE-79)
  container.innerHTML = \`<div class="card"><h3>\${profile.name}</h3></div>\`;

  // Execution of arbitrary user input
  if (profile.initCallback) {
    eval(profile.initCallback);
  }
}`,
  },
  java_resource: {
    name: 'Java • Unclosed Stream & Generic Exception',
    language: 'java',
    filename: 'ConfigReader.java',
    code: `public class ConfigReader {
    public static String readSecret(String filepath) {
        try {
            FileInputStream fis = new FileInputStream(filepath);
            byte[] bytes = new byte[2048];
            fis.read(bytes);
            // Resource leak: stream never closed in finally block (CWE-401)
            return new String(bytes);
        } catch (Exception e) {
            // Broad exception suppression hides runtime crashes
            return null;
        }
    }
}`,
  },
  python_safe: {
    name: 'Python • Parameterized & Verified (Safe)',
    language: 'python',
    filename: 'safe_auth.py',
    code: `def get_user_record(db, user_id: int) -> dict:
    """Safely retrieves active user records via parameterized query."""
    query = "SELECT id, username, email FROM users WHERE id = %s AND active = true"
    with db.cursor() as cursor:
        cursor.execute(query, (user_id,))
        return cursor.fetchone()`,
  },
};

export const SandboxScanner: React.FC = () => {
  const navigate = useNavigate();
  const { setCode, setLanguage, setFilename } = useAnalysisStore();

  const [activeSnippetKey, setActiveSnippetKey] = useState<keyof typeof PRESET_SNIPPETS>('python_sql');
  const [language, setLanguageState] = useState<string>('python');
  const [code, setCodeState] = useState<string>(PRESET_SNIPPETS.python_sql.code);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState(() =>
    analyzeArbitraryCode(PRESET_SNIPPETS.python_sql.code, 'auth_service.py', 'python')
  );

  const handleSnippetSelect = (key: keyof typeof PRESET_SNIPPETS) => {
    const s = PRESET_SNIPPETS[key];
    setActiveSnippetKey(key);
    setLanguageState(s.language);
    setCodeState(s.code);
    const fresh = analyzeArbitraryCode(s.code, s.filename, s.language);
    setAnalysisResult(fresh);
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 450));
    const filename =
      language === 'python' ? 'sandbox.py' : language === 'typescript' ? 'sandbox.ts' : 'Sandbox.java';
    const fresh = analyzeArbitraryCode(code, filename, language);
    setAnalysisResult(fresh);
    setIsScanning(false);
  };

  const handleOpenInIDE = () => {
    const filename =
      language === 'python' ? 'sandbox.py' : language === 'typescript' ? 'sandbox.ts' : 'Sandbox.java';
    setCode(code);
    setLanguage(language);
    setFilename(filename);
    navigate('/editor');
  };

  const riskScore = analysisResult.overallRiskScore;
  const isHighRisk = riskScore >= 60 || analysisResult.riskyLines.some((r) => r.severity === 'critical');
  const isMediumRisk = !isHighRisk && (riskScore >= 30 || analysisResult.codeSmells.length > 0);

  const riskColor = isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500';
  const riskBg = isHighRisk
    ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
    : isMediumRisk
    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  return (
    <section id="scanner" className="py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Live Sandbox Scanner</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Test Real Code Analysis Instantly
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Paste a function snippet below to parse control flow, count cyclomatic branches, and flag
            security exposures with our deterministic AST heuristic engine in real time.
          </p>
        </div>

        {/* Preset Snippet Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
            Load sample test case:
          </span>
          {(Object.keys(PRESET_SNIPPETS) as Array<keyof typeof PRESET_SNIPPETS>).map((key) => {
            const item = PRESET_SNIPPETS[key];
            const isActive = activeSnippetKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSnippetSelect(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Large Rounded 2-Column Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 hover:border-indigo-400 dark:hover:border-indigo-600/60 transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Code Input Sandbox (lg:col-span-6) */}
          <div className="lg:col-span-6 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Code Input Sandbox
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {language}
                  </span>
                  <span>• Monospace UTF-8</span>
                </div>
              </div>

              {/* Code Textarea with subtle dark IDE backdrop */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <span>stdin // editable snippet</span>
                  <span className="text-[11px]">{code.split('\n').length} lines</span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCodeState(e.target.value)}
                  rows={13}
                  spellCheck={false}
                  aria-label="Code Input Sandbox"
                  className="w-full bg-transparent p-4 font-mono text-xs sm:text-sm text-slate-100 focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
                  placeholder="// Paste arbitrary function here..."
                />
              </div>
            </div>

            {/* Run Button Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic AST parser + graph neural network weights
              </span>
              <button
                type="button"
                onClick={handleRunScan}
                disabled={isScanning || !code.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing AST...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Sandbox Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Deterministic AST & ML Output (lg:col-span-6) */}
          <div className="lg:col-span-6 p-6 sm:p-7 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between space-y-6">
            {/* Top Score Banner */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Prediction & Vulnerability Assessment
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${riskBg}`}>
                  {analysisResult.riskCategory}
                </span>
              </div>

              {/* Gauge & Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[11px] font-medium text-slate-500">Risk Score</div>
                  <div className={`text-xl font-bold font-mono ${riskColor}`}>
                    {riskScore}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[11px] font-medium text-slate-500">Cyclomatic</div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {analysisResult.complexity.cyclomaticComplexity}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[11px] font-medium text-slate-500">Cognitive</div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {analysisResult.complexity.cognitiveComplexity}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[11px] font-medium text-slate-500">Flaws</div>
                  <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {analysisResult.riskyLines.length + analysisResult.codeSmells.length}
                  </div>
                </div>
              </div>

              {/* Flagged Issue Detail */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Detected Exposures & Root Cause
                </div>

                {analysisResult.riskyLines.length > 0 ? (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {analysisResult.riskyLines[0].bugType}
                      </span>
                      <span className="font-mono text-[11px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                        Line {analysisResult.riskyLines[0].lineNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {analysisResult.riskyLines[0].description}
                    </p>
                    {analysisResult.riskyLines[0].suggestedFixSnippet && (
                      <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        Fix: {analysisResult.riskyLines[0].suggestedFixSnippet}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>No critical vulnerabilities or memory leaks detected in this snippet.</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA to Web IDE */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Want Monaco AST inline highlighting & SARIF export?
              </span>
              <button
                type="button"
                onClick={handleOpenInIDE}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Open in Full Web IDE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

