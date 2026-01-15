'use client';

import React from 'react';

/**
 * BackgroundEffect - A premium ambient background with animated orbs and noise texture.
 *
 * Features:
 * - Fixed position
 * - Backdrop blur
 * - Animated gradient orbs (Aurora effect)
 * - Subtle noise texture overlay
 */
export const BackgroundEffect: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-background">
      {/* Aurora Orbs */}
      <div className="absolute inset-0 overflow-hidden opacity-40 dark:opacity-60">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
        <div className="ambient-orb ambient-orb-4" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid opacity-[0.15] dark:opacity-[0.2]" />

      {/* Noise Texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_90%)] opacity-50" />
    </div>
  );
};

export default BackgroundEffect;
