
import { apiClient } from './client';
import type { AnalysisResult } from '../types';

export interface AnalyzeCodeRequest {
  code: string;
  language: string;
  filename: string;
}

export interface AnalysisHistoryResponse {
  items: AnalysisResult[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function analyzeCodeApi(
  request: AnalyzeCodeRequest
): Promise<AnalysisResult> {
  const response = await apiClient.post<AnalysisResult>(
    '/analysis/analyze',
    request,
    {
      // AI provider failover can take longer than an ordinary API request.
      timeout: 120_000,
    }
  );

  return response.data;
}

export async function getAnalysisHistoryApi(
  limit = 20,
  cursor?: string,
): Promise<AnalysisHistoryResponse> {
  const response = await apiClient.get<AnalysisHistoryResponse>(
    '/analysis/history',
    {
      params: {
        limit,
        ...(cursor ? { cursor } : {}),
      },
    }
  );

  return response.data;
}
