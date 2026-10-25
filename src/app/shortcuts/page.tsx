import type { Metadata } from 'next';
import React from 'react';
import ShortcutsClient from '@/components/ShortcutsClient';

export const metadata: Metadata = {
  title: 'Keyboard Shortcuts & Speed Navigation Guide',
  description:
    'Master high-speed keyboard shortcuts for THOCKTYPE. Learn home-row test restarts (Tab+Enter), instant switch hotkeys (Alt+1-8), and Zen Focus full-screen mode.',
  alternates: {
    canonical: 'https://thocktype.vercel.app/shortcuts',
  },
  openGraph: {
    title: 'Keyboard Shortcuts & Speed Navigation Guide | THOCKTYPE',
    description:
      'Master high-speed keyboard shortcuts for instant test restarts, switch sound selection, and Zen full-screen mode.',
    url: 'https://thocktype.vercel.app/shortcuts',
  },
};

export default function ShortcutsPage() {
  return <ShortcutsClient />;
}
