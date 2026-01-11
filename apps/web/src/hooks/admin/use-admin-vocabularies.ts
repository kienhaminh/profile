/**
 * useAdminVocabularies Hook
 *
 * SWR hook for fetching and managing vocabularies.
 */

import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/swr';

interface Vocabulary {
  id: string;
  word: string;
  language: string;
  meaning: string;
  translation?: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  difficulty?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface VocabulariesStats {
  total: number;
  byLanguage: Record<string, number>;
  byDifficulty: Record<string, number>;
}

interface VocabulariesResponse {
  vocabularies: Vocabulary[];
  stats: VocabulariesStats;
}

interface UseAdminVocabulariesOptions {
  language?: string;
  difficulty?: string;
  search?: string;
}

export function useAdminVocabularies(
  options: UseAdminVocabulariesOptions = {}
) {
  const params = new URLSearchParams();

  if (options.language) {
    params.append('language', options.language);
  }
  if (options.difficulty) {
    params.append('difficulty', options.difficulty);
  }
  if (options.search) {
    params.append('search', options.search);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.VOCABULARIES}?${queryString}`
    : API_ENDPOINTS.VOCABULARIES;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<VocabulariesResponse>(url);

  return {
    vocabularies: data?.vocabularies ?? [],
    stats: data?.stats ?? null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export type { Vocabulary, VocabulariesStats };
