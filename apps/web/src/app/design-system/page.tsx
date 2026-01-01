import React from 'react';
import {
  ArrowRight,
  Copy,
  LayoutTemplate,
  Box,
  Palette,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white/20 selection:text-white pb-32">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="mb-20">
          <h1 className="text-5xl font-medium tracking-tight mb-4">
            Design System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A central repository of design tokens, components, and patterns used
            across the platform. Derived from the new brand identity.
          </p>
        </header>

        {/* SECTION: COLORS */}
        <section id="colors" className="mb-24">
          <h2 className="text-2xl font-medium mb-8 flex items-center gap-2">
            <Palette className="w-5 h-5 opacity-70" />
            Color Palette
          </h2>

          <div className="space-y-12">
            {/* Neutral Scales */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Neutral Scale (Base)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {[
                  {
                    name: 'neutral-50',
                    hex: '#fafafa',
                    class: 'bg-neutral-50 text-black',
                  },
                  {
                    name: 'neutral-100',
                    hex: '#f5f5f5',
                    class: 'bg-neutral-100 text-black',
                  },
                  {
                    name: 'neutral-200',
                    hex: '#e5e5e5',
                    class: 'bg-neutral-200 text-black',
                  },
                  {
                    name: 'neutral-300',
                    hex: '#d4d4d4',
                    class: 'bg-neutral-300 text-black',
                  },
                  {
                    name: 'neutral-400',
                    hex: '#a3a3a3',
                    class: 'bg-neutral-400 text-black',
                  },
                  {
                    name: 'neutral-500',
                    hex: '#737373',
                    class: 'bg-neutral-500 text-white',
                  },
                  {
                    name: 'neutral-600',
                    hex: '#525252',
                    class: 'bg-neutral-600 text-white',
                  },
                  {
                    name: 'neutral-700',
                    hex: '#404040',
                    class: 'bg-neutral-700 text-white',
                  },
                  {
                    name: 'neutral-800',
                    hex: '#262626',
                    class: 'bg-neutral-800 text-white',
                  },
                  {
                    name: 'neutral-900',
                    hex: '#171717',
                    class: 'bg-neutral-900 text-white',
                  },
                  {
                    name: 'neutral-950',
                    hex: '#0a0a0a',
                    class:
                      'bg-neutral-950 text-white border border-neutral-800',
                  },
                ].map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div
                      className={`h-24 rounded-lg shadow-sm ${color.class} flex items-end p-3`}
                    >
                      <span className="text-xs font-mono opacity-80">
                        {color.hex}
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
                Semantic Tokens
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-background border border-border flex items-center justify-center p-4">
                    <span className="text-foreground text-sm font-medium">
                      Background
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    --background
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-card border border-border text-card-foreground flex items-center justify-center p-4">
                    <span className="text-sm font-medium">Card Surface</span>
                  </div>
                  <div className="text-xs text-muted-foreground">--card</div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-primary text-primary-foreground flex items-center justify-center p-4">
                    <span className="text-sm font-medium">Primary</span>
                  </div>
                  <div className="text-xs text-muted-foreground">--primary</div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-destructive text-destructive-foreground flex items-center justify-center p-4">
                    <span className="text-sm font-medium">Destructive</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    --destructive
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: TYPOGRAPHY */}
        <section id="typography" className="mb-24">
          <h2 className="text-2xl font-medium mb-8 flex items-center gap-2">
            <span className="text-xl font-serif italic">Aa</span>
            Typography
          </h2>

          <div className="border border-border rounded-xl p-8 bg-card/30 backdrop-blur-sm space-y-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
                  Headings
                </h3>
                <div className="space-y-6">
                  <div>
                    <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1]">
                      Display XL
                    </h1>
                    <code className="text-xs text-muted-foreground mt-2 block">
                      text-7xl font-medium tracking-tight
                    </code>
                  </div>
                  <div>
                    <h2 className="text-4xl font-medium tracking-tight">
                      Heading L
                    </h2>
                    <code className="text-xs text-muted-foreground mt-2 block">
                      text-4xl font-medium tracking-tight
                    </code>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium tracking-tight">
                      Heading M
                    </h3>
                    <code className="text-xs text-muted-foreground mt-2 block">
                      text-2xl font-medium tracking-tight
                    </code>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium">Heading S</h4>
                    <code className="text-xs text-muted-foreground mt-2 block">
                      text-xl font-medium
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
                  Body & functional
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light">
                      <span className="text-foreground font-normal">
                        Lead Paragraph.
                      </span>{' '}
                      I&apos;m a full-stack developer passionate about building
                      accessible, pixel-perfect user interfaces that blend art
                      with engineering.
                    </p>
                    <code className="text-xs text-muted-foreground mt-2 block">
                      text-lg text-muted-foreground font-light
                    </code>
                  </div>
                  <div>
                    <p className="text-base text-foreground leading-relaxed">
                      <span className="text-foreground font-medium">
                        Body Regular.
                      </span>{' '}
                      Standard body text used for most content. Good readability
                      and contrast against the background.
                    </p>
                    <code className="text-xs text-muted-foreground mt-2 block">
                      text-base text-foreground
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-foreground font-medium">
                        Caption / Label.
                      </span>{' '}
                      Used for secondary information, timestamps, and UI labels.
                    </p>
                    <code className="text-xs text-muted-foreground mt-2 block">
                      text-sm text-muted-foreground
                    </code>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">
                      MONOSPACE_CODE_SNIPPET // v1.0.0
                    </p>
                    <code className="text-xs text-muted-foreground mt-2 block">
                      font-mono text-xs
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: BUTTONS & INTERACTION */}
        <section id="buttons" className="mb-24">
          <h2 className="text-2xl font-medium mb-8 flex items-center gap-2">
            <Box className="w-5 h-5 opacity-70" />
            Buttons & Interaction
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-card/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
                Button Variants
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                {/* Primary */}
                <Button>
                  Primary Action
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Secondary/Outline */}
                <Button variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Secondary
                </Button>

                {/* Danger */}
                <Button variant="destructive" size="sm">
                  Danger Action
                </Button>
              </div>
            </Card>

            <Card className="p-8 bg-card/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
                Navigation Links
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
                  <Button variant="link" className="text-muted-foreground p-0">
                    Link Idle
                  </Button>
                  <Button variant="link" className="text-foreground p-0">
                    Link Active
                  </Button>
                  <Button variant="link" className="text-muted-foreground p-0">
                    View details
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION: FORMS & INPUTS */}
        <section id="forms" className="mb-24">
          <h2 className="text-2xl font-medium mb-8 flex items-center gap-2">
            <Settings2 className="w-5 h-5 opacity-70" />
            Form Elements
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Input Field */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground block mb-2">
                  Project Name
                </Label>
                <div className="relative group">
                  <Input defaultValue="design-system-v1" />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-xs text-muted-foreground">.app</span>
                  </div>
                </div>
              </div>

              {/* Radio Cards */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground block mb-4">
                  Environment Selection
                </Label>
                <div className="space-y-3">
                  <label className="relative flex items-start gap-3 p-4 border border-border bg-card rounded-lg cursor-pointer transition-all hover:bg-accent/50">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="env"
                        className="peer h-4 w-4 border-input bg-background text-primary focus:ring-ring"
                        defaultChecked
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Box className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Node.js 18.x
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended for most Next.js applications.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Toggles */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground block mb-4">
                  Feature Toggles
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/20">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Automatic Deployments
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Deploy automatically on push.
                      </span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: CARDS & BENTO GRID */}
        <section id="cards" className="mb-24">
          <h2 className="text-2xl font-medium mb-8 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 opacity-70" />
            Cards & Layouts
          </h2>

          <div className="bento-grid auto-rows-[300px] mb-12">
            {/* Large Card */}
            <Card className="md:col-span-2 group relative border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-500 bg-neutral-900/40">
              <div className="absolute inset-0 bg-grid opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10"></div>

              {/* Abstract UI Mockup */}
              <div className="absolute top-12 left-12 right-0 bottom-0 bg-neutral-950 border-t border-l border-neutral-800 rounded-tl-xl p-4 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:-translate-x-2">
                <div className="flex gap-4 mb-6 border-b border-neutral-800 pb-4">
                  <div className="w-32 h-6 bg-neutral-900 rounded-md"></div>
                  <div className="w-12 h-6 bg-neutral-900 rounded-md ml-auto"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-neutral-900/50 rounded-lg border border-neutral-800/50"></div>
                  <div className="h-24 bg-neutral-900/50 rounded-lg border border-neutral-800/50"></div>
                  <div className="h-24 bg-neutral-900/50 rounded-lg border border-neutral-800/50"></div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="fintech">Fintech</Badge>
                </div>
                <h3 className="text-xl font-medium text-white">
                  Lumina Dashboard
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Real-time financial analytics platform.
                </p>
              </div>
            </Card>

            {/* Tall Card */}
            <Card className="md:row-span-2 md:col-span-1 min-h-[300px] group relative border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-500 bg-neutral-900/40">
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/20 to-transparent"></div>
              {/* ID Mockup */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-full bg-neutral-950 border-x border-t border-neutral-800 rounded-t-3xl p-3 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                <div className="w-full h-full bg-neutral-900/30 rounded-t-2xl border border-neutral-800/50 p-4 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800"></div>
                  <div className="w-2/3 h-2 bg-neutral-800 rounded-full"></div>
                  <div className="w-1/2 h-2 bg-neutral-800 rounded-full"></div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-xl font-medium text-white">Mobile Pay</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  iOS compatible wallet app.
                </p>
              </div>
            </Card>

            {/* Small Card */}
            <Card className="group relative border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-500 bg-neutral-900/40">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 p-4 bg-neutral-950 border border-neutral-800 rounded-lg shadow-xl font-mono text-xs text-neutral-500 opacity-60 group-hover:scale-105 transition-transform duration-500">
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                  </div>
                  <p>
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-blue-400">optimize</span> = () ={'>'}{' '}
                    {'{'}
                  </p>
                  <p className="pl-4">
                    return <span className="text-green-400">true</span>;
                  </p>
                  <p>{'}'}</p>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-xl font-medium text-white">DevTools CLI</h3>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
