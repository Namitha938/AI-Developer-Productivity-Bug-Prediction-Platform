
import React, { useEffect, useState } from 'react';
import {
  Play,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Code2,
  FileText,
  ShieldCheck,
  WandSparkles,
  History,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

import { useAnalysisStore } from '../../stores/analysisStore';
import type { Severity } from '../../types';
import { CodeEditor } from '../../components/editor/CodeEditor';
type FindingsFilter = 'Bugs' | 'Smells' | 'Duplicates';

const severityClasses: Record<Severity, string> = {
  critical: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  high: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  low: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
};

export const EditorAnalysisPage: React.FC = () => {
  const {
    code,
    language,
    filename,
    isAnalyzing,
    error,
    result,
    history,
    isLoadingHistory,
    historyError,
    historyHasMore,
    setCode,
    setLanguage,
    setFilename,
    analyzeCode,
    loadHistory,
    loadMoreHistory,
    applyRefactor,
  } = useAnalysisStore();

  const [findingsFilter, setFindingsFilter] =
    useState<FindingsFilter>('Bugs');

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const lines = code.split('\n');

  const riskLines = new Set(
    result?.riskyLines.map((finding) => finding.lineNumber) ?? [],
  );

  const riskColor =
    !result || result.overallRiskScore < 40
      ? 'text-emerald-500'
      : result.overallRiskScore < 70
        ? 'text-amber-500'
        : 'text-rose-500';

  const openAnalysis = (item: (typeof history)[number]) => {
    setCode(item.sourceCode);
    setLanguage(item.language);
    setFilename(item.filename);

    useAnalysisStore.setState({
      result: item,
      error: null,
    });

    setFindingsFilter('Bugs');
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 font-sans">
      <header className="flex shrink-0 flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Understand every code path.
          </h1>

          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Code2 className="h-3.5 w-3.5" />
            Real AI analysis
            <span>·</span>
            Firebase-authenticated

            {result && (
              <>
                <span>·</span>
                <span className="font-mono">
                  {result.id.slice(0, 12)}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {result && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Analysis complete
            </span>
          )}

          <button
            type="button"
            onClick={() => void analyzeCode()}
            disabled={isAnalyzing || !code.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            {isAnalyzing ? 'Analyzing…' : 'Run analysis'}
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Analysis failed</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Persistent analysis history */}
      <section className="shrink-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0c1322]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-500" />

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Analysis history
              </h2>
              <p className="text-xs text-slate-500">
                Previously saved analyses from your account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadHistory()}
            disabled={isLoadingHistory}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isLoadingHistory ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>
        </div>

        {historyError && (
          <div
            role="alert"
            className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <span>{historyError}</span>

            <button
              type="button"
              onClick={() => void loadHistory()}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {!historyError && isLoadingHistory && history.length === 0 && (
          <p className="mt-3 text-xs text-slate-500">
            Loading saved analyses…
          </p>
        )}

        {!isLoadingHistory &&
          !historyError &&
          history.length === 0 && (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700">
              No saved analyses yet. Run your first analysis to see it here.
            </p>
          )}

        {history.length > 0 && (
          <div className="mt-3 space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openAnalysis(item)}
                aria-current={result?.id === item.id ? 'true' : undefined}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors ${
                  result?.id === item.id
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.filename}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {item.language}
                    {' · '}
                    {new Date(item.timestamp).toLocaleString()}
                  </p>

                  <p className="mt-1 truncate text-[11px] text-slate-500">
                    {item.summary}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                    {item.overallRiskScore}/100
                  </p>

                  <p className="text-[10px] text-slate-500">
                    {item.riskCategory}
                  </p>
                </div>
              </button>
            ))}

            {historyHasMore && (
              <button
                type="button"
                onClick={() => void loadMoreHistory()}
                disabled={isLoadingHistory}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-slate-900"
              >
                {isLoadingHistory ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {isLoadingHistory
                  ? 'Loading…'
                  : 'Load older analyses'}
              </button>
            )}
          </div>
        )}
      </section>

      <div className="grid min-h-[600px] flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Code editor */}
        <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-[#0c1322] lg:col-span-8">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <FileText className="h-4 w-4 text-blue-500" />

            <input
              aria-label="Filename"
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              maxLength={255}
              className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 font-mono text-sm text-slate-800 outline-none focus:border-blue-500 dark:text-slate-100"
              placeholder="filename.py"
            />

            <select
              aria-label="Programming language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="max-w-36 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="sql">SQL</option>
            </select>
          </div>

<div className="min-h-[520px] min-w-0 flex-1 overflow-hidden rounded-lg">
  <CodeEditor
    code={code}
    language={language}
    onChange={(value) => setCode(value ?? '')}
    riskyLines={result?.riskyLines ?? []}
  />
</div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
            <span>
              {lines.length} lines · {code.length.toLocaleString()} characters
            </span>

            <span>
              {result
                ? `Analyzed ${new Date(result.timestamp).toLocaleString()}`
                : 'No analysis run yet'}
            </span>
          </div>
        </section>

        {/* AI findings */}
        <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0c1322] lg:col-span-4">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  AI findings
                </h2>

                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                  {result
                    ? `${result.provider ?? 'AI provider'} · ${result.model ?? 'Model not reported'}`
                    : 'Awaiting real analysis'}
                </p>
              </div>

              <div className="text-right">
                <span className={`font-mono text-3xl font-black ${riskColor}`}>
                  {result ? result.overallRiskScore : '—'}
                </span>

                <span className="block text-[10px] text-slate-400">
                  Risk score / 100
                </span>
              </div>
            </div>

            {result && (
              <>
                <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {result.riskCategory}
                </p>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {result.summary}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['Bugs', result?.riskyLines.length ?? 0],
                ['Smells', result?.codeSmells.length ?? 0],
                ['Duplicates', result?.duplicateBlocks.length ?? 0],
              ] as const
            ).map(([label, count]) => (
              <button
                key={label}
                type="button"
                onClick={() => setFindingsFilter(label)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  findingsFilter === label
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {label} {result ? count : ''}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {!result && (
              <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
                <ShieldCheck className="mx-auto h-7 w-7 text-slate-400" />

                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No analysis yet
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Run analysis to get findings from the backend AI service.
                </p>
              </div>
            )}

            {result &&
              findingsFilter === 'Bugs' &&
              result.riskyLines.map((finding, index) => (
                <article
                  key={`${finding.lineNumber}-${index}`}
                  className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {finding.bugType}
                    </h3>

                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        severityClasses[finding.severity]
                      }`}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Line {finding.lineNumber} · {finding.description}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Confidence: {Math.round(finding.confidence * 100)}%
                  </p>

                  {finding.suggestedFixSnippet && (
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-slate-100 p-2 text-[10px] text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {finding.suggestedFixSnippet}
                    </pre>
                  )}
                </article>
              ))}

            {result &&
              findingsFilter === 'Smells' &&
              result.codeSmells.map((smell) => (
                <article
                  key={smell.id}
                  className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {smell.type}
                    </h3>

                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        severityClasses[smell.severity]
                      }`}
                    >
                      {smell.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Lines {smell.lineStart}–{smell.lineEnd}
                  </p>

                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {smell.message}
                  </p>

                  <p className="text-[11px] text-blue-600 dark:text-blue-400">
                    {smell.recommendation}
                  </p>
                </article>
              ))}

            {result &&
              findingsFilter === 'Duplicates' &&
              result.duplicateBlocks.map((duplicate) => (
                <article
                  key={duplicate.id}
                  className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Duplicate code detected
                  </h3>

                  <p className="text-[11px] text-slate-500">
                    {duplicate.fileA} ({duplicate.linesA.join('–')}) ↔{' '}
                    {duplicate.fileB} ({duplicate.linesB.join('–')})
                  </p>

                  <p className="text-xs text-slate-500">
                    Similarity: {Math.round(duplicate.similarityScore * 100)}%
                  </p>

                  <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-slate-100 p-2 text-[10px] dark:bg-slate-900">
                    {duplicate.duplicatedSnippet}
                  </pre>
                </article>
              ))}

            {result &&
              (
                (findingsFilter === 'Bugs' &&
                  result.riskyLines.length === 0) ||
                (findingsFilter === 'Smells' &&
                  result.codeSmells.length === 0) ||
                (findingsFilter === 'Duplicates' &&
                  result.duplicateBlocks.length === 0)
              ) && (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700">
                  No {findingsFilter.toLowerCase()} were reported in this analysis.
                </p>
              )}
          </div>

          {result && (
            <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">
                    Cyclomatic complexity
                  </span>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                    {result.complexity.cyclomaticComplexity}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Maintainability</span>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                    {result.complexity.maintainabilityIndex}/100
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Time complexity</span>

                  <p className="mt-1 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {result.complexity.timeComplexity}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Execution time</span>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                    {(result.executionTimeMs / 1000).toFixed(2)}s
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/70">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <WandSparkles className="h-4 w-4 text-blue-500" />
                  Refactoring suggestion
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {result.refactorSuggestion.summary}
                </p>

                <button
                  type="button"
                  onClick={applyRefactor}
                  disabled={isAnalyzing}
                  className="mt-3 w-full rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/40"
                >
                  Apply suggestion and re-analyze
                </button>

                <p className="mt-2 text-[10px] text-slate-400">
                  Review generated changes before using them in production.
                </p>
              </div>

              <div className="text-[10px] leading-relaxed text-slate-400">
                Root cause: {result.aiExplanation.rootCause}
                {result.aiExplanation.cweRef &&
                  ` · ${result.aiExplanation.cweRef}`}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EditorAnalysisPage;
