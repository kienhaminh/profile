import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kien Ha Portfolio',
    short_name: 'Kien Ha',
    description: 'Portfolio of Kien Ha - Full Stack Developer & AI Engineer',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0e1a',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
