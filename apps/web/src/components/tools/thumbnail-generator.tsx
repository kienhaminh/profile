'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Upload,
  Image as ImageIcon,
  Type,
  Palette,
} from 'lucide-react';
import { toPng } from 'html-to-image';

export function ThumbnailGenerator() {
  const [title, setTitle] = useState('How to Build a Modern Web App');
  const [subtitle, setSubtitle] = useState(
    'A comprehensive guide to Next.js 14'
  );
  const [theme, setTheme] = useState<'light' | 'dark' | 'custom'>('dark');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (previewRef.current) {
      try {
        const dataUrl = await toPng(previewRef.current, { cacheBust: true });
        const link = document.createElement('a');
        link.download = 'thumbnail.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate thumbnail', err);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
        setTheme('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Content</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-xs text-muted-foreground"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="subtitle"
                    className="text-xs text-muted-foreground"
                  >
                    Subtitle
                  </Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter subtitle..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Appearance</Label>
              <Tabs defaultValue="theme" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="theme">Theme</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
                <TabsContent value="theme" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => {
                        setTheme('light');
                        setBackgroundImage(null);
                      }}
                      className="w-full"
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => {
                        setTheme('dark');
                        setBackgroundImage(null);
                      }}
                      className="w-full"
                    >
                      Dark
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="custom" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Background Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value);
                          setTheme('custom');
                          setBackgroundImage(null);
                        }}
                        className="w-12 h-12 p-1 cursor-pointer"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value);
                          setTheme('custom');
                          setBackgroundImage(null);
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Background Image
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="bg-upload"
                      />
                      <Button
                        asChild
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        <label htmlFor="bg-upload">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </label>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Button onClick={handleDownload} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Thumbnail
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden bg-muted/50">
          <CardContent className="p-6 flex items-center justify-center min-h-[400px]">
            <div
              ref={previewRef}
              className="w-[1200px] h-[630px] relative flex flex-col items-center justify-center p-16 text-center shadow-2xl origin-center transform scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.7] xl:scale-[0.8] transition-transform"
              style={{
                backgroundColor:
                  theme === 'light'
                    ? '#ffffff'
                    : theme === 'dark'
                      ? '#09090b'
                      : backgroundColor,
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: theme === 'light' ? '#000000' : '#ffffff',
              }}
            >
              <div className="relative z-10 max-w-4xl">
                <h1
                  className="text-7xl font-bold tracking-tight mb-6 leading-tight"
                  style={{
                    textShadow: backgroundImage
                      ? '0 4px 12px rgba(0,0,0,0.5)'
                      : undefined,
                  }}
                >
                  {title || 'Your Title Here'}
                </h1>
                <p
                  className="text-3xl opacity-90 font-medium"
                  style={{
                    textShadow: backgroundImage
                      ? '0 2px 8px rgba(0,0,0,0.5)'
                      : undefined,
                  }}
                >
                  {subtitle || 'Your subtitle goes here'}
                </p>
              </div>

              {/* Decorative elements */}
              {!backgroundImage && (
                <>
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <div className="absolute bottom-0 right-0 p-8 opacity-10">
                    <ImageIcon className="w-32 h-32" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Preview scaled to fit. Actual output is 1200x630px (Open Graph
          standard).
        </p>
      </div>
    </div>
  );
}
