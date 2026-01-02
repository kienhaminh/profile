/**
 * Design System type definitions
 */

export interface ColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  glow1: string;
  glow2: string;
}

export interface TypographyTokens {
  fontSans: string;
  fontMono: string;
  letterSpacing: string;
}

export interface SpacingTokens {
  radius: string;
  bentoRadius: string;
}

export interface DesignSystemTokens {
  light: ColorTokens;
  dark: ColorTokens;
}

export interface DesignSystemPreview {
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
}

export interface DesignSystem {
  id: string;
  name: string;
  slug: string;
  description: string;
  author: string;
  website: string;
  isDefault: boolean;
  preview: DesignSystemPreview;
  tokens: DesignSystemTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
}

export type TokenCategory =
  | 'colors'
  | 'semantic'
  | 'typography'
  | 'spacing'
  | 'components';
