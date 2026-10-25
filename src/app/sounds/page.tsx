import type { Metadata } from 'next';
import React from 'react';
import SoundLabClient from '@/components/SoundLabClient';

export const metadata: Metadata = {
  title: 'Mechanical Switch Sound Lab & Acoustic Simulator',
  description:
    'Audition and test authentic mechanical keyboard switch sounds online. Interactive switch library featuring Holy Panda, Cherry MX Blue, Ink Black, Topre, and Cream Clack with stereo audio and deskmat acoustic simulation.',
  alternates: {
    canonical: 'https://thocktype.vercel.app/sounds',
  },
  openGraph: {
    title: 'Mechanical Switch Sound Lab & Acoustic Simulator | THOCKTYPE',
    description:
      'Audition and test authentic mechanical keyboard switch sounds online. Interactive switch studio with deskmat resonance and multi-sample audio.',
    url: 'https://thocktype.vercel.app/sounds',
  },
};

export default function SoundLabPage() {
  return <SoundLabClient />;
}
