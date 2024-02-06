import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Web Push Sample',
    short_name: 'WebPushSample',
    description: 'A sample app for testing web push notifications.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#3b43ff',
    icons: [
      {
        src: 'favicon.ico',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
