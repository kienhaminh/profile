import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { GoogleAdsScript } from '@/components/ads/GoogleAds';
import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kien Ha',
  description:
    'A full-stack developer studying AI. Building modern web applications with a focus on clean code and user experience.',
  keywords: [
    'full-stack developer',
    'AI',
    'web development',
    'clean code',
    'user experience',
  ],
  authors: [{ name: 'Kien Ha', url: 'https://kienha.com' }],
  creator: 'Kien Ha',
  publisher: 'Kien Ha',
  openGraph: {
    title: 'Kien Ha',
    description:
      'A full-stack developer studying AI. Building modern web applications with a focus on clean code and user experience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kien Ha',
    description:
      'A full-stack developer studying AI. Building modern web applications with a focus on clean code and user experience.',
    images: ['https://kienha.com/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://kienha.com',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    'max-snippet': -1,
  },
  category: 'technology',
  applicationName: 'Kien Ha',
  formatDetection: {
    telephone: false,
  },
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

  return (
    <html lang="en">
      <head>
        <GoogleAdsScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {measurementId && <GoogleAnalytics measurementId={measurementId} />}
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
