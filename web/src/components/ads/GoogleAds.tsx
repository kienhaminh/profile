'use client';

import { useEffect } from 'react';

interface GoogleAdsProps {
  slot: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
}

export function GoogleAds({
  slot,
  style,
  format = 'auto',
  responsive = true,
}: GoogleAdsProps): JSX.Element | null {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID;

  useEffect(() => {
    if (clientId && typeof window !== 'undefined') {
      try {
        ((window as { adsbygoogle?: unknown[] }).adsbygoogle =
          (window as { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
      } catch (error) {
        console.error('Google Ads error:', error);
      }
    }
  }, [clientId]);

  if (!clientId || !slot) {
    return null;
  }

  return (
    <div className="my-6 max-w-full overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          ...style,
        }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}

export function GoogleAdsScript(): JSX.Element | null {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}
