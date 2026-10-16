import { create } from 'zustand';
import { AnalysisResult } from '../types';
import { sampleCodeSnippets, mockDefaultAnalysisResult } from '../api/mockData';
import { analyzeArbitraryCode } from '../utils/analyzer';

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
      // Automatically trigger analysis for standard snippets
      get().analyzeCode();
    }
  },

  analyzeCode: async () => {
    set({ isAnalyzing: true });

    // Realistic latency simulating AST parsing and ML inference
    await new Promise((r) => setTimeout(r, 650));

    const currentCode = get().code;
    const currentLang = get().language;
    const currentFilename = get().filename;

    // Run dynamic analyzer on whatever code is currently in the editor
    const generatedResult = analyzeArbitraryCode(currentCode, currentFilename, currentLang);

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
