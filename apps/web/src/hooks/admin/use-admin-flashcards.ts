/**
 * useAdminFlashcards Hook
 *
 * SWR hook for fetching and managing flashcard sets.
 */

import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/swr';

interface FlashcardSet {
  id: string;
  name: string;
  language: string;
  description?: string;
  isActive: boolean;
  vocabularyCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface FlashcardsStats {
  totalSets: number;
  activeSets: number;
  totalVocabularies: number;
  languages: string[];
}

interface FlashcardsResponse {
  sets: FlashcardSet[];
  stats: FlashcardsStats;
}

export function useAdminFlashcards() {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<FlashcardsResponse>(API_ENDPOINTS.FLASHCARDS);

  return {
    sets: data?.sets ?? [],
    stats: data?.stats ?? null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export type { FlashcardSet, FlashcardsStats };
