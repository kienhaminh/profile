import { MetadataRoute } from 'next';
import icon192 from '@/assets/favicon/android-chrome-192x192.png';
import icon512 from '@/assets/favicon/android-chrome-512x512.png';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kien Ha Portfolio',
    short_name: 'Kien Ha',
    description: 'Portfolio of Kien Ha - Full Stack Developer & AI Engineer',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: icon192.src,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: icon512.src,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
