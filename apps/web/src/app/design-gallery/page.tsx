import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ExternalLinkButton } from './ExternalLinkButton';
import { DESIGN_SYSTEMS } from '@/constants/design-systems';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design System Gallery | Kien Ha',
  description:
    'Explore and compare popular design systems. Apply different design tokens to see how they transform the UI.',
};

export default function DesignGalleryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-1/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-glow-2/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="mb-16">
          <Badge variant="outline" className="mb-4">
            Gallery
          </Badge>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Design System Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore popular design systems and see how their tokens transform
            this website. Click on any design system to view its complete token
            set and apply it.
          </p>
        </header>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESIGN_SYSTEMS.map((system) => (
            <Link
              key={system.id}
              href={`/design-gallery/${system.slug}`}
              className="group relative"
            >
              <div className="relative rounded-xl border border-border bg-card/50 p-6 h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
                {/* Color Preview */}
                <div className="flex gap-2 mb-6">
                  <div
                    className="w-12 h-12 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: system.preview.backgroundColor }}
                  />
                  <div
                    className="w-12 h-12 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: system.preview.primaryColor }}
                  />
                  <div
                    className="w-12 h-12 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: system.preview.accentColor }}
                  />
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                    {system.name}
                  </h2>
                  {system.isDefault && (
                    <Badge variant="secondary" className="shrink-0">
                      Current
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {system.description}
                </p>

                {/* Author & Link */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>by {system.author}</span>
                  <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                    View tokens
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>

                {/* External Link (absolute positioned) */}
                <ExternalLinkButton
                  href={system.website}
                  systemName={system.name}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 p-6 rounded-xl border border-border bg-card/30">
          <h3 className="text-lg font-medium mb-2">How it works</h3>
          <p className="text-sm text-muted-foreground">
            Each design system includes a complete set of design tokens (colors,
            typography, spacing) that can be applied to this website. When you
            click &quot;Apply&quot; on a detail page, the CSS variables are
            updated in real-time and your preference is saved locally.
          </p>
        </div>
      </div>
    </div>
  );
}
