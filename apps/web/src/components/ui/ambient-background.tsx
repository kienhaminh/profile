'use client';

import type { JSX } from 'react';

/**
 * AmbientBackground - Creates a subtle ambient glow effect with grid pattern overlay.
 *
 * Features:
 * - Teal glow in top-left corner
 * - Violet glow in bottom-right corner
 * - Grid pattern overlay for texture
 * - Respects reduced motion preferences
 * - Works with both light and dark themes
 */
export function AmbientBackground(): JSX.Element {
  return (
    <>
      {/* Ambient glow circles */}
      <div className="ambient-glow" aria-hidden="true">
        <div className="ambient-glow-teal" />
        <div className="ambient-glow-violet" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 bg-grid -z-10 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}

export default AmbientBackground;
