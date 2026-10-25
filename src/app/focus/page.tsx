import type { Metadata } from 'next';
import React from 'react';
import FocusClient from '@/components/FocusClient';

export const metadata: Metadata = {
  title: 'Zen Focus Mode — Distraction-Free Fullscreen Typing',
  description:
    'Distraction-free fullscreen typing environment. Zero clutter, pure text stream, and authentic mechanical keyboard switch audio (thock & clack) for deep focus and flow state.',
  alternates: {
    canonical: 'https://thocktype.vercel.app/focus',
  },
  openGraph: {
    title: 'Zen Focus Mode — Distraction-Free Fullscreen Typing | THOCKTYPE',
    description:
      'Enter flow state with distraction-free fullscreen typing and authentic mechanical keyboard acoustics.',
    url: 'https://thocktype.vercel.app/focus',
  },
};

export default function FocusPage() {
  return <FocusClient />;
}
