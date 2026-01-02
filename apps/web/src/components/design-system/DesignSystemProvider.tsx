'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { DesignSystem, ColorTokens } from '@/types/design-system';
import {
  DESIGN_SYSTEMS,
  getDefaultDesignSystem,
  getDesignSystemBySlug,
} from '@/constants/design-systems';

const STORAGE_KEY = 'design-system-preference';

interface DesignSystemContextValue {
  /** Currently active design system */
  currentSystem: DesignSystem;
  /** All available design systems */
  availableSystems: DesignSystem[];
  /** Apply a new design system by slug */
  applySystem: (slug: string) => void;
  /** Reset to default design system */
  resetToDefault: () => void;
  /** Whether the system is currently being applied */
  isApplying: boolean;
}

const DesignSystemContext = createContext<DesignSystemContextValue | null>(
  null
);

/**
 * Convert token name from camelCase to CSS variable format
 * e.g., "cardForeground" -> "card-foreground"
 */
function tokenToCSSVar(token: string): string {
  return token.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Apply design system tokens to the document root
 */
function applyTokensToRoot(system: DesignSystem, isDarkMode: boolean): void {
  const root = document.documentElement;
  const tokens: ColorTokens = isDarkMode
    ? system.tokens.dark
    : system.tokens.light;

  // Apply color tokens
  Object.entries(tokens).forEach(([key, value]) => {
    const cssVar = `--${tokenToCSSVar(key)}`;
    root.style.setProperty(cssVar, value);
  });

  // Apply typography tokens
  root.style.setProperty('--font-sans', system.typography.fontSans);
  root.style.setProperty('--font-mono', system.typography.fontMono);
  root.style.setProperty('--letter-spacing', system.typography.letterSpacing);

  // Apply spacing tokens
  root.style.setProperty('--radius', system.spacing.radius);
  root.style.setProperty('--bento-radius', system.spacing.bentoRadius);
}

interface DesignSystemProviderProps {
  children: React.ReactNode;
  defaultSlug?: string;
}

export function DesignSystemProvider({
  children,
  defaultSlug,
}: DesignSystemProviderProps) {
  const [currentSystem, setCurrentSystem] = useState<DesignSystem>(
    getDefaultDesignSystem()
  );
  const [isApplying, setIsApplying] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    const slugToUse = stored || defaultSlug;

    if (slugToUse) {
      const system = getDesignSystemBySlug(slugToUse);
      if (system) {
        setCurrentSystem(system);
      }
    }
  }, [defaultSlug]);

  // Apply tokens when system changes or theme changes
  useEffect(() => {
    if (!mounted) return;

    const applyTokens = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      applyTokensToRoot(currentSystem, isDarkMode);
    };

    applyTokens();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          applyTokens();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [currentSystem, mounted]);

  const applySystem = useCallback((slug: string) => {
    setIsApplying(true);
    const system = getDesignSystemBySlug(slug);

    if (system) {
      setCurrentSystem(system);
      localStorage.setItem(STORAGE_KEY, slug);
    }

    // Small delay for visual feedback
    setTimeout(() => setIsApplying(false), 300);
  }, []);

  const resetToDefault = useCallback(() => {
    setIsApplying(true);
    const defaultSystem = getDefaultDesignSystem();
    setCurrentSystem(defaultSystem);
    localStorage.removeItem(STORAGE_KEY);
    setTimeout(() => setIsApplying(false), 300);
  }, []);

  const value: DesignSystemContextValue = {
    currentSystem,
    availableSystems: DESIGN_SYSTEMS,
    applySystem,
    resetToDefault,
    isApplying,
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
}

/**
 * Hook to access the design system context
 */
export function useDesignSystem(): DesignSystemContextValue {
  const context = useContext(DesignSystemContext);

  if (!context) {
    throw new Error(
      'useDesignSystem must be used within a DesignSystemProvider'
    );
  }

  return context;
}

/**
 * Hook to get the current design system (safe version that returns default)
 */
export function useCurrentDesignSystem(): DesignSystem {
  const context = useContext(DesignSystemContext);
  return context?.currentSystem ?? getDefaultDesignSystem();
}
