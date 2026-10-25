import type { Metadata } from 'next';
import React from 'react';
import LearnMoreClient from '@/components/LearnMoreClient';

export const metadata: Metadata = {
  title: 'Mechanical Keyboard Switch Anatomy & Architecture Guide',
  description:
    'Comprehensive engineering guide to mechanical keyboard switches: linear vs tactile vs clicky acoustics, stem physics, spring weight, and digital sound synthesis architecture.',
  alternates: {
    canonical: 'https://thocktype.vercel.app/learn-more',
  },
  openGraph: {
    title: 'Mechanical Keyboard Switch Anatomy & Architecture Guide | THOCKTYPE',
    description:
      'Explore mechanical switch acoustics, stem dynamics, actuation force curves, and digital audio synthesis.',
    url: 'https://thocktype.vercel.app/learn-more',
  },
};

export default function LearnMorePage() {
  return <LearnMoreClient />;
}
