import React, { useState, useRef } from 'react';
import { useAnalysisStore } from '../../stores/analysisStore';
import { CodeEditor } from '../../components/editor/CodeEditor';
import { LanguageSelect } from '../../components/editor/LanguageSelect';
import { RiskGauge } from '../../components/analysis/RiskGauge';
import { ComplexityCard } from '../../components/analysis/ComplexityCard';
import { CodeSmellList } from '../../components/analysis/CodeSmellList';
import { DuplicateCodeList } from '../../components/analysis/DuplicateCodeList';
import { AiExplanation } from '../../components/analysis/AiExplanation';
import { RefactorDiff } from '../../components/analysis/RefactorDiff';
import { exportToSarif } from '../../utils/analyzer';
import {
  Play,
  Loader2,
  Sparkles,
  FileCode,
  SlidersHorizontal,
  Flame,
  Copy,
  Wand2,
  Upload,
  Download,
  Share2,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

export const EditorAnalysisPage: React.FC = () => {
  const {
    code,
    language,
    filename,
    currentSnippetKey,
    isAnalyzing,
    result,
    setCode,
    setLanguage,
    setFilename,
    loadSnippet,
    analyzeCode,
    applyRefactor,
  } = useAnalysisStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'smells' | 'duplicates' | 'refactor'>(
    'overview'
  );
  const [copiedShare, setCopiedShare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler for real-life usage
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        setFilename(file.name);

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'py') setLanguage('python');
        else if (ext === 'ts' || ext === 'tsx') setLanguage('typescript');
        else if (ext === 'js' || ext === 'jsx') setLanguage('javascript');
        else if (ext === 'go') setLanguage('go');
        else if (ext === 'rs') setLanguage('rust');
        else if (ext === 'java') setLanguage('java');
        else if (ext === 'sql') setLanguage('sql');

        analyzeCode();
      }
    };
    reader.readAsText(file);
  };

  // Export SARIF 2.1.0 standard report
  const handleExportSarif = () => {
    if (!result) return;
    const sarifData = exportToSarif(result);
    const blob = new Blob([sarifData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'analysis'}.sarif`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON Report
  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'analysis'}-audit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Markdown PR Summary
  const handleCopySummary = () => {
    if (!result) return;
    const markdown = `## 🛡️ BugPulse AI Code Inspection Report
- **Target File**: \`${result.filename}\` (${result.language})
- **Overall Risk Score**: **${result.overallRiskScore}/100** (${result.riskCategory})
- **Lines of Code**: ${result.complexity.linesOfCode} | **Cyclomatic Complexity**: ${result.complexity.cyclomaticComplexity}
- **Defects Identified**: ${result.riskyLines.length}
${result.riskyLines.map((r) => `- [${r.severity.toUpperCase()}] Line ${r.lineNumber}: ${r.bugType} — ${r.description}`).join('\n')}

### Remediation Guidance
${result.refactorSuggestion.summary}`;

    navigator.clipboard.writeText(markdown);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card rounded-2xl border border-border p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="text-xs font-mono font-semibold bg-muted/50 border border-border px-2.5 py-1 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-44"
              placeholder="filename.ext"
            />
          </div>

          <LanguageSelect
            language={language}
            onLanguageChange={setLanguage}
            selectedSnippetKey={currentSnippetKey}
            onSnippetSelect={loadSnippet}
          />

          {/* Upload Real Project File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".py,.ts,.js,.tsx,.jsx,.go,.rs,.java,.cpp,.sql,.c,.json"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-semibold transition-all"
            title="Upload any file from your codebase"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>Upload File</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={handleExportSarif}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border rounded-lg transition-colors"
                title="Export SARIF 2.1.0 OASIS standard format"
              >
                <Download className="w-3 h-3 text-primary" /> SARIF
              </button>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border rounded-lg transition-colors"
                title="Export JSON audit record"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-500" /> JSON
              </button>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border rounded-lg transition-colors"
                title="Copy markdown PR review comment"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-indigo-500" /> Copy Report
                  </>
                )}
              </button>
            </div>
          )}

          <button
            onClick={analyzeCode}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deep AST Heuristics...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Analyze Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split View: Monaco Editor (Left) & Results Panel (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Monaco Editor Container */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="h-9 bg-muted/40 border-b border-border px-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {filename}
            </span>
            <span className="text-[11px] font-mono">
              {result?.riskyLines?.length || 0} risk annotations on margin • Type or paste any code
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <CodeEditor
              code={code}
              language={language}
              onChange={(val) => setCode(val || '')}
              riskyLines={result?.riskyLines || []}
            />
          </div>
        </div>

        {/* Results Panel Container */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
          {/* Results Tab Bar */}
          <div className="h-10 border-b border-border flex items-center px-2 bg-muted/30 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('smells')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'smells'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Smells ({result?.codeSmells?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'duplicates'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Copy className="w-3.5 h-3.5 text-indigo-500" />
              Duplicates ({result?.duplicateBlocks?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('refactor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'refactor'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-500" /> Refactor
            </button>
          </div>

          {/* Results Content Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {isAnalyzing ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    DeepCode Neural Model Inspecting Syntax...
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Synthesizing AST call graphs, variable dataflows, and CWE heuristic rules.
                  </p>
                </div>
              </div>
            ) : !result ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                Click "Analyze Code" to generate predictive bug risk metrics.
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Gauge and Summary */}
                    <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                      <RiskGauge score={result.overallRiskScore} size={150} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Classification
                          </span>
                          <span className="text-xs font-semibold text-primary font-mono">
                            {result.riskCategory}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                          {result.summary}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          Model Latency: {result.executionTimeMs}ms • DeepCode v4.2 • OASIS SARIF Compatible
                        </span>
                      </div>
                    </div>

                    {/* AI Explanation Card */}
                    <AiExplanation explanation={result.aiExplanation} />

                    {/* Complexity Card */}
                    <ComplexityCard complexity={result.complexity} />
                  </div>
                )}

                {activeTab === 'smells' && (
                  <CodeSmellList smells={result.codeSmells} />
                )}

                {activeTab === 'duplicates' && (
                  <DuplicateCodeList duplicates={result.duplicateBlocks} />
                )}

                {activeTab === 'refactor' && (
                  <RefactorDiff
                    suggestion={result.refactorSuggestion}
                    onApply={applyRefactor}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
