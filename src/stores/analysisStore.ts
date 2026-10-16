import { create } from 'zustand';
import { AnalysisResult } from '../types';
import { sampleCodeSnippets, mockDefaultAnalysisResult } from '../api/mockData';

interface AnalysisState {
  currentSnippetKey: string;
  code: string;
  language: string;
  filename: string;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  history: AnalysisResult[];

  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  setFilename: (name: string) => void;
  loadSnippet: (key: string) => void;
  analyzeCode: () => Promise<void>;
  applyRefactor: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  currentSnippetKey: 'python_memory_leak',
  code: sampleCodeSnippets.python_memory_leak.code,
  language: sampleCodeSnippets.python_memory_leak.language,
  filename: sampleCodeSnippets.python_memory_leak.filename,
  isAnalyzing: false,
  result: mockDefaultAnalysisResult,
  history: [mockDefaultAnalysisResult],

  setCode: (code: string) => set({ code }),
  setLanguage: (language: string) => set({ language }),
  setFilename: (filename: string) => set({ filename }),

  loadSnippet: (key: string) => {
    const item = sampleCodeSnippets[key];
    if (item) {
      set({
        currentSnippetKey: key,
        code: item.code,
        language: item.language,
        filename: item.filename,
      });
      // Automatically trigger fresh analysis for standard snippets
      get().analyzeCode();
    }
  },

  analyzeCode: async () => {
    set({ isAnalyzing: true });
    // Simulate real AI model processing
    await new Promise((r) => setTimeout(r, 1200));

    const currentCode = get().code;
    const currentLang = get().language;
    const currentFilename = get().filename;

    let generatedResult: AnalysisResult;

    if (currentLang === 'rust') {
      // Clean Rust snippet
      generatedResult = {
        id: 'anl-' + Math.floor(Math.random() * 90000 + 10000),
        filename: currentFilename,
        language: currentLang,
        timestamp: new Date().toISOString(),
        overallRiskScore: 12,
        riskCategory: 'Clean',
        executionTimeMs: 210,
        sourceCode: currentCode,
        summary: 'Excellent code health! No critical vulnerabilities or memory leaks detected. Thread-safety guarantees satisfied.',
        riskyLines: [],
        complexity: {
          cyclomaticComplexity: 4,
          cognitiveComplexity: 2,
          halsteadVolume: 184.2,
          linesOfCode: currentCode.split('\n').length,
          maintainabilityIndex: 94.8,
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
        },
        codeSmells: [],
        duplicateBlocks: [],
        aiExplanation: {
          rootCause: 'No defects found. The token bucket algorithm uses immutable references and constant time mathematical arithmetic.',
          consequences: ['Deterministic performance under load', 'Zero memory allocations during acquisition cycle'],
          securityThreatLevel: 'None'
        },
        refactorSuggestion: {
          summary: 'Code is already idiomatic and optimized for production throughput.',
          beforeCode: currentCode,
          afterCode: currentCode,
          performanceGain: 'Already optimal'
        }
      };
    } else if (currentLang === 'go') {
      // Go deadlock snippet
      generatedResult = {
        id: 'anl-' + Math.floor(Math.random() * 90000 + 10000),
        filename: currentFilename,
        language: currentLang,
        timestamp: new Date().toISOString(),
        overallRiskScore: 82,
        riskCategory: 'High Risk',
        executionTimeMs: 340,
        sourceCode: currentCode,
        summary: 'Deadlock hazard: Goroutine writing to unbuffered channel without concurrent consumer loop leads to permanent thread freeze.',
        riskyLines: [
          {
            lineNumber: 10,
            severity: 'critical',
            bugType: 'Unbuffered Channel Block (Go Deadlock)',
            confidence: 0.96,
            description: '`ch := make(chan int)` has 0 capacity. Producers block until consumer reads, but consumer starts after wg.Wait().',
            suggestedFixSnippet: 'ch := make(chan int, len(items)) // or consume concurrently'
          },
          {
            lineNumber: 17,
            severity: 'high',
            bugType: 'Goroutine Leak',
            confidence: 0.91,
            description: 'Spawned goroutines block on `ch <- val * 2` indefinitely if consumer fails to drain.',
            suggestedFixSnippet: 'select { case ch <- val * 2: \n case <-ctx.Done(): return }'
          }
        ],
        complexity: {
          cyclomaticComplexity: 7,
          cognitiveComplexity: 8,
          halsteadVolume: 290.4,
          linesOfCode: currentCode.split('\n').length,
          maintainabilityIndex: 61.5,
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(N)',
        },
        codeSmells: [
          {
            id: 'smell-go-1',
            type: 'Synchronization Misuse',
            severity: 'critical',
            lineStart: 21,
            lineEnd: 24,
            message: 'wg.Wait() placed before channel consumption causes circular wait deadlock',
            recommendation: 'Run channel consumer in a separate goroutine or buffer the channel capacity.',
            impact: 'Entire worker process stalls permanently.'
          }
        ],
        duplicateBlocks: [],
        aiExplanation: {
          rootCause: 'The program blocks on `wg.Wait()` waiting for goroutines to finish. However, those goroutines cannot finish because they are blocked waiting for someone to read from the unbuffered channel.',
          consequences: [
            'Permanent process hang on batch processing trigger',
            'OS thread exhaustion under high concurrency'
          ],
          cweRef: 'CWE-833: Deadlock',
          securityThreatLevel: 'Moderate'
        },
        refactorSuggestion: {
          summary: 'Use buffered channel sized to batch count or drain concurrently before wg.Wait().',
          beforeCode: `ch := make(chan int)\nfor _, item := range items {\n  wg.Add(1)\n  go func(val int) {\n    defer wg.Done()\n    ch <- val * 2\n  }(item)\n}\nwg.Wait()\nclose(ch)`,
          afterCode: `ch := make(chan int, len(items))\nfor _, item := range items {\n  wg.Add(1)\n  go func(val int) {\n    defer wg.Done()\n    ch <- val * 2\n  }(item)\n}\nwg.Wait()\nclose(ch)`,
          performanceGain: '100% deadlock elimination, non-blocking pipeline execution'
        }
      };
    } else if (currentLang === 'typescript' || currentLang === 'javascript') {
      // TS event leak
      generatedResult = {
        id: 'anl-' + Math.floor(Math.random() * 90000 + 10000),
        filename: currentFilename,
        language: currentLang,
        timestamp: new Date().toISOString(),
        overallRiskScore: 78,
        riskCategory: 'High Risk',
        executionTimeMs: 388,
        sourceCode: currentCode,
        summary: 'Memory leak: Event listeners attached on every connect() invocation without removal. Map cache retains all messages indefinitely.',
        riskyLines: [
          {
            lineNumber: 11,
            severity: 'high',
            bugType: 'Unbound Event Listener Leak',
            confidence: 0.94,
            description: '`window.addEventListener` attaches a new closure each time connect() is called. Previous listeners never garbage collected.',
            suggestedFixSnippet: 'window.removeEventListener("resize", this.boundResizeHandler)'
          },
          {
            lineNumber: 18,
            severity: 'medium',
            bugType: 'Unbounded Cache Growth',
            confidence: 0.89,
            description: 'Map `cache.set` grows indefinitely with incoming messages with no LRU eviction or TTL expiration.',
            suggestedFixSnippet: 'use LRUCache with max: 1000 items'
          }
        ],
        complexity: {
          cyclomaticComplexity: 8,
          cognitiveComplexity: 6,
          halsteadVolume: 312.1,
          linesOfCode: currentCode.split('\n').length,
          maintainabilityIndex: 58.0,
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(N) Unbounded',
        },
        codeSmells: [
          {
            id: 'smell-ts-1',
            type: 'Lifecycle Management',
            severity: 'high',
            lineStart: 10,
            lineEnd: 15,
            message: 'Missing dispose / unsubscribe teardown pattern',
            recommendation: 'Implement `destroy()` or `disconnect()` cleanup method removing all event handlers.',
            impact: 'Browser tab memory increases by 50MB per hour, freezing single-page application.'
          }
        ],
        duplicateBlocks: [],
        aiExplanation: {
          rootCause: 'Anonymous closure registered to global window scope keeps reference to WebSocketService instance alive, preventing V8 garbage collector from reclaiming unmounted components.',
          consequences: [
            'High browser heap consumption (> 400MB)',
            'Duplicate event emissions and duplicate network requests'
          ],
          cweRef: 'CWE-401: Missing Release of Memory after Effective Lifetime',
          securityThreatLevel: 'Moderate'
        },
        refactorSuggestion: {
          summary: 'Store bound handler reference and provide clean disconnect() lifecycle hook.',
          beforeCode: `window.addEventListener('resize', () => {\n  this.handleWindowResize();\n});`,
          afterCode: `private handleResize = () => this.handleWindowResize();\n\npublic connect(endpoint: string): void {\n  window.addEventListener('resize', this.handleResize);\n}\n\npublic disconnect(): void {\n  window.removeEventListener('resize', this.handleResize);\n  this.socket?.close();\n}`,
          performanceGain: 'Reclaims 100% leaked heap memory on disconnect'
        }
      };
    } else {
      // Default / Python leak
      generatedResult = {
        ...mockDefaultAnalysisResult,
        id: 'anl-' + Math.floor(Math.random() * 90000 + 10000),
        filename: currentFilename,
        language: currentLang,
        timestamp: new Date().toISOString(),
        sourceCode: currentCode,
      };
    }

    set((state) => ({
      isAnalyzing: false,
      result: generatedResult,
      history: [generatedResult, ...state.history.slice(0, 9)],
    }));
  },

  applyRefactor: () => {
    const current = get().result;
    if (current && current.refactorSuggestion) {
      set({
        code: current.refactorSuggestion.afterCode,
      });
      // Re-analyze the improved code
      get().analyzeCode();
    }
  },
}));

