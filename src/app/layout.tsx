import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VayuDrishti — AI-powered Pollution Intelligence',
    template: '%s | VayuDrishti',
  },
  description:
    'VayuDrishti (वायुदृष्टि) is an AI-powered hyperlocal pollution intelligence platform that detects pollution sources, predicts air quality, and dispatches municipal resources.',
  keywords: [
    'pollution',
    'air quality',
    'AQI',
    'hyperlocal',
    'AI',
    'municipal',
    'heatmap',
    'India',
    'VayuDrishti',
  ],
  authors: [{ name: 'VayuDrishti Team' }],
  openGraph: {
    title: 'VayuDrishti — AI-powered Pollution Intelligence',
    description:
      'Detect pollution sources, predict air quality spikes, and dispatch municipal cleanup resources with AI.',
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
