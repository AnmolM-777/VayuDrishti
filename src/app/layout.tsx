import type { Metadata, Viewport } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import './globals.css';


const geistSans = Geist({
  variable: '--font-geist-sans',
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
      className={cn(geistSans.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-dvh font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
