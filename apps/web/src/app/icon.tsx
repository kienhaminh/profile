import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 360,
          background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 100,
        }}
      >
        <span
          style={{
            background:
              'linear-gradient(135deg, #22d3ee 0%, #6366f1 50%, #ec4899 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 800,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          K
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
