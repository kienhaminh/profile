'use client';

/**
 * SWR Provider Component
 *
 * Provides SWR configuration to the entire admin section.
 */

import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
