'use client';

import type { JSX } from 'react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'icon' | 'full';
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({
  variant = 'full',
  className = '',
  width,
  height,
}: LogoProps): JSX.Element {
  const logoSrc = variant === 'icon' ? '/favicon.svg' : '/logo.svg';
  const defaultWidth = variant === 'icon' ? 48 : 280;
  const defaultHeight = variant === 'icon' ? 48 : 60;

  return (
    <Image
      src={logoSrc}
      alt={variant === 'icon' ? 'K' : 'Kien'}
      width={width ?? defaultWidth}
      height={height ?? defaultHeight}
      className={`transition-all duration-300 ${className}`}
      priority
    />
  );
}

export default Logo;
