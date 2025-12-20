'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Upload,
  Download,
  Copy,
  Check,
  ImageIcon,
  FileArchive,
  Globe,
  Smartphone,
  Apple,
  MonitorSmartphone,
  FileIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface FaviconConverterProps {
  className?: string;
}

interface GeneratedFavicon {
  name: string;
  size: number;
  dataUrl: string;
  purpose: string;
  icon: React.ReactNode;
  isIco?: boolean;
}

const FAVICON_SIZES = [
  {
    name: 'favicon-16x16.png',
    size: 16,
    purpose: 'Browser tab (small)',
    icon: <Globe className="w-4 h-4" />,
  },
  {
    name: 'favicon-32x32.png',
    size: 32,
    purpose: 'Browser tab (standard)',
    icon: <Globe className="w-4 h-4" />,
  },
  {
    name: 'favicon-48x48.png',
    size: 48,
    purpose: 'Browser shortcut',
    icon: <Globe className="w-4 h-4" />,
  },
  {
    name: 'mstile-150x150.png',
    size: 150,
    purpose: 'Windows tile',
    icon: <MonitorSmartphone className="w-4 h-4" />,
  },
  {
    name: 'apple-touch-icon.png',
    size: 180,
    purpose: 'iOS home screen',
    icon: <Apple className="w-4 h-4" />,
  },
  {
    name: 'android-chrome-192x192.png',
    size: 192,
    purpose: 'Android Chrome',
    icon: <Smartphone className="w-4 h-4" />,
  },
  {
    name: 'android-chrome-512x512.png',
    size: 512,
    purpose: 'Android splash screen',
    icon: <Smartphone className="w-4 h-4" />,
  },
];

// ICO sizes to include in the multi-size .ico file
const ICO_SIZES = [16, 32, 48];

const HTML_SNIPPET = `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="theme-color" content="#ffffff">`;

const MANIFEST_SNIPPET = `{
  "name": "Your App Name",
  "short_name": "App",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}`;

// Helper function to create an ICO file from multiple PNG images
async function createIcoFile(
  pngDataUrls: { size: number; dataUrl: string }[]
): Promise<Blob> {
  const pngBlobs: { size: number; data: Uint8Array }[] = [];

  // Convert data URLs to Uint8Array
  for (const { size, dataUrl } of pngDataUrls) {
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    pngBlobs.push({ size, data: bytes });
  }

  // ICO file structure:
  // - ICONDIR header (6 bytes)
  // - ICONDIRENTRY for each image (16 bytes each)
  // - PNG data for each image

  const numImages = pngBlobs.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + numImages * dirEntrySize;

  // Calculate total file size
  let totalSize = dirSize;
  for (const { data } of pngBlobs) {
    totalSize += data.length;
  }

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // Reserved, must be 0
  view.setUint16(2, 1, true); // Image type: 1 = icon
  view.setUint16(4, numImages, true); // Number of images

  // ICONDIRENTRY for each image and copy PNG data
  let imageOffset = dirSize;
  for (let i = 0; i < numImages; i++) {
    const { size, data } = pngBlobs[i];
    const entryOffset = headerSize + i * dirEntrySize;

    // ICONDIRENTRY structure
    view.setUint8(entryOffset + 0, size < 256 ? size : 0); // Width (0 means 256)
    view.setUint8(entryOffset + 1, size < 256 ? size : 0); // Height (0 means 256)
    view.setUint8(entryOffset + 2, 0); // Color palette (0 = no palette)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, data.length, true); // Image size in bytes
    view.setUint32(entryOffset + 12, imageOffset, true); // Offset to image data

    // Copy PNG data
    uint8.set(data, imageOffset);
    imageOffset += data.length;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

export function FaviconConverter({ className }: FaviconConverterProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedFavicons, setGeneratedFavicons] = useState<
    GeneratedFavicon[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFavicons = useCallback(async (imageDataUrl: string) => {
    setIsProcessing(true);

    try {
      const img = document.createElement('img');

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageDataUrl;
      });

      const favicons: GeneratedFavicon[] = [];
      const icoImages: { size: number; dataUrl: string }[] = [];

      // Generate PNG images for all sizes
      for (const sizeConfig of FAVICON_SIZES) {
        const canvas = document.createElement('canvas');
        canvas.width = sizeConfig.size;
        canvas.height = sizeConfig.size;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Enable high-quality image scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw the image scaled to the target size
          ctx.drawImage(img, 0, 0, sizeConfig.size, sizeConfig.size);

          const dataUrl = canvas.toDataURL('image/png');

          // Collect images for ICO file
          if (ICO_SIZES.includes(sizeConfig.size)) {
            icoImages.push({ size: sizeConfig.size, dataUrl });
          }

          favicons.push({
            name: sizeConfig.name,
            size: sizeConfig.size,
            dataUrl,
            purpose: sizeConfig.purpose,
            icon: sizeConfig.icon,
          });
        }
      }

      // Generate the ICO file (multi-size)
      if (icoImages.length > 0) {
        const icoBlob = await createIcoFile(icoImages);
        const icoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(icoBlob);
        });

        // Add ICO file at the beginning of the list
        favicons.unshift({
          name: 'favicon.ico',
          size: 0, // Multi-size
          dataUrl: icoDataUrl,
          purpose: 'Classic favicon (multi-size)',
          icon: <FileIcon className="w-4 h-4" />,
          isIco: true,
        });
      }

      setGeneratedFavicons(favicons);
      setIsProcessing(false);
      toast.success('Favicons generated successfully!');
    } catch (error) {
      console.error('Error generating favicons:', error);
      setIsProcessing(false);
      toast.error('Failed to process image. Please try a different file.');
    }
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setOriginalImage(dataUrl);
        generateFavicons(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [generateFavicons]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const downloadSingleFavicon = useCallback((favicon: GeneratedFavicon) => {
    const link = document.createElement('a');
    link.href = favicon.dataUrl;
    link.download = favicon.name;
    link.click();
    toast.success(`Downloaded ${favicon.name}`);
  }, []);

  const downloadAllAsZip = useCallback(async () => {
    if (generatedFavicons.length === 0) return;

    const zip = new JSZip();

    // Add all PNG favicons
    for (const favicon of generatedFavicons) {
      const base64Data = favicon.dataUrl.split(',')[1];
      zip.file(favicon.name, base64Data, { base64: true });
    }

    // Add site.webmanifest
    zip.file('site.webmanifest', MANIFEST_SNIPPET);

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'favicons.zip';
    link.click();
    URL.revokeObjectURL(link.href);

    toast.success('Downloaded all favicons as ZIP!');
  }, [generatedFavicons]);

  const copyToClipboard = useCallback(
    async (text: string, type: 'html' | 'manifest') => {
      await navigator.clipboard.writeText(text);
      if (type === 'html') {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
      } else {
        setCopiedManifest(true);
        setTimeout(() => setCopiedManifest(false), 2000);
      }
      toast.success('Copied to clipboard!');
    },
    []
  );

  const reset = useCallback(() => {
    setOriginalImage(null);
    setGeneratedFavicons([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Image
          </CardTitle>
          <CardDescription>
            Upload a PNG or JPG image (recommended: 512x512 or larger, square)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {originalImage ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border shadow-lg">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                  >
                    Upload Different Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop your image here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG, SVG • Recommended: 512x512px square
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Generating favicons...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Favicons Preview */}
      {generatedFavicons.length > 0 && !isProcessing && (
        <>
          {/* Browser Tab Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Browser Preview
              </CardTitle>
              <CardDescription>
                See how your favicon looks in a browser tab
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-t-lg p-2 flex items-center gap-2 max-w-md">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-background rounded-md px-3 py-1.5 flex items-center gap-2 shadow-sm">
                  <img
                    src={generatedFavicons.find((f) => f.size === 16)?.dataUrl}
                    alt="Favicon preview"
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-muted-foreground truncate">
                    Your Website Title
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Sizes Grid */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Generated Favicons
                </CardTitle>
                <CardDescription>
                  Click on any favicon to download it individually
                </CardDescription>
              </div>
              <Button
                onClick={downloadAllAsZip}
                className="flex items-center gap-2"
              >
                <FileArchive className="w-4 h-4" />
                Download All (ZIP)
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedFavicons.map((favicon) => (
                  <div
                    key={favicon.name}
                    className="group relative border rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer bg-card"
                    onClick={() => downloadSingleFavicon(favicon)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="flex items-center justify-center bg-muted rounded-lg p-2"
                        style={{ minHeight: '80px', minWidth: '80px' }}
                      >
                        <img
                          src={favicon.dataUrl}
                          alt={favicon.name}
                          className="max-w-full max-h-full"
                          style={{
                            width: favicon.isIco
                              ? 48
                              : Math.min(favicon.size, 64),
                            height: favicon.isIco
                              ? 48
                              : Math.min(favicon.size, 64),
                            imageRendering:
                              !favicon.isIco && favicon.size <= 32
                                ? 'pixelated'
                                : 'auto',
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground truncate max-w-full">
                          {favicon.name}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {favicon.icon}
                          <span className="text-xs text-muted-foreground">
                            {favicon.isIco
                              ? '16/32/48'
                              : `${favicon.size}x${favicon.size}`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {favicon.purpose}
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Download className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Code Snippets */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* HTML Snippet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    HTML Meta Tags
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(HTML_SNIPPET, 'html')}
                    className="flex items-center gap-2"
                  >
                    {copiedHtml ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedHtml ? 'Copied!' : 'Copy'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Add these to your HTML &lt;head&gt;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code className="text-foreground">{HTML_SNIPPET}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Manifest Snippet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Web Manifest
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(MANIFEST_SNIPPET, 'manifest')
                    }
                    className="flex items-center gap-2"
                  >
                    {copiedManifest ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedManifest ? 'Copied!' : 'Copy'}
                  </Button>
                </CardTitle>
                <CardDescription>Save as site.webmanifest</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-48">
                  <code className="text-foreground">{MANIFEST_SNIPPET}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
