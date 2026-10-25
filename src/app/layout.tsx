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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thocktype.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'THOCKTYPE — Unlimited Typing Test & Mechanical Keyboard Sound Lab',
    template: '%s | THOCKTYPE',
  },
  description:
    'Free online typing site where you can type for unlimited time. Practice typing endlessly with 8 authentic mechanical switch acoustics (thock & clack), zero signup, infinite word generation, and sub-millisecond precision.',
  keywords: [
    'typing site where I can type for unlimited time',
    'unlimited typing site',
    'unlimited typing test',
    'infinite typing test',
    'endless typing test',
    'type forever typing test',
    'free typing without timer',
    'typing test unlimited time',
    'continuous typing practice',
    'zen typing test',
    'mechanical keyboard sound test',
    'typing test',
    'thock',
    'clack',
    'holy panda switch sound',
    'cherry mx blue sound test',
    'midnight thock',
    'cream clack',
    'typelouder',
    'monkeytype unlimited alternative',
    'custom text typing test'
  ],
  authors: [{ name: 'THOCKTYPE Audio & Performance Team' }],
  creator: 'THOCKTYPE',
  publisher: 'THOCKTYPE',
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'THOCKTYPE — Unlimited Typing Test & Mechanical Keyboard Sound Lab',
    description:
      'Free online typing site where you can type for unlimited time. Practice typing endlessly with authentic mechanical switch acoustics (thock & clack), zero signup, and sub-millisecond precision.',
    url: baseUrl,
    siteName: 'THOCKTYPE',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/banner.svg',
        width: 1200,
        height: 630,
        alt: 'THOCKTYPE — Unlimited Typing Test with Mechanical Keyboard Sound Simulation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THOCKTYPE — Unlimited Typing Test & Mechanical Keyboard Sound Lab',
    description:
      'Free typing site where you can type for unlimited time. Endless word generation, 8 mechanical switch sound packs, and zero signup.',
    images: ['/banner.svg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

const jsonLdData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'THOCKTYPE',
    alternateName: [
      'Typelouder',
      'Unlimited Typing Test',
      'Thock Type',
      'Infinite Typing Site',
      'Mechanical Keyboard Typing Lab',
    ],
    url: baseUrl,
    description:
      'The best free mechanical keyboard sound typing test site where you can type for unlimited time. Practice typing endlessly with real thock & clack mechanical switch acoustics, zero signup, and sub-millisecond precision.',
    applicationCategory: 'GameApplication, EducationalApplication, UtilityApplication',
    operatingSystem: 'All (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Unlimited time typing test (type forever without timer or limits)',
      'Endless continuous word stream with zero word exhaustion',
      'Eight authentic mechanical switch sound profiles (Holy Panda, Cherry MX Blue, Ink Black, Topre, etc.)',
      'Custom text practice mode (paste your own text, essays, or code)',
      'Zen Focus distraction-free full-screen mode',
      'Sub-millisecond mathematical benchmark engine (Net WPM, Gross WPM, accuracy, consistency)',
      'Zero signup, 100% private local analytics, streaks, and milestone badges',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a typing site where I can type for unlimited time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'THOCKTYPE (https://thocktype.com/unlimited or https://thocktype.com/test) is a free typing site where you can type for unlimited time with zero time limits, zero countdowns, and infinite word generation. You can practice continuously at your own pace for as long as you want.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I start an unlimited typing test without a timer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Visit https://thocktype.com/unlimited directly, or on https://thocktype.com/test select the "unlimited" mode button on the test toolbar. You can also press Alt+F to open Zen Focus mode and choose "unlimited" to type in full-screen with no distractions.',
        },
      },
      {
        '@type': 'Question',
        name: 'What keyboard sounds does THOCKTYPE simulate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'THOCKTYPE simulates 8 authentic physical mechanical switch profiles: Frost Click (Cherry MX Blue), Ruby Thock (Holy Panda), Midnight Thock (Gateron Ink Black), Cream Clack (NovelKeys Cream), Chestnut Mute (Silent Alpacas), Glacier Pop (Kailh Box White), Onyx Deep (Topre Electrostatic), and Alpine Clack (Gateron Yellow) with spatial stereo panning and spring return physics.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I paste my own custom text or code to practice typing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! THOCKTYPE includes a Custom Text mode where you can paste your own text, homework, essay, or programming code to type with realistic mechanical keyboard sounds and full speed diagnostics.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is THOCKTYPE free and does it require an account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'THOCKTYPE is 100% free with zero signup, zero telemetric tracking, and zero ads. All your typing history, personal bests, and milestone badges are stored privately in your local browser storage.',
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark antialiased`} suppressHydrationWarning>
      <head>
        {jsonLdData.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
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
