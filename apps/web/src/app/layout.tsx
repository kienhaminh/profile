import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { GoogleAdsScript } from '@/components/ads/GoogleAds';
import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter';
import { TRPCReactProvider } from '@/trpc/Provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { Toaster } from '@/components/ui/sonner';
import { WebsiteSchema, PersonSchema } from '@/components/seo/JsonLd';
import {
  generateMetadata,
  generateWebsiteSchema,
  SEO_CONFIG,
} from '@/config/seo';
import { inter, jetbrainsMono, spaceGrotesk } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  ...generateMetadata(),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    'max-snippet': -1,
  },
  category: 'technology',
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  other: {
    'theme-color': '#000000',
  },
};

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <GoogleAdsScript />
        <WebsiteSchema data={websiteSchema} />
        <PersonSchema data={SEO_CONFIG.organization} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {measurementId && <GoogleAnalytics measurementId={measurementId} />}
          <WebVitalsReporter />
          {/* Cosmic Starfield Background for Dark Matter Theme */}
          <div className="starfield" aria-hidden="true" />
          {/* Aurora Borealis Effect Layer */}
          <div className="aurora-layer" aria-hidden="true" />
          <div className="relative z-10">
            <TRPCReactProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </TRPCReactProvider>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
