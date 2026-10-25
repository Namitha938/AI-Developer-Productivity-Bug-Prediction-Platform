
import { create } from 'zustand';
import axios from 'axios';
import type { AnalysisResult } from '../types';
import {
  analyzeCodeApi,
  getAnalysisHistoryApi,
} from '../api/analysisApi';

const STARTER_CODE = `def divide(a, b):
    return a / b

print(divide(10, 0))`;

interface AnalysisState {
  code: string;
  language: string;
  filename: string;

  isAnalyzing: boolean;
  error: string | null;
  result: AnalysisResult | null;

  history: AnalysisResult[];
  isLoadingHistory: boolean;
  historyError: string | null;
  historyHasMore: boolean;
  historyCursor: string | null;

  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setFilename: (filename: string) => void;

  analyzeCode: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;

  applyRefactor: () => void;
  clearResult: () => void;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    const detail = error.response?.data?.detail;

    if (detail) return detail;

    if (!error.response) {
      return 'Cannot reach the BugPulse AI backend. Check that the server is running.';
    }

    if (error.response.status === 401) {
      return 'Your session has expired. Please sign in again.';
    }

    return `Request failed (HTTP ${error.response.status}). Please try again.`;
  }

  return error instanceof Error
    ? error.message
    : 'An unexpected error occurred.';
}

function mergeUniqueAnalyses(
  existing: AnalysisResult[],
  incoming: AnalysisResult[],
): AnalysisResult[] {
  const seen = new Set<string>();

  return [...existing, ...incoming].filter((item) => {
    if (seen.has(item.id)) return false;

    seen.add(item.id);
    return true;
  });
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  code: STARTER_CODE,
  language: 'python',
  filename: 'division_test.py',

  isAnalyzing: false,
  error: null,
  result: null,

  history: [],
  isLoadingHistory: false,
  historyError: null,
  historyHasMore: false,
  historyCursor: null,

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setFilename: (filename) => set({ filename }),

  analyzeCode: async () => {
    const { code, language, filename, isAnalyzing } = get();

    if (isAnalyzing) return;

    if (!code.trim()) {
      set({ error: 'Enter some code before running the analysis.' });
      return;
    }

    if (!filename.trim()) {
      set({ error: 'Enter a filename for this code.' });
      return;
    }

    set({ isAnalyzing: true, error: null });

    try {
      const result = await analyzeCodeApi({
        code,
        language,
        filename: filename.trim(),
      });

      set((state) => ({
        result,
        history: mergeUniqueAnalyses(
          [result],
          state.history,
        ),
        isAnalyzing: false,
        error: null,
      }));
    } catch (error: unknown) {
      set({
        isAnalyzing: false,
        error: getErrorMessage(error),
      });
    }
  },

  loadHistory: async () => {
    if (get().isLoadingHistory) return;

    set({
      isLoadingHistory: true,
      historyError: null,
    });

    try {
      const response = await getAnalysisHistoryApi(20);

      set({
        history: response.items,
        historyCursor: response.nextCursor,
        historyHasMore: response.hasMore,
        isLoadingHistory: false,
        historyError: null,
      });
    } catch (error: unknown) {
      set({
        isLoadingHistory: false,
        historyError: getErrorMessage(error),
      });
    }
  },

  loadMoreHistory: async () => {
    const {
      isLoadingHistory,
      historyHasMore,
      historyCursor,
    } = get();

    if (
      isLoadingHistory ||
      !historyHasMore ||
      !historyCursor
    ) {
      return;
    }

    set({
      isLoadingHistory: true,
      historyError: null,
    });

    try {
      const response = await getAnalysisHistoryApi(
        20,
        historyCursor,
      );

      set((state) => ({
        history: mergeUniqueAnalyses(
          state.history,
          response.items,
        ),
        historyCursor: response.nextCursor,
        historyHasMore: response.hasMore,
        isLoadingHistory: false,
        historyError: null,
      }));
    } catch (error: unknown) {
      set({
        isLoadingHistory: false,
        historyError: getErrorMessage(error),
      });
    }
  },

  applyRefactor: () => {
    const result = get().result;
    const afterCode = result?.refactorSuggestion?.afterCode;

    if (!afterCode?.trim()) return;

    set({
      code: afterCode,
      error: null,
    });

    void get().analyzeCode();
  },

  clearResult: () => set({
    result: null,
    error: null,
  }),
}));
