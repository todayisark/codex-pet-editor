import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { GoogleAnalytics } from '@/components/google-analytics';
import { siteDescription, siteName, siteUrl } from '@/lib/site-config';
import './globals.css';
import '@/styles/site.css';
import '@/styles/editor.css';
import '@/styles/sprite-sheet.css';
import '@/styles/editor-panels.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteName,
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    'Codex Pet',
    'Codex pet editor',
    'sprite sheet editor',
    'sprite sheet generator',
    'animated pet',
    'WebP sprite sheet',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
};

export default RootLayout;
