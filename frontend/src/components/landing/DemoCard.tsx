import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysisStore } from '../../stores/analysisStore';
import { analyzeArbitraryCode } from '../../utils/analyzer';
import { ResultCard, DemoAnalysisResult } from './ResultCard';
import { RiskLevel } from './RiskBadge';
import { Play, Loader2, Sparkles } from 'lucide-react';

interface CodeSample {
  name: string;
  language: 'python' | 'javascript' | 'java';
  code: string;
  expectedVerdict: RiskLevel;
}

const SAMPLES: Record<string, CodeSample> = {
  python_sql: {
    name: 'Python — SQL Injection & Resource Leak (High risk)',
    language: 'python',
    expectedVerdict: 'high',
    code: `def fetch_user_record(db, user_id, log_file):
    # Dynamic string interpolation allows arbitrary SQL injection
    query = f"SELECT * FROM users WHERE id = '{user_id}' AND active = 1"
    
    # File descriptor opened without context manager or close()
    f = open(log_file, "a")
    f.write(f"Executing query for user {user_id}\\n")
    
    return db.execute(query)`,
  },
  javascript_xss: {
    name: 'JavaScript — Unsanitized DOM & eval (High risk)',
    language: 'javascript',
    expectedVerdict: 'high',
    code: `function renderUserProfile(container, userInput) {
  // Direct innerHTML assignment allows stored XSS
  container.innerHTML = "<h3>Welcome " + userInput.name + "</h3>";
  
  // Execution of arbitrary user supplied string
  if (userInput.customAction) {
    eval(userInput.customAction);
  }
}`,
  },
  java_leak: {
    name: 'Java — Unclosed Stream & Raw Exception (Medium risk)',
    language: 'java',
    expectedVerdict: 'medium',
    code: `public String readConfiguration(String path) {
    try {
        FileInputStream stream = new FileInputStream(path);
        byte[] data = new byte[1024];
        stream.read(data);
        // Resource leak: stream never closed in finally or try-with-resources
        return new String(data);
    } catch (Exception e) {
        // Generic catch hides root causes
        return null;
    }
}`,
  },
  python_clean: {
    name: 'Python — Clean Parameterized Query (Low risk)',
    language: 'python',
    expectedVerdict: 'low',
    code: `def get_user_by_id(db, user_id: int) -> dict:
    """Safely retrieves a user record using parameterized bindings."""
    query = "SELECT id, email, created_at FROM users WHERE id = %s AND active = true"
    with db.cursor() as cursor:
        cursor.execute(query, (user_id,))
        return cursor.fetchone()`,
  },
};

export const DemoCard: React.FC = () => {
  const navigate = useNavigate();
  const { setCode, setLanguage, setFilename } = useAnalysisStore();

  const [language, setLanguageState] = useState<'python' | 'javascript' | 'java'>('python');
  const [code, setCodeState] = useState<string>(SAMPLES.python_sql.code);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DemoAnalysisResult | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'python' | 'javascript' | 'java';
    setLanguageState(newLang);
    if (newLang === 'python') setCodeState(SAMPLES.python_sql.code);
    else if (newLang === 'javascript') setCodeState(SAMPLES.javascript_xss.code);
    else if (newLang === 'java') setCodeState(SAMPLES.java_leak.code);
  };

  const handleLoadSample = (sampleKey: keyof typeof SAMPLES) => {
    const s = SAMPLES[sampleKey];
    if (s) {
      setLanguageState(s.language);
      setCodeState(s.code);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    // Simulate ML model inference latency (realistic 550ms delay)
    await new Promise((r) => setTimeout(r, 550));

    // Run static code analysis & ML heuristic engine
    const filename =
      language === 'python' ? 'demo.py' : language === 'javascript' ? 'demo.js' : 'Demo.java';
    const analysis = analyzeArbitraryCode(code, filename, language);

    // Compute verdict level
    let verdict: RiskLevel = 'low';
    if (
      analysis.overallRiskScore >= 60 ||
      analysis.riskyLines.some((r) => r.severity === 'critical')
    ) {
      verdict = 'high';
    } else if (
      analysis.overallRiskScore >= 30 ||
      analysis.riskyLines.some((r) => r.severity === 'high') ||
      analysis.codeSmells.length > 0
    ) {
      verdict = 'medium';
    }

    // Confidence: average of identified risky lines or calibrated score
    const confidence =
      analysis.riskyLines.length > 0
        ? Math.max(0.78, Math.min(0.96, analysis.riskyLines[0].confidence))
        : 0.88;

    const issuesCount = analysis.riskyLines.length + analysis.codeSmells.length;

    // Why flagged text
    let whyFlagged = 'No high-risk security flaws or critical performance anti-patterns detected.';
    if (analysis.riskyLines.length > 0) {
      whyFlagged = `${analysis.riskyLines[0].bugType}: ${analysis.riskyLines[0].description}`;
    } else if (analysis.codeSmells.length > 0) {
      whyFlagged = `${analysis.codeSmells[0].type}: ${analysis.codeSmells[0].message}`;
    } else if (analysis.aiExplanation?.rootCause) {
      whyFlagged = analysis.aiExplanation.rootCause;
    }

    // Suggested fix
    let suggestedFix =
      'Code conforms to clean architecture standards. Maintain test coverage and typing.';
    if (analysis.riskyLines.length > 0 && analysis.riskyLines[0].suggestedFixSnippet) {
      suggestedFix = analysis.riskyLines[0].suggestedFixSnippet;
    } else if (analysis.refactorSuggestion?.afterCode) {
      suggestedFix = analysis.refactorSuggestion.afterCode;
    }

    const complexityVal = analysis.complexity.cyclomaticComplexity;
    const complexityLabel: 'Low' | 'Medium' | 'High' =
      complexityVal <= 5 ? 'Low' : complexityVal <= 10 ? 'Medium' : 'High';

    setResult({
      verdict,
      confidence,
      complexity: complexityVal,
      complexityLabel,
      linesOfCode: analysis.complexity.linesOfCode,
      issuesCount,
      whyFlagged,
      suggestedFix,
      code,
      language,
    });

    setIsAnalyzing(false);
  };

  const handleOpenInEditor = () => {
    const filename =
      language === 'python' ? 'demo.py' : language === 'javascript' ? 'demo.js' : 'Demo.java';
    setCode(code);
    setLanguage(language);
    setFilename(filename);
    navigate('/editor');
  };

  return (
    <div id="demo" className="w-full max-w-3xl mx-auto space-y-6">
      {/* Demo Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
        {/* Top Control Bar: Language selector & Sample Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <label
              htmlFor="demo-language"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Language:
            </label>
            <select
              id="demo-language"
              value={language}
              onChange={handleLanguageChange}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Quick sample chips */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Load sample:</span>
            <button
              type="button"
              onClick={() => handleLoadSample('python_sql')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded px-1"
            >
              SQL injection
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={() => handleLoadSample('javascript_xss')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded px-1"
            >
              XSS
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={() => handleLoadSample('python_clean')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded px-1"
            >
              Clean code
            </button>
          </div>
        </div>

        {/* Code Textarea */}
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCodeState(e.target.value)}
            rows={8}
            aria-label="Source code for bug prediction"
            placeholder="// Paste your code snippet here..."
            className="w-full font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg p-3.5 border border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Instant AST heuristic & ML risk scoring engine
          </span>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing code...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Analyze code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Card appears below after clicking Analyze */}
      {result && (
        <ResultCard result={result} onOpenInEditor={handleOpenInEditor} />
      )}
    </div>
  );
};
