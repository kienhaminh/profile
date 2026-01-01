import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { GoogleAdsScript } from '@/components/ads/GoogleAds';
import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter';
import { VisitorTracker } from '@/components/analytics/VisitorTracker';
import { TRPCReactProvider } from '@/trpc/Provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { Toaster } from '@/components/ui/sonner';
import { AmbientBackground } from '@/components/ui/ambient-background';
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
  manifest: '/site.webmanifest',
  // Icons auto-detected from app/ directory via Next.js file-based metadata:
  // - app/icon.svg (32x32) → Modern browsers, auto-scaled
  // - app/favicon.ico → Legacy browser fallback
  // - app/apple-icon.png (180x180) → iOS home screen
  // No manual icon config needed - Next.js handles it automatically!
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    'max-snippet': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  category: 'technology',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  appleWebApp: {
    capable: true,
    title: 'Kien Ha',
    statusBarStyle: 'black-translucent',
  },
  applicationName: 'Kien Ha Portfolio',
  other: {
    'msapplication-TileColor': '#5b4fce',
    'msapplication-config': '/browserconfig.xml',
  },
};

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#f8f9fb' },
      { media: '(prefers-color-scheme: dark)', color: '#0d0e1a' },
    ],
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased selection:bg-primary/20 selection:text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AmbientBackground />
          {measurementId && <GoogleAnalytics measurementId={measurementId} />}
          <WebVitalsReporter />
          <VisitorTracker />
          <div className="relative">
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
