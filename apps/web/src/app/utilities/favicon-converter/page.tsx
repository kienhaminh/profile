import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FaviconConverter } from '@/components/utilities/favicon-converter';

export const metadata: Metadata = {
  title: 'Favicon Converter - PNG to Favicon Generator',
  description:
    'Free online favicon generator. Convert PNG images to all favicon formats including ICO, Apple Touch Icon, Android Chrome icons, and Windows tiles.',
};

export default function FaviconConverterPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/utilities"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Utilities
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Favicon <span className="text-primary">Converter</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate all favicon formats for every platform. Upload your image
            and download favicons for browsers, iOS, Android, and Windows.
          </p>
        </div>

        {/* Tool Component */}
        <FaviconConverter />
      </div>
    </div>
  );
}
