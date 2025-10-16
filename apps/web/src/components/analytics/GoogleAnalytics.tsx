'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({
  measurementId,
}: GoogleAnalyticsProps): JSX.Element | null {
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Client-side analytics tracking functions
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as { gtag: (...args: unknown[]) => void }).gtag(
      'event',
      eventName,
      eventParams
    );
  }
}

export function trackPageView(url: string): void {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as { gtag: (...args: unknown[]) => void }).gtag(
      'config',
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
      {
        page_path: url,
      }
    );
  }
}
