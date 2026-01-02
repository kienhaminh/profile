'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Palette,
  Type,
  Ruler,
  Box,
  Sun,
  Moon,
} from 'lucide-react';
import {
  getDesignSystemBySlug,
  DESIGN_SYSTEMS,
} from '@/constants/design-systems';
import type { ColorTokens } from '@/types/design-system';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDesignSystem } from '@/components/design-system/DesignSystemProvider';

export default function DesignSystemDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const system = getDesignSystemBySlug(slug);

  const { currentSystem, applySystem, isApplying } = useDesignSystem();
  const isActive = currentSystem.slug === slug;

  const [previewMode, setPreviewMode] = React.useState<'light' | 'dark'>(
    'dark'
  );

  if (!system) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Design System Not Found</h1>
          <Link href="/design-gallery">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tokens: ColorTokens =
    previewMode === 'dark' ? system.tokens.dark : system.tokens.light;

  const handleApply = () => {
    applySystem(system.slug);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: system.tokens.dark.glow1 }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: system.tokens.dark.glow2 }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/design-gallery">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-medium">{system.name}</h1>
              {isActive && (
                <Badge variant="default" className="gap-1">
                  <Check className="w-3 h-3" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{system.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={system.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <Button onClick={handleApply} disabled={isApplying || isActive}>
              {isActive ? 'Applied' : 'Apply Design System'}
            </Button>
          </div>
        </div>

        {/* Preview Mode Toggle */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-lg border border-border bg-card/30">
          <span className="text-sm font-medium">Preview Mode:</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={previewMode === 'light' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('light')}
            >
              <Sun className="w-4 h-4 mr-1" />
              Light
            </Button>
            <Button
              size="sm"
              variant={previewMode === 'dark' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('dark')}
            >
              <Moon className="w-4 h-4 mr-1" />
              Dark
            </Button>
          </div>
        </div>

        {/* SECTION: Colors */}
        <section className="mb-16">
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 opacity-70" />
            Color Tokens
          </h2>

          {/* Core Colors */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
              Core Colors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                {
                  name: 'Background',
                  key: 'background' as const,
                  fg: 'foreground' as const,
                },
                {
                  name: 'Foreground',
                  key: 'foreground' as const,
                  fg: 'background' as const,
                },
                {
                  name: 'Card',
                  key: 'card' as const,
                  fg: 'cardForeground' as const,
                },
                {
                  name: 'Primary',
                  key: 'primary' as const,
                  fg: 'primaryForeground' as const,
                },
                {
                  name: 'Secondary',
                  key: 'secondary' as const,
                  fg: 'secondaryForeground' as const,
                },
                {
                  name: 'Muted',
                  key: 'muted' as const,
                  fg: 'mutedForeground' as const,
                },
              ].map((color) => (
                <div key={color.key} className="space-y-2">
                  <div
                    className="h-20 rounded-lg border border-border flex items-end p-3"
                    style={{ backgroundColor: tokens[color.key] }}
                  >
                    <span
                      className="text-xs font-mono"
                      style={{ color: tokens[color.fg] }}
                    >
                      {tokens[color.key]}
                    </span>
                  </div>
                  <div className="text-xs font-medium">{color.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
              Semantic Colors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  name: 'Accent',
                  key: 'accent' as const,
                  fg: 'accentForeground' as const,
                },
                {
                  name: 'Destructive',
                  key: 'destructive' as const,
                  fg: 'destructiveForeground' as const,
                },
                {
                  name: 'Border',
                  key: 'border' as const,
                  fg: 'foreground' as const,
                },
                {
                  name: 'Ring',
                  key: 'ring' as const,
                  fg: 'background' as const,
                },
              ].map((color) => (
                <div key={color.key} className="space-y-2">
                  <div
                    className="h-16 rounded-lg border border-border flex items-end p-3"
                    style={{ backgroundColor: tokens[color.key] }}
                  >
                    <span
                      className="text-xs font-mono"
                      style={{ color: tokens[color.fg] }}
                    >
                      {tokens[color.key]}
                    </span>
                  </div>
                  <div className="text-xs font-medium">{color.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: Typography */}
        <section className="mb-16">
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <Type className="w-5 h-5 opacity-70" />
            Typography
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Font Sans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className="text-2xl mb-2"
                  style={{ fontFamily: system.typography.fontSans }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
                <code className="text-xs text-muted-foreground block font-mono break-all">
                  {system.typography.fontSans}
                </code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Font Mono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className="text-lg mb-2"
                  style={{ fontFamily: system.typography.fontMono }}
                >
                  const design = &quot;system&quot;;
                </p>
                <code className="text-xs text-muted-foreground block font-mono break-all">
                  {system.typography.fontMono}
                </code>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Letter Spacing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className="text-3xl font-medium"
                  style={{ letterSpacing: system.typography.letterSpacing }}
                >
                  Design System Gallery
                </p>
                <code className="text-xs text-muted-foreground mt-2 block font-mono">
                  letter-spacing: {system.typography.letterSpacing}
                </code>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION: Spacing */}
        <section className="mb-16">
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <Ruler className="w-5 h-5 opacity-70" />
            Spacing & Radius
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Border Radius
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div
                  className="w-16 h-16 bg-primary"
                  style={{ borderRadius: system.spacing.radius }}
                />
                <div>
                  <p className="text-lg font-medium">{system.spacing.radius}</p>
                  <code className="text-xs text-muted-foreground">
                    --radius
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Bento Radius
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div
                  className="w-20 h-16 bg-accent"
                  style={{ borderRadius: system.spacing.bentoRadius }}
                />
                <div>
                  <p className="text-lg font-medium">
                    {system.spacing.bentoRadius}
                  </p>
                  <code className="text-xs text-muted-foreground">
                    --bento-radius
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION: Components Preview */}
        <section className="mb-16">
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <Box className="w-5 h-5 opacity-70" />
            Component Preview
          </h2>

          <div
            className="rounded-xl p-8 border"
            style={{
              backgroundColor: tokens.background,
              borderColor: tokens.border,
            }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Buttons */}
              <div>
                <h3
                  className="text-sm font-medium mb-4 uppercase tracking-wider"
                  style={{ color: tokens.mutedForeground }}
                >
                  Buttons
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-6 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: tokens.primary,
                      color: tokens.primaryForeground,
                      borderRadius: system.spacing.radius,
                    }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-6 py-2.5 rounded-lg text-sm font-medium border transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: 'transparent',
                      color: tokens.foreground,
                      borderColor: tokens.border,
                      borderRadius: system.spacing.radius,
                    }}
                  >
                    Outline
                  </button>
                  <button
                    className="px-6 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: tokens.destructive,
                      color: tokens.destructiveForeground,
                      borderRadius: system.spacing.radius,
                    }}
                  >
                    Destructive
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3
                  className="text-sm font-medium mb-4 uppercase tracking-wider"
                  style={{ color: tokens.mutedForeground }}
                >
                  Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: tokens.primary,
                      color: tokens.primaryForeground,
                    }}
                  >
                    Default
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: tokens.secondary,
                      color: tokens.secondaryForeground,
                    }}
                  >
                    Secondary
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium border"
                    style={{
                      borderColor: tokens.border,
                      color: tokens.foreground,
                    }}
                  >
                    Outline
                  </span>
                </div>
              </div>

              {/* Input */}
              <div>
                <h3
                  className="text-sm font-medium mb-4 uppercase tracking-wider"
                  style={{ color: tokens.mutedForeground }}
                >
                  Input
                </h3>
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-4 py-2.5 text-sm border outline-none transition-colors"
                  style={{
                    backgroundColor: tokens.background,
                    color: tokens.foreground,
                    borderColor: tokens.input,
                    borderRadius: system.spacing.radius,
                  }}
                />
              </div>

              {/* Card */}
              <div>
                <h3
                  className="text-sm font-medium mb-4 uppercase tracking-wider"
                  style={{ color: tokens.mutedForeground }}
                >
                  Card
                </h3>
                <div
                  className="p-4 border"
                  style={{
                    backgroundColor: tokens.card,
                    borderColor: tokens.border,
                    borderRadius: system.spacing.bentoRadius,
                  }}
                >
                  <h4
                    className="font-medium mb-1"
                    style={{ color: tokens.cardForeground }}
                  >
                    Card Title
                  </h4>
                  <p
                    className="text-sm"
                    style={{ color: tokens.mutedForeground }}
                  >
                    Card description text
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Apply CTA */}
        <div className="text-center p-8 rounded-xl border border-border bg-card/30">
          <h3 className="text-xl font-medium mb-2">Ready to apply?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Apply this design system to see how it transforms the entire
            website. Your preference will be saved locally.
          </p>
          <Button
            size="lg"
            onClick={handleApply}
            disabled={isApplying || isActive}
          >
            {isActive ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Currently Active
              </>
            ) : (
              'Apply {system.name}'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
