'use client';

import type { JSX } from 'react';
import { cn } from '@/lib/utils';

interface MockupProps {
  className?: string;
}

/**
 * DashboardMockup - Abstract UI illustration for dashboard/web app projects.
 * Displays a simplified dashboard layout with navigation and content panels.
 */
export function DashboardMockup({ className }: MockupProps): JSX.Element {
  return (
    <div
      className={cn(
        'absolute top-12 left-12 right-0 bottom-0 bg-background border-t border-l border-border rounded-tl-xl p-4 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:-translate-x-2',
        className
      )}
    >
      {/* Header/Navigation bar */}
      <div className="flex gap-4 mb-6 border-b border-border pb-4">
        <div className="w-32 h-6 bg-muted rounded-md" />
        <div className="w-12 h-6 bg-muted rounded-md ml-auto" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-muted/50 rounded-lg border border-border/50" />
        <div className="h-24 bg-muted/50 rounded-lg border border-border/50" />
        <div className="h-24 bg-muted/50 rounded-lg border border-border/50" />
      </div>

      {/* Additional content row */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="h-16 bg-muted/30 rounded-lg border border-border/30" />
        <div className="h-16 bg-muted/30 rounded-lg border border-border/30" />
      </div>
    </div>
  );
}

/**
 * PhoneMockup - Abstract UI illustration for mobile app projects.
 * Displays a simplified phone frame with app content.
 */
export function PhoneMockup({ className }: MockupProps): JSX.Element {
  return (
    <div
      className={cn(
        'absolute top-10 left-1/2 -translate-x-1/2 w-48 h-full bg-background border-x border-t border-border rounded-t-3xl p-3 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2',
        className
      )}
    >
      {/* Phone screen content */}
      <div className="w-full h-full bg-muted/30 rounded-t-2xl border border-border/50 p-4 space-y-3">
        {/* Profile avatar */}
        <div className="w-8 h-8 rounded-full bg-muted" />

        {/* Text lines */}
        <div className="w-2/3 h-2 bg-muted rounded-full" />
        <div className="w-1/2 h-2 bg-muted rounded-full" />

        {/* Content cards */}
        <div className="mt-8 p-3 bg-muted/50 rounded-xl border border-border/50 h-24" />
        <div className="p-3 bg-muted/50 rounded-xl border border-border/50 h-24" />
      </div>
    </div>
  );
}

/**
 * CodeMockup - Abstract UI illustration for CLI/dev tool projects.
 * Displays a simplified code editor with syntax highlighting hints.
 */
export function CodeMockup({ className }: MockupProps): JSX.Element {
  return (
    <div
      className={cn(
        'w-3/4 p-4 bg-background border border-border rounded-lg shadow-xl font-mono text-xs text-muted-foreground opacity-60 group-hover:scale-105 transition-transform duration-500',
        className
      )}
    >
      {/* Window controls */}
      <div className="flex gap-1.5 mb-3">
        <div className="w-2 h-2 rounded-full bg-destructive/50" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
        <div className="w-2 h-2 rounded-full bg-green-500/50" />
      </div>

      {/* Code lines */}
      <p>
        <span className="text-purple-400">const</span>{' '}
        <span className="text-primary">optimize</span> = () =&gt; {'{'}
      </p>
      <p className="pl-4">
        return <span className="text-green-400">true</span>;
      </p>
      <p>{'}'}</p>
    </div>
  );
}

/**
 * LayersIcon - Abstract icon for design system/component library projects.
 * A simple layered icon with hover animation.
 */
export function LayersMockup({ className }: MockupProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center justify-center h-full',
        className
      )}
    >
      <svg
        className="w-12 h-12 text-muted-foreground/50 group-hover:text-foreground transition-colors duration-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    </div>
  );
}

export default {
  DashboardMockup,
  PhoneMockup,
  CodeMockup,
  LayersMockup,
};
