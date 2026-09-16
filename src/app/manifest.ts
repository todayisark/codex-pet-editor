import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Codex Pet Sprite Editor',
    short_name: 'Pet Editor',
    description: 'Create Codex Pet sprite sheets locally in your browser.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d1117',
    theme_color: '#0d1117',
  };
}
