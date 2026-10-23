import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SoundProvider } from '@/context/sound-context';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GlobalShortcuts } from '@/components/GlobalShortcuts';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#121314',
};

export const metadata: Metadata = {
  title: 'THOCKTYPE — Mechanical Keyboard Sound & Typing Lab',
  description:
    'Experience authentic acoustic profiles of eight distinct mechanical switches. Test your typing speed and accuracy with real multi-sample sound feedback, spatial panning, and spring release acoustics.',
  keywords: [
    'mechanical keyboard sound test',
    'typing test',
    'thock',
    'clack',
    'frost click',
    'ruby thock',
    'midnight thock',
    'cream clack',
    'typelouder',
    'monkeytype'
  ],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#121314] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <SoundProvider>
          <GlobalShortcuts />
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </SoundProvider>
      </body>
    </html>
  );
}
